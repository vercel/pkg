'use strict';

// only work with nodeJs >= 14.0

const { open } = require('fs/promises');
async function withPromises() {
  let fd;
  try {
    fd = await open(file, 'r');
    // Do something with the file
    const buffer = Buffer.alloc(1000);
    const { byteRead } = await fd.read({ buffer, position: 10 });
    console.log('byteRead = ', byteRead);
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

(async () => {
  /*
      fs.promises is not supported ... yet
      */
  if (false) {
    await withPromises();
  }
})();
