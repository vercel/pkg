/* eslint-disable max-statements-per-line */

'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const theFile = path.join(__dirname, 'test-z-asset.css');
const theDirectory = __dirname;

function dumpError (error) {
  let s = error.message;
  if (s === 'Bad argument') {
    s = 'fd must be a file descriptor';
  } else
  if ((s === 'EBADF, bad file descriptor') && (error.syscall === 'fstat')) {
    s = 'EBADF: bad file descriptor, fstat';
  } else
  if (s === 'EBADF, bad file descriptor') {
    s = 'EBADF: bad file descriptor';
  } else
  if (s === 'EBADF: bad file descriptor, close') {
    s = 'EBADF: bad file descriptor';
  } else
  if (s === 'EISDIR, illegal operation on a directory') {
    s = 'EISDIR: illegal operation on a directory, read';
  }
  console.log(s);
}

test01();

function test01 () {
  console.log('<<< test01 >>>');

  fs.stat(theFile, function (error, stats) {
    console.log('fs.stat.error === null', error === null);
    console.log('stats.size', stats.size);
    fs.open(theFile, 'r', function (error2, fd) {
      console.log('fs.open.error2 === null', error2 === null);
      fs.fstat(fd, function (error3, fstats) {
        console.log('fs.fstat.error3 === null', error3 === null);
        console.log('fstats.size', fstats.size);
        const buffer = new Buffer(stats.size);
        fs.read(fd, buffer, 0, buffer.length, null, function (error4, bytesRead, buffer2) {
          console.log('fs.read.error4 === null', error4 === null);
          assert(buffer === buffer2); // should be same instances
          const data = buffer.toString('utf8', 0, buffer.length);
          console.log('data', data);
          fs.close(fd, function (error5) {
            console.log('fs.close.error5 === null', error5 === null);
            test01e(fd);
          });
          console.log('after fs.close');
        });
        console.log('after fs.read');
      });
      console.log('after fs.fstat');
    });
    console.log('after fs.open');
  });
  console.log('after fs.stat');
}

function test01e (badFd) {
  console.log('<<< test01e >>>');

  fs.stat(theFile + '.notExists', function (error, stats) {
    console.log('fs.stat.error === null', error === null);
    fs.open(theFile + '.notExists', 'r', function (error2, fd) {
      console.log('fs.open.error2 === null', error2 === null);
      fd = badFd;
      fs.fstat(fd, function (error3, fstats) {
        console.log('fs.fstat.error3 === null', error3 === null);
        const buffer = new Buffer(1024);
        fs.read(fd, buffer, 0, buffer.length, null, function (error4, bytesRead, buffer2) {
          console.log('fs.read.error4 === null', error4 === null);
          console.log('typeof bytesRead', typeof bytesRead);
          console.log('typeof buffer2', typeof buffer2);
          fs.close(fd, function (error5) {
            console.log('fs.close.error5 === null', error5 === null);
            test02();
          });
          console.log('after fs.close');
        });
        console.log('after fs.read');
      });
      console.log('after fs.fstat');
    });
    console.log('after fs.open');
  });
  console.log('after fs.stat');
}

function test02 () {
  console.log('<<< test02 >>>');

  const stats = fs.statSync(theFile);
  console.log('stats.size', stats.size);
  const fd = fs.openSync(theFile, 'r');
  const fstats = fs.fstatSync(fd);
  console.log('fstats.size', fstats.size);
  const buffer = new Buffer(stats.size);
  const bytesRead = fs.readSync(fd, buffer, 0, buffer.length);
  console.log('bytesRead', bytesRead);
  const data = buffer.toString('utf8', 0, buffer.length);
  console.log('data', data);
  fs.closeSync(fd);
  test03();
}

