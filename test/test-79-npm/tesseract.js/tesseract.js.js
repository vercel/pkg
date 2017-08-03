'use strict';

var fs = require('fs');
var path = require('path');
var Tesseract = require('tesseract.js');
var image = path.join(__dirname, 'hello.jpg');

Tesseract.recognize(image).then(function (data) {
  if (data.text.toLowerCase().indexOf('hello') >= 0) {
    console.log('ok');
  }
}).finally(function () {
  fs.unlinkSync('eng.traineddata');
  process.exit();
});
