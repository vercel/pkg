import chipo from 'child_process';
import fs from 'fs';
import multistream from 'multistream';

const prepend = '(function(process, require, console) {\n';
const append = '\n})'; // dont remove \n

const script = `
  let stdin = new Buffer(0);
  process.stdin.on('data', function (data) {
    // TODO compare it with concat-stream approach
    stdin = Buffer.concat([ stdin, data ]);
  });
  process.stdin.on('end', function (data) {
    var vm = require('vm');
    var s = new vm.Script(stdin, {
      produceCachedData: true,
      sourceless: true
    });
    // TODO check for reject
    const prologue = new Buffer(16);
    prologue.writeInt32LE(0x26e0c928, 0);
    prologue.writeInt32LE(0x41f32b66, 4);
    prologue.writeInt32LE(0x3ea13ccf, 8);
    prologue.writeInt32LE(s.cachedData.length, 12);
    process.stdout.write(prologue); // TODO padding?
    process.stdout.write(s.cachedData);
  });
  process.stdin.resume();
`;

export default async function ({ stripe, target }) {

  // TODO streams? from packer?
  // using miltistream factory?
  stripe = stripe.join('');

  await new Promise((resolve, reject) => {

    const cmd = target.fabricator.binaryPath;
    const child = chipo.spawn(
      cmd, [ '-e', script ],
      { stdio: [ 'pipe', 'pipe', 'inherit' ] }
    );

    multistream([
      fs.createReadStream(target.binaryPath),
      child.stdout
    ]).pipe(
      fs.createWriteStream(target.output)
    ).on('error', (error) => {
      reject(error);
    }).on('close', () => {
      resolve();
    });

    child.on('error', (error) => {
      reject(error);
    });
    child.on('close', (code) => {
      if (code) {
        return reject(new Error(`${cmd} failed with code ${code}`));
      }
    });

    child.stdin.write(prepend);
    child.stdin.write(stripe);
    child.stdin.write(append);
    child.stdin.end();

  });

}
