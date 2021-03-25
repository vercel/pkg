'use strict';

var fs = require('fs');
var path = require('path');
var crypto = require('crypto');

function sha256(s) {
  return crypto.createHash('sha256').update(s).digest('hex');
}

var file = fs.readFileSync(path.join(__dirname, 'test-y-binary.png'));
console.log(sha256(file)); // 72c388896ca159d734244fcf556cc7e06adb255ff09d5eb721f144066a65d3b0