function test03 () {
  console.log('<<< test03 >>>');

  const stats = fs.statSync(theFile);
  console.log('stats.size', stats.size);
  const fd = fs.openSync(theFile, 'r');
  const fstats = fs.fstatSync(fd);
  console.log('fstats.size', fstats.size);
  const buffer = new Buffer(6);
  let bytesRead = fs.readSync(fd, buffer, 0, 6);
  console.log('bytesRead_a', bytesRead, 'buffer', buffer[0], buffer[1]);
  bytesRead = fs.readSync(fd, buffer, 0, 6);
  console.log('bytesRead_b', bytesRead, 'buffer', buffer[0], buffer[1]);
  bytesRead = fs.readSync(fd, buffer, 1, 5);
  console.log('bytesRead_c', bytesRead, 'buffer', buffer[1], buffer[2]);
  try { bytesRead = fs.readSync(fd, buffer, 1, 6); } catch (error) { dumpError(error); }
  console.log('bytesRead_d', bytesRead, 'buffer', buffer[1], buffer[2]);
  bytesRead = fs.readSync(fd, buffer, 5, 1);
  console.log('bytesRead_e', bytesRead, 'buffer', buffer[4], buffer[5]);
  try { bytesRead = fs.readSync(fd, buffer, 6, 0); } catch (error) { dumpError(error); }
  console.log('bytesRead_f', bytesRead, 'buffer', buffer[4], buffer[5]);
  try { bytesRead = fs.readSync(fd, buffer, -1, 5); } catch (error) { dumpError(error); }
  console.log('bytesRead_g', bytesRead, 'buffer', buffer[4], buffer[5]);
  try { bytesRead = fs.readSync(fd, buffer, -1, 9); } catch (error) { dumpError(error); }
  console.log('bytesRead_h', bytesRead, 'buffer', buffer[4], buffer[5]);
  bytesRead = fs.readSync(fd, buffer, 0, 6);
  console.log('bytesRead_i', bytesRead, 'buffer', buffer[0], buffer[1]);
  bytesRead = fs.readSync(fd, buffer, 0, 6);
  console.log('bytesRead_j', bytesRead, 'buffer', buffer[0], buffer[1]);
  bytesRead = fs.readSync(fd, buffer, 0, 6);
  console.log('bytesRead_k', bytesRead, 'buffer', buffer[0], buffer[1]);
  bytesRead = fs.readSync(fd, buffer, 0, 6);
  console.log('bytesRead_l', bytesRead, 'buffer', buffer[0], buffer[1]);
  bytesRead = fs.readSync(fd, buffer, 0, 6);
  console.log('bytesRead_m', bytesRead, 'buffer', buffer[0], buffer[1]);
  bytesRead = fs.readSync(fd, buffer, 0, 6, 20);
  console.log('bytesRead_n', bytesRead, 'buffer', buffer[0], buffer[1]);
  bytesRead = fs.readSync(fd, buffer, 0, 6, 80);
  console.log('bytesRead_o', bytesRead, 'buffer', buffer[0], buffer[1]);
  fs.closeSync(fd);
  test04();
}

function test04 () {
  const stats = fs.statSync(theDirectory);
  console.log(stats.size);
  const fd = fs.openSync(theDirectory, 'r');
  const fstats = fs.fstatSync(fd);
  console.log(fstats.size);
  const buffer = new Buffer([ 12, 34, 56, 78 ]);
  let bytesRead;
  try { bytesRead = fs.readSync(fd, buffer, 0, 6); } catch (error) { dumpError(error); }
  console.log(bytesRead, buffer[0], buffer[1]);
  try { bytesRead = fs.readSync(fd, buffer, 6, 0); } catch (error) { dumpError(error); }
  console.log(bytesRead, buffer[0], buffer[1]);
  try { bytesRead = fs.readSync(fd, buffer, -1, 3); } catch (error) { dumpError(error); }
  console.log(bytesRead, buffer[0], buffer[1]);
  try { bytesRead = fs.readSync(fd, buffer, 0, 4); } catch (error) { dumpError(error); }
  console.log(bytesRead, buffer[0], buffer[1]);
  fs.closeSync(fd);
  test05();
}

function test05 () {
  const fd = 'incorrect fd as string';
  const buffer = new Buffer([ 12, 34, 56, 78 ]);
  let bytesRead;
  try { bytesRead = fs.readSync(fd, buffer, 0, 6); } catch (error) { dumpError(error); }
  console.log(bytesRead, buffer[0], buffer[1]);
  try { console.log(fs.fstatSync(fd)); } catch (error) { dumpError(error); }
  console.log(bytesRead, buffer[0], buffer[1]);
  try { fs.closeSync(fd); } catch (error) { dumpError(error); }
  test06();
}

function test06 () {
  const fd = 7890;
  const buffer = new Buffer([ 12, 34, 56, 78 ]);
  let bytesRead;
  try { bytesRead = fs.readSync(fd, buffer, 0, 6); } catch (error) { dumpError(error); }
  console.log(bytesRead, buffer[0], buffer[1]);
  try { console.log(fs.fstatSync(fd)); } catch (error) { dumpError(error); }
  console.log(bytesRead, buffer[0], buffer[1]);
  try { fs.closeSync(fd); console.log('EBADF: bad file descriptor'); } catch (error) { dumpError(error); }
  test07();
}

function test07 () {
  const rs = fs.createReadStream(theFile);

  rs.on('open', function () {
    console.log('open');
  });

  rs.on('readable', function () {
    let r = rs.read();
    if (!r) {
      r = 'null';
    } else
    if (r.length >= 2) {
      console.log('length:', r.length);
      r = r[0].toString() + ', ' + r[1].toString();
    }
    console.log('readable:', r);
  });

  rs.on('end', function () {
    console.log('end');
  });
}
