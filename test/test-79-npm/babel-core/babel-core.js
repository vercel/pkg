'use strict';

let fs = require('fs');
let path = require('path');
let babel = require('babel-core');
let body8 = fs.readFileSync(path.join(__dirname, 'babel-core.txt'), 'utf8');
let code = babel.transform(body8, { ast: false }).code;
if (code.length > 20) console.log('ok');
