/* eslint-disable brace-style */
/* eslint-disable camelcase */
/* eslint-disable max-statements-per-line */

'use strict';

let fs = require('fs');
let path = require('path');
let assert = require('assert');
let the_file = path.join(__dirname, 'test-z-asset.css');
let the_directory = __dirname;

function dump_error (error) {
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

  fs.stat(the_file, function (error, stats) {
    console.log('fs.stat.error === null', error === null);
    console.log('stats.size', stats.size);
    fs.open(the_file, 'r', function (error2, fd) {
      console.log('fs.open.error2 === null', error2 === null);
      fs.fstat(fd, function (error3, fstats) {
        console.log('fs.fstat.error3 === null', error3 === null);
        console.log('fstats.size', fstats.size);
        let buffer = new Buffer(stats.size);
        fs.read(fd, buffer, 0, buffer.length, null, function (error4, bytes_read, buffer2) {
          console.log('fs.read.error4 === null', error4 === null);
          assert(buffer === buffer2); // should be same instances
          let data = buffer.toString('utf8', 0, buffer.length);
          console.log('data', data);
          fs.close(fd, function (error5) {
            console.log('fs.close.error5 === null', error5 === null);
            test02();
          });
        });
      });
    });
  });

}

function test02 () {

  console.log('<<< test02 >>>');

  let stats = fs.statSync(the_file);
  console.log('stats.size', stats.size);
  let fd = fs.openSync(the_file, 'r');
  let fstats = fs.fstatSync(fd);
  console.log('fstats.size', fstats.size);
  let buffer = new Buffer(stats.size);
  let bytes_read = fs.readSync(fd, buffer, 0, buffer.length);
  console.log('bytes_read', bytes_read);
  let data = buffer.toString('utf8', 0, buffer.length);
  console.log('data', data);
  fs.closeSync(fd);
  test03();

}

function test03 () {

  console.log('<<< test03 >>>');

  let stats = fs.statSync(the_file);
  console.log('stats.size', stats.size);
  let fd = fs.openSync(the_file, 'r');
  let fstats = fs.fstatSync(fd);
  console.log('fstats.size', fstats.size);
  let buffer = new Buffer(6);
  let bytes_read = fs.readSync(fd, buffer, 0, 6);
  console.log('bytes_read_a', bytes_read, 'buffer', buffer[0], buffer[1]);
  bytes_read = fs.readSync(fd, buffer, 0, 6);
  console.log('bytes_read_b', bytes_read, 'buffer', buffer[0], buffer[1]);
  bytes_read = fs.readSync(fd, buffer, 1, 5);
  console.log('bytes_read_c', bytes_read, 'buffer', buffer[1], buffer[2]);
  try { bytes_read = fs.readSync(fd, buffer, 1, 6); } catch (error) { dump_error(error); }
  console.log('bytes_read_d', bytes_read, 'buffer', buffer[1], buffer[2]);
  bytes_read = fs.readSync(fd, buffer, 5, 1);
  console.log('bytes_read_e', bytes_read, 'buffer', buffer[4], buffer[5]);
  try { bytes_read = fs.readSync(fd, buffer, 6, 0); } catch (error) { dump_error(error); }
  console.log('bytes_read_f', bytes_read, 'buffer', buffer[4], buffer[5]);
  try { bytes_read = fs.readSync(fd, buffer, -1, 5); } catch (error) { dump_error(error); }
  console.log('bytes_read_g', bytes_read, 'buffer', buffer[4], buffer[5]);
  try { bytes_read = fs.readSync(fd, buffer, -1, 9); } catch (error) { dump_error(error); }
  console.log('bytes_read_h', bytes_read, 'buffer', buffer[4], buffer[5]);
  bytes_read = fs.readSync(fd, buffer, 0, 6);
  console.log('bytes_read_i', bytes_read, 'buffer', buffer[0], buffer[1]);
  bytes_read = fs.readSync(fd, buffer, 0, 6);
  console.log('bytes_read_j', bytes_read, 'buffer', buffer[0], buffer[1]);
  bytes_read = fs.readSync(fd, buffer, 0, 6);
  console.log('bytes_read_k', bytes_read, 'buffer', buffer[0], buffer[1]);
  bytes_read = fs.readSync(fd, buffer, 0, 6);
  console.log('bytes_read_l', bytes_read, 'buffer', buffer[0], buffer[1]);
  bytes_read = fs.readSync(fd, buffer, 0, 6);
  console.log('bytes_read_m', bytes_read, 'buffer', buffer[0], buffer[1]);
  bytes_read = fs.readSync(fd, buffer, 0, 6, 20);
  console.log('bytes_read_n', bytes_read, 'buffer', buffer[0], buffer[1]);
  bytes_read = fs.readSync(fd, buffer, 0, 6, 80);
  console.log('bytes_read_o', bytes_read, 'buffer', buffer[0], buffer[1]);
  fs.closeSync(fd);
  test04();

}

function test04 () {

  let stats = fs.statSync(the_directory);
  console.log(stats.size);
  let fd = fs.openSync(the_directory, 'r');
  let fstats = fs.fstatSync(fd);
  console.log(fstats.size);
  let buffer = new Buffer([ 12, 34, 56, 78 ]);
  let bytes_read;
  try { bytes_read = fs.readSync(fd, buffer, 0, 6); } catch (error) { dump_error(error); }
  console.log(bytes_read, buffer[0], buffer[1]);
  try { bytes_read = fs.readSync(fd, buffer, 6, 0); } catch (error) { dump_error(error); }
  console.log(bytes_read, buffer[0], buffer[1]);
  try { bytes_read = fs.readSync(fd, buffer, -1, 3); } catch (error) { dump_error(error); }
  console.log(bytes_read, buffer[0], buffer[1]);
  try { bytes_read = fs.readSync(fd, buffer, 0, 4); } catch (error) { dump_error(error); }
  console.log(bytes_read, buffer[0], buffer[1]);
  fs.closeSync(fd);
  test05();

}

function test05 () {

  let fd = 'incorrect fd as string';
  let buffer = new Buffer([ 12, 34, 56, 78 ]);
  let bytes_read;
  try { bytes_read = fs.readSync(fd, buffer, 0, 6); } catch (error) { dump_error(error); }
  console.log(bytes_read, buffer[0], buffer[1]);
  try { console.log(fs.fstatSync(fd)); } catch (error) { dump_error(error); }
  console.log(bytes_read, buffer[0], buffer[1]);
  try { fs.closeSync(fd); } catch (error) { dump_error(error); }
  test06();

}

function test06 () {

  let fd = 7890;
  let buffer = new Buffer([ 12, 34, 56, 78 ]);
  let bytes_read;
  try { bytes_read = fs.readSync(fd, buffer, 0, 6); } catch (error) { dump_error(error); }
  console.log(bytes_read, buffer[0], buffer[1]);
  try { console.log(fs.fstatSync(fd)); } catch (error) { dump_error(error); }
  console.log(bytes_read, buffer[0], buffer[1]);
  try { fs.closeSync(fd); console.log('EBADF: bad file descriptor'); } catch (error) { dump_error(error); }
  test07();

}

function test07 () {

  let rs = fs.createReadStream(the_file);

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
