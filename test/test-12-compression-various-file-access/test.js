'use strict';

const path = require('path');
const fs = require('fs');

const file = path.join(__dirname, 'myfile.txt');
const binaryFile = path.join(__dirname, 'myfile.bin');

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

async function readbinaryFile() {
  const fd = fs.openSync(binaryFile, 'r');

  const buf = Buffer.alloc(25);
  fs.readSync(fd, buf, 0, buf.length, 10);
  fs.closeSync(fd);

  console.log(buf.toString('hex'));
  console.log('readbinaryFile done !');
}

async function readbinaryFileWithStream() {
  const stream = fs.createReadStream(binaryFile, {
    encoding: 'hex',
    start: 10,
    end: 34,
  });
  stream.on('data', (data) => {
    console.log(data.toString());
  });
  await new Promise((resolve) => {
    stream.on('end', resolve);
  });
  console.log('readbinaryFileWithStream done !');
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
  console.log('--------------- readbinaryFile');
  await readbinaryFile();
  console.log('--------------- readbinaryFileWithStream');
  await readbinaryFileWithStream();
})();
