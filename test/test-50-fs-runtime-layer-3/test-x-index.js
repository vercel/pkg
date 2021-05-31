/* eslint-disable no-buffer-constructor */
/* eslint-disable max-statements-per-line */

'use strict';

var fs = require('fs');
var path = require('path');
var theFile = path.join(__dirname, 'test-z-asset.css');

test01();

function test01() {
  fs.open(theFile, 'w+', function (error, fd) {
    console.log(error === null);
    var buffer = Buffer.from('FOO');
    fs.write(fd, buffer, 0, buffer.length, null, function (error2) {
      console.log(error2 === null);
      if (error2) console.log(error2.message);
      fs.close(fd, function (error3) {
        console.log(error3 === null);
        console.log('closed');
        fs.writeFile(theFile, 'BAR BAZ', function (error4) {
          console.log(error4 === null);
          if (error4) console.log(error4.message);
          test02();
        });
      });
    });
  });
}

function test02() {
  var fd = fs.openSync(theFile, 'w+');
  var buffer = Buffer.from('QUX BARABAZ');
  var bytesWritten;
  try {
    bytesWritten = fs.writeSync(fd, buffer, 0, buffer.length);
  } catch (error) {
    console.log(error.message);
  }
  console.log(bytesWritten);
  fs.closeSync(fd);
  try {
    bytesWritten = fs.writeFileSync(theFile, 'GARAQUX');
  } catch (error) {
    console.log(error.message);
  }
  console.log(bytesWritten);
}
