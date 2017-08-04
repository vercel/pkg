'use strict';

try {
  // sharp.node is placed deeper to be
  // able to take ../../vendor/lib/*.dylib
  // https://github.com/lovell/sharp/issues/826#issuecomment-307613105
  require('fs').unlinkSync('sharp.node');
} catch (_) {
}

var sharp = require('sharp');

var source = Buffer.from(
  '<svg><rect x="0" y="0" width="100" height="100" rx="50" ry="50"/></svg>'
);

sharp(source).rotate().toBuffer().then(function (output) {
  if (output.slice(1, 4).toString() === 'PNG') {
    console.log('ok');
  }
});
