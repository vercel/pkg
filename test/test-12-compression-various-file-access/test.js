'use strict';

const path = require('path');
const fs = require('fs');

const file = path.join(__dirname, 'myfile.txt');

function withReadFileSync() {
  const wholeFile = fs.readFileSync(file, 'ascii');
  console.log(wholeFile);
  console.log('withReadFileSync done !');
}

async function withDirectAccess() {
  try {
    const buffer = Buffer.alloc(1000);
    const fd = fs.openSync(file);
    fs.readSync(fd, buffer, 0, buffer.length, 10);
    fs.closeSync(fd);
    console.log(buffer.toString('ascii'));
  } catch (err) {
    console.log(err.message);
    console.log(err);
  }
  console.log('withDirectAccess ! done!');
}

async function withReadStream() {
  const stream = fs.createReadStream(
    file /* { start: 10, encoding: "ascii" } */
  );
  stream.on('data', (data) => {
    console.log(data.toString());
  });
  await new Promise((resolve) => {
    stream.on('end', resolve);
  });
  console.log('withReadStream done !');
}
async function withReadStream2() {
  const stream = fs.createReadStream(file, { start: 10, encoding: 'ascii' });
  stream.on('data', (data) => {
    console.log(data.toString());
  });
  await new Promise((resolve) => {
    stream.on('end', resolve);
  });
  console.log('withReadStream done !');
}

(async () => {
  console.log('--------------- withReadFileSync');
  await withReadFileSync();
  console.log('--------------- withReadStream');
  await withReadStream();
  console.log('--------------- withDirectAccess');
  await withDirectAccess();
  console.log('--------------- withReadStream2');
  await withReadStream2();
})();
