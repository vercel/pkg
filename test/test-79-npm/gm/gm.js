'use strict';

var fs = require('fs');
var path = require('path');
var gm = require('gm').subClass({ imageMagick: true });

var input = path.join(__dirname, 'piechart.png');
var inputStream = fs.createReadStream(input);
var output = 'piechart-resize.png';

gm(inputStream)
  .resize(240, 240)
  .write(output, function (error) {
    if (error) throw error;
    if (fs.existsSync(output)) {
      fs.unlinkSync(output);
      console.log('ok');
    }
  });
