#!/usr/bin/env node

'use strict';

let fs = require('fs');
let path = require('path');

console.log(
  fs.readdirSync(path.join(__dirname, 'sub')),
  fs.readdirSync(path.join(__dirname, 'sub/')),
  fs.readdirSync(path.join(__dirname, 'sub//'))
);
