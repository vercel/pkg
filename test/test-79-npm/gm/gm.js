'use strict';

let fs = require('fs');
let path = require('path');
let gm = require('gm').subClass({ imageMagick: true });

let input = path.join(__dirname, 'piechart.png');
let inputStream = fs.createReadStream(input);
let output = 'piechart-resize.png';

gm(inputStream).resize(240, 240).write(output, function (error) {
  if (error) throw error;
  if (fs.existsSync(output)) {
    fs.unlinkSync(output);
    console.log('ok');
  }
});
