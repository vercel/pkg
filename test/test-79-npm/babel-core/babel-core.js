'use strict';

var fs = require('fs');
var path = require('path');
var babel = require('babel-core');
var body8 = fs.readFileSync(path.join(__dirname, 'babel-core.txt'), 'utf8');
var code = babel.transform(body8, { ast: false }).code;
if (code.length > 20) console.log('ok');
