'use strict';

const path = require('path');

let fs_promises;
const MAJOR_VERSION = parseInt(process.version.match(/v([0-9]+)/)[1], 10);

if (MAJOR_VERSION >= 14) {
  // only work with nodeJs >= 14.0
  fs_promises = require('fs/promises');
} else {
  fs_promises = require('fs').promises;
}

// note: this file will be packed in the virtual file system by PKG
const file = path.join(__dirname, 'myfile.txt');

async function withPromises() {
  // note : the fs.promise API is quite changing between node12/node14 etc...
  let fd;
  try {
    fd = await fs_promises.open(file, 'r');
    // Do something with the file
    const buffer = Buffer.alloc(1000);

    if (MAJOR_VERSION >= 14) {
      // eslint-disable-line no-unused-vars
      const { bytesRead } = await fd.read(buffer, 0, buffer.length, 10);
      if (process.env.DEBUG) {
        console.log('bytesRead = ', bytesRead);
      }
    } else {
      await fd.read(buffer, 0, buffer.length, 10);
    }
    console.log(buffer.toString());
  } catch (err) {
    console.log('ERRR =', err.message);
    console.log(err);
  } finally {
    if (fd) {
      await fd.close();
    }
  }
  console.log('withPromises ! done!');
}

async function withPromisesReadFile() {
  try {
    const content = await fs_promises.readFile(file, { encoding: 'ascii' });
    console.log(content);
  } catch (err) {
    console.log('ERRR =', err.message);
    console.log(err);
  }
  console.log('withPromisesReadFile ! done!');
}

async function withPromiseReadDir() {
  const thisFile = path.basename(__filename);
  try {
    const folder = path.join(__dirname, '/');
    const files = await fs_promises.readdir(folder);
    console.log(
      files.findIndex((x) => x === thisFile) >= 0 ? 'Success' : 'Failure'
    );
  } catch (err) {
    console.log(err.message);
  }
  console.log('withPromiseReadDir ! done!');
}
(async () => {
  await withPromises();
  await withPromisesReadFile();
  await withPromiseReadDir();
  console.log(42);
})();
