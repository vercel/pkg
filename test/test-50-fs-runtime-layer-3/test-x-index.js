/* eslint-disable brace-style */
/* eslint-disable camelcase */
/* eslint-disable max-statements-per-line */

let fs = require('fs');
let path = require('path');
let the_file = path.join(__dirname, 'test-z-asset.css');

test01();

function test01 () {

  fs.open(the_file, 'w+', function (error, fd) {
    console.log(error === null);
    let buffer = new Buffer('FOO');
    fs.write(fd, buffer, 0, buffer.length, null, function (error2) {
      console.log(error2 === null);
      if (error2) console.log(error2.message);
      fs.close(fd, function (error3) {
        console.log(error3 === null);
        console.log('closed');
        fs.writeFile(the_file, 'BAR BAZ', function (error4) {
          console.log(error4 === null);
          if (error4) console.log(error4.message);
          test02();
        });
      });
    });
  });

}

function test02 () {

  let fd = fs.openSync(the_file, 'w+');
  let buffer = new Buffer('QUX BARABAZ');
  let bytes_written;
  try { bytes_written = fs.writeSync(fd, buffer, 0, buffer.length); } catch (error) { console.log(error.message); }
  console.log(bytes_written);
  fs.closeSync(fd);
  try { bytes_written = fs.writeFileSync(the_file, 'GARAQUX'); } catch (error) { console.log(error.message); }
  console.log(bytes_written);

}
