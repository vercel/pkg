import bufferStream from 'simple-bufferstream';
import chip from 'child_process';
import fs from 'fs';
import multistream from 'multistream';
import { wasReported } from './log.js';

const prepend = '(function(process, require, console) {\n';
const append = '\n})'; // dont remove \n
const boundary = 4096;

const script = `
  var stdin = new Buffer(0);
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
    if (!s.cachedDataProduced) {
      console.error('Pkg: Cached data not produced.');
      process.exit(2);
    }
    var sentinel = new Buffer(16);
    sentinel.writeInt32LE(0x26e0c928, 0);
    sentinel.writeInt32LE(0x41f32b66, 4);
    sentinel.writeInt32LE(0x3ea13ccf, 8);
    sentinel.writeInt32LE(s.cachedData.length, 12);
    var boundary = ${boundary};
    var size = sentinel.length + s.cachedData.length;
    var remainder = size % boundary;
    var padding = (remainder === 0 ? 0 : boundary - remainder);
    process.stdout.write(sentinel);
    process.stdout.write(s.cachedData);
    process.stdout.write(new Buffer(padding));
  });
  process.stdin.resume();
`;

function paddingBuffer (size) {
  const remainder = size % boundary;
  const padding = (remainder === 0 ? 0 : boundary - remainder);
  return Buffer.alloc(padding);
}

function bakeryFromOptions (options) {
  if (!Buffer.alloc) {
    throw wasReported('Your node.js does not have Buffer.alloc. Please upgrade!');
  }

  const parts = [];
  for (let i = 0; i < options.length; i += 1) {
    parts.push(Buffer.from(options[i]));
    parts.push(Buffer.alloc(1));
  }
  parts.push(Buffer.alloc(1));
  const bakery = Buffer.concat(parts);

  const sentinel = new Buffer(16);
  sentinel.writeInt32LE(0x4818c4df, 0);
  sentinel.writeInt32LE(0x7ac30670, 4);
  sentinel.writeInt32LE(0x56558a76, 8);
  sentinel.writeInt32LE(bakery.length, 12);
  return Buffer.concat([ sentinel, bakery ]);
}

export default function ({ stripe, options, target }) {
  return new Promise((resolve, reject) => {
    const { size } = fs.statSync(target.binaryPath);
    const bakery = bakeryFromOptions(options);

    multistream([
      fs.createReadStream(target.binaryPath),
      () => bufferStream(paddingBuffer(size)),
      () => bufferStream(bakery),
      () => bufferStream(paddingBuffer(bakery.length)),
      () => {
        // TODO streams? from packer?
        // using multistream factory?
        stripe = stripe.join('');
        const cmd = target.fabricator.binaryPath;
        const child = chip.spawn(
          cmd, [ '-e', script, '--runtime' ].concat(options),
          { stdio: [ 'pipe', 'pipe', 'inherit' ] }
        );

        child.on('error', (error) => {
          reject(error);
        }).on('close', (code) => {
          if (code !== 0) {
            return reject(new Error(`${cmd} failed with code ${code}`));
          }
          resolve();
        });

        child.stdin.on('error', (error) => {
          if (error.code === 'EPIPE') {
            return reject(new Error(`Was not able to compile for '${JSON.stringify(target)}'`));
          }
          reject(error);
        });

        child.stdin.write(prepend);
        child.stdin.write(stripe);
        child.stdin.write(append);
        child.stdin.end();
        return child.stdout;
      }
    ]).pipe(
      fs.createWriteStream(target.output)
    ).on('error', (error) => {
      reject(error);
    });
  });
}
