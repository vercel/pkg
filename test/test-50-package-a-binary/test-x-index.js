#!/usr/bin/env node

let fs = require('fs');
let path = require('path');
let crypto = require('crypto');

function sha256 (s) {
  return crypto.createHash('sha256').update(s).digest('hex');
}

let file = fs.readFileSync(path.join(__dirname, 'test-y-binary.png'));
console.log(sha256(file)); // 72c388896ca159d734244fcf556cc7e06adb255ff09d5eb721f144066a65d3b0
