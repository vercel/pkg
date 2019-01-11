'use strict';

var sharp = require('sharp');

var source = Buffer.from(
  '<svg><rect x="0" y="0" width="100" height="100" rx="50" ry="50"/></svg>'
);

sharp(source).rotate().toBuffer().then(function (output) {
  if (output.slice(1, 4).toString() === 'PNG') {
    console.log('ok');
    process.exit();
  }
}).catch((error) => {
  console.error(error);
  process.exit(1);
});

setTimeout(() => {
  // if test does not pass, it blocks
  // any other way to exit
  process.kill(process.pid);
}, 3000);
