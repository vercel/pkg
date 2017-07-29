/* eslint-disable brace-style */
/* eslint-disable no-path-concat */

'use strict';

var fs = require('fs');
var path = require('path');
var windows = process.platform === 'win32';
var theRequireContentA = './test-z-asset-A.css';
var theRequireContentB = 'test-z-asset-B.css';

function firstLowerCase (s) {
  return s.slice(0, 1).toLowerCase() + s.slice(1);
}

function firstUpperCase (s) {
  return s.slice(0, 1).toUpperCase() + s.slice(1);
}

console.log([

  fs.readFileSync(path.join(__dirname, theRequireContentA)),
  fs.readFileSync(__dirname + path.sep + theRequireContentB),
  fs.readFileSync(__dirname + '/' + theRequireContentB),
  windows ? fs.readFileSync(__dirname + '/\\' + theRequireContentB) : '',
  windows ? fs.readFileSync(__dirname + '\\' + theRequireContentB) : '',
  windows ? fs.readFileSync(__dirname + '\\/' + theRequireContentB) : '',

  fs.readFileSync(firstLowerCase(path.join(__dirname, theRequireContentA))),
  fs.readFileSync(firstLowerCase(__dirname + path.sep + theRequireContentB)),
  fs.readFileSync(firstLowerCase(__dirname + '/' + theRequireContentB)),
  windows ? fs.readFileSync(firstLowerCase(__dirname + '/\\' + theRequireContentB)) : '',
  windows ? fs.readFileSync(firstLowerCase(__dirname + '\\' + theRequireContentB)) : '',
  windows ? fs.readFileSync(firstLowerCase(__dirname + '\\/' + theRequireContentB)) : '',

  fs.readFileSync(firstUpperCase(path.join(__dirname, theRequireContentA))),
  fs.readFileSync(firstUpperCase(__dirname + path.sep + theRequireContentB)),
  fs.readFileSync(firstUpperCase(__dirname + '/' + theRequireContentB)),
  windows ? fs.readFileSync(firstUpperCase(__dirname + '/\\' + theRequireContentB)) : '',
  windows ? fs.readFileSync(firstUpperCase(__dirname + '\\' + theRequireContentB)) : '',
  windows ? fs.readFileSync(firstUpperCase(__dirname + '\\/' + theRequireContentB)) : '',

  //

  fs.readdirSync(__dirname).length > 0,
  fs.readdirSync(path.dirname(__dirname)).length > 0,
  fs.readdirSync(path.dirname(path.dirname(__dirname))).length > 0,

  fs.readdirSync(firstLowerCase(__dirname)).length > 0,
  fs.readdirSync(firstLowerCase(path.dirname(__dirname))).length > 0,
  fs.readdirSync(firstLowerCase(path.dirname(path.dirname(__dirname)))).length > 0,

  fs.readdirSync(firstUpperCase(__dirname)).length > 0,
  fs.readdirSync(firstUpperCase(path.dirname(__dirname))).length > 0,
  fs.readdirSync(firstUpperCase(path.dirname(path.dirname(__dirname)))).length > 0,

  //

  fs.existsSync(path.join(__dirname, theRequireContentA)),
  fs.existsSync(__dirname + path.sep + theRequireContentB),
  fs.existsSync(__dirname + '/' + theRequireContentB),
  windows ? fs.existsSync(__dirname + '/\\' + theRequireContentB) : '',
  windows ? fs.existsSync(__dirname + '\\' + theRequireContentB) : '',
  windows ? fs.existsSync(__dirname + '\\/' + theRequireContentB) : '',

  fs.existsSync(firstLowerCase(path.join(__dirname, theRequireContentA))),
  fs.existsSync(firstLowerCase(__dirname + path.sep + theRequireContentB)),
  fs.existsSync(firstLowerCase(__dirname + '/' + theRequireContentB)),
  windows ? fs.existsSync(firstLowerCase(__dirname + '/\\' + theRequireContentB)) : '',
  windows ? fs.existsSync(firstLowerCase(__dirname + '\\' + theRequireContentB)) : '',
  windows ? fs.existsSync(firstLowerCase(__dirname + '\\/' + theRequireContentB)) : '',

  fs.existsSync(firstUpperCase(path.join(__dirname, theRequireContentA))),
  fs.existsSync(firstUpperCase(__dirname + path.sep + theRequireContentB)),
  fs.existsSync(firstUpperCase(__dirname + '/' + theRequireContentB)),
  windows ? fs.existsSync(firstUpperCase(__dirname + '/\\' + theRequireContentB)) : '',
  windows ? fs.existsSync(firstUpperCase(__dirname + '\\' + theRequireContentB)) : '',
  windows ? fs.existsSync(firstUpperCase(__dirname + '\\/' + theRequireContentB)) : '',

  //

  fs.existsSync(path.join(__dirname, theRequireContentA + '-no-such')),
  fs.existsSync(__dirname + path.sep + theRequireContentB + '-no-such'),
  fs.existsSync(__dirname + '/' + theRequireContentB + '-no-such'),
  windows ? fs.existsSync(__dirname + '/\\' + theRequireContentB + '-no-such') : '',
  windows ? fs.existsSync(__dirname + '\\' + theRequireContentB + '-no-such') : '',
  windows ? fs.existsSync(__dirname + '\\/' + theRequireContentB + '-no-such') : '',

  fs.existsSync(firstLowerCase(path.join(__dirname, theRequireContentA + '-no-such'))),
  fs.existsSync(firstLowerCase(__dirname + path.sep + theRequireContentB + '-no-such')),
  fs.existsSync(firstLowerCase(__dirname + '/' + theRequireContentB + '-no-such')),
  windows ? fs.existsSync(firstLowerCase(__dirname + '/\\' + theRequireContentB + '-no-such')) : '',
  windows ? fs.existsSync(firstLowerCase(__dirname + '\\' + theRequireContentB + '-no-such')) : '',
  windows ? fs.existsSync(firstLowerCase(__dirname + '\\/' + theRequireContentB + '-no-such')) : '',

  fs.existsSync(firstUpperCase(path.join(__dirname, theRequireContentA + '-no-such'))),
  fs.existsSync(firstUpperCase(__dirname + path.sep + theRequireContentB + '-no-such')),
  fs.existsSync(firstUpperCase(__dirname + '/' + theRequireContentB + '-no-such')),
  windows ? fs.existsSync(firstUpperCase(__dirname + '/\\' + theRequireContentB + '-no-such')) : '',
  windows ? fs.existsSync(firstUpperCase(__dirname + '\\' + theRequireContentB + '-no-such')) : '',
  windows ? fs.existsSync(firstUpperCase(__dirname + '\\/' + theRequireContentB + '-no-such')) : '',

  //

  fs.accessSync(path.join(__dirname, theRequireContentA)),
  fs.accessSync(__dirname + path.sep + theRequireContentB),
  fs.accessSync(__dirname + '/' + theRequireContentB),
  windows ? fs.accessSync(__dirname + '/\\' + theRequireContentB) : '',
  windows ? fs.accessSync(__dirname + '\\' + theRequireContentB) : '',
  windows ? fs.accessSync(__dirname + '\\/' + theRequireContentB) : '',

  fs.accessSync(firstLowerCase(path.join(__dirname, theRequireContentA))),
  fs.accessSync(firstLowerCase(__dirname + path.sep + theRequireContentB)),
  fs.accessSync(firstLowerCase(__dirname + '/' + theRequireContentB)),
  windows ? fs.accessSync(firstLowerCase(__dirname + '/\\' + theRequireContentB)) : '',
  windows ? fs.accessSync(firstLowerCase(__dirname + '\\' + theRequireContentB)) : '',
  windows ? fs.accessSync(firstLowerCase(__dirname + '\\/' + theRequireContentB)) : '',

  fs.accessSync(firstUpperCase(path.join(__dirname, theRequireContentA))),
  fs.accessSync(firstUpperCase(__dirname + path.sep + theRequireContentB)),
  fs.accessSync(firstUpperCase(__dirname + '/' + theRequireContentB)),
  windows ? fs.accessSync(firstUpperCase(__dirname + '/\\' + theRequireContentB)) : '',
  windows ? fs.accessSync(firstUpperCase(__dirname + '\\' + theRequireContentB)) : '',
  windows ? fs.accessSync(firstUpperCase(__dirname + '\\/' + theRequireContentB)) : '',

  //

  fs.statSync(path.join(__dirname, theRequireContentA)).mode,
  fs.statSync(__dirname + path.sep + theRequireContentB).mode,
  fs.statSync(__dirname + '/' + theRequireContentB).mode,
  windows ? fs.statSync(__dirname + '/\\' + theRequireContentB).mode : '',
  windows ? fs.statSync(__dirname + '\\' + theRequireContentB).mode : '',
  windows ? fs.statSync(__dirname + '\\/' + theRequireContentB).mode : '',

  fs.statSync(firstLowerCase(path.join(__dirname, theRequireContentA))).mode,
  fs.statSync(firstLowerCase(__dirname + path.sep + theRequireContentB)).mode,
  fs.statSync(firstLowerCase(__dirname + '/' + theRequireContentB)).mode,
  windows ? fs.statSync(firstLowerCase(__dirname + '/\\' + theRequireContentB)).mode : '',
  windows ? fs.statSync(firstLowerCase(__dirname + '\\' + theRequireContentB)).mode : '',
  windows ? fs.statSync(firstLowerCase(__dirname + '\\/' + theRequireContentB)).mode : '',

  fs.statSync(firstUpperCase(path.join(__dirname, theRequireContentA))).mode,
  fs.statSync(firstUpperCase(__dirname + path.sep + theRequireContentB)).mode,
  fs.statSync(firstUpperCase(__dirname + '/' + theRequireContentB)).mode,
  windows ? fs.statSync(firstUpperCase(__dirname + '/\\' + theRequireContentB)).mode : '',
  windows ? fs.statSync(firstUpperCase(__dirname + '\\' + theRequireContentB)).mode : '',
  windows ? fs.statSync(firstUpperCase(__dirname + '\\/' + theRequireContentB)).mode : '',

  //

  fs.statSync(path.join(__dirname, theRequireContentA)).birthtime.getYear(),
  fs.statSync(__dirname + path.sep + theRequireContentB).birthtime.getYear(),
  fs.statSync(__dirname + '/' + theRequireContentB).birthtime.getYear(),
  windows ? fs.statSync(__dirname + '/\\' + theRequireContentB).birthtime.getYear() : '',
  windows ? fs.statSync(__dirname + '\\' + theRequireContentB).birthtime.getYear() : '',
  windows ? fs.statSync(__dirname + '\\/' + theRequireContentB).birthtime.getYear() : '',

  fs.statSync(firstLowerCase(path.join(__dirname, theRequireContentA))).birthtime.getYear(),
  fs.statSync(firstLowerCase(__dirname + path.sep + theRequireContentB)).birthtime.getYear(),
  fs.statSync(firstLowerCase(__dirname + '/' + theRequireContentB)).birthtime.getYear(),
  windows ? fs.statSync(firstLowerCase(__dirname + '/\\' + theRequireContentB)).birthtime.getYear() : '',
  windows ? fs.statSync(firstLowerCase(__dirname + '\\' + theRequireContentB)).birthtime.getYear() : '',
  windows ? fs.statSync(firstLowerCase(__dirname + '\\/' + theRequireContentB)).birthtime.getYear() : '',

  fs.statSync(firstUpperCase(path.join(__dirname, theRequireContentA))).birthtime.getYear(),
  fs.statSync(firstUpperCase(__dirname + path.sep + theRequireContentB)).birthtime.getYear(),
  fs.statSync(firstUpperCase(__dirname + '/' + theRequireContentB)).birthtime.getYear(),
  windows ? fs.statSync(firstUpperCase(__dirname + '/\\' + theRequireContentB)).birthtime.getYear() : '',
  windows ? fs.statSync(firstUpperCase(__dirname + '\\' + theRequireContentB)).birthtime.getYear() : '',
  windows ? fs.statSync(firstUpperCase(__dirname + '\\/' + theRequireContentB)).birthtime.getYear() : '',

  //

  fs.statSync(path.join(__dirname, theRequireContentA)).isFile(),
  fs.statSync(__dirname + path.sep + theRequireContentB).isFile(),
  fs.statSync(__dirname + '/' + theRequireContentB).isFile(),
  windows ? fs.statSync(__dirname + '/\\' + theRequireContentB).isFile() : '',
  windows ? fs.statSync(__dirname + '\\' + theRequireContentB).isFile() : '',
  windows ? fs.statSync(__dirname + '\\/' + theRequireContentB).isFile() : '',

  fs.statSync(firstLowerCase(path.join(__dirname, theRequireContentA))).isFile(),
  fs.statSync(firstLowerCase(__dirname + path.sep + theRequireContentB)).isFile(),
  fs.statSync(firstLowerCase(__dirname + '/' + theRequireContentB)).isFile(),
  windows ? fs.statSync(firstLowerCase(__dirname + '/\\' + theRequireContentB)).isFile() : '',
  windows ? fs.statSync(firstLowerCase(__dirname + '\\' + theRequireContentB)).isFile() : '',
  windows ? fs.statSync(firstLowerCase(__dirname + '\\/' + theRequireContentB)).isFile() : '',

  fs.statSync(firstUpperCase(path.join(__dirname, theRequireContentA))).isFile(),
  fs.statSync(firstUpperCase(__dirname + path.sep + theRequireContentB)).isFile(),
  fs.statSync(firstUpperCase(__dirname + '/' + theRequireContentB)).isFile(),
  windows ? fs.statSync(firstUpperCase(__dirname + '/\\' + theRequireContentB)).isFile() : '',
  windows ? fs.statSync(firstUpperCase(__dirname + '\\' + theRequireContentB)).isFile() : '',
  windows ? fs.statSync(firstUpperCase(__dirname + '\\/' + theRequireContentB)).isFile() : '',

  //

  fs.statSync(path.join(__dirname, theRequireContentA)).isDirectory(),
  fs.statSync(__dirname + path.sep + theRequireContentB).isDirectory(),
  fs.statSync(__dirname + '/' + theRequireContentB).isDirectory(),
  windows ? fs.statSync(__dirname + '/\\' + theRequireContentB).isDirectory() : '',
  windows ? fs.statSync(__dirname + '\\' + theRequireContentB).isDirectory() : '',
  windows ? fs.statSync(__dirname + '\\/' + theRequireContentB).isDirectory() : '',

  fs.statSync(firstLowerCase(path.join(__dirname, theRequireContentA))).isDirectory(),
  fs.statSync(firstLowerCase(__dirname + path.sep + theRequireContentB)).isDirectory(),
  fs.statSync(firstLowerCase(__dirname + '/' + theRequireContentB)).isDirectory(),
  windows ? fs.statSync(firstLowerCase(__dirname + '/\\' + theRequireContentB)).isDirectory() : '',
  windows ? fs.statSync(firstLowerCase(__dirname + '\\' + theRequireContentB)).isDirectory() : '',
  windows ? fs.statSync(firstLowerCase(__dirname + '\\/' + theRequireContentB)).isDirectory() : '',

  fs.statSync(firstUpperCase(path.join(__dirname, theRequireContentA))).isDirectory(),
  fs.statSync(firstUpperCase(__dirname + path.sep + theRequireContentB)).isDirectory(),
  fs.statSync(firstUpperCase(__dirname + '/' + theRequireContentB)).isDirectory(),
  windows ? fs.statSync(firstUpperCase(__dirname + '/\\' + theRequireContentB)).isDirectory() : '',
  windows ? fs.statSync(firstUpperCase(__dirname + '\\' + theRequireContentB)).isDirectory() : '',
  windows ? fs.statSync(firstUpperCase(__dirname + '\\/' + theRequireContentB)).isDirectory() : '',

  //

  fs.lstatSync(path.join(__dirname, theRequireContentA)).mode,
  fs.lstatSync(__dirname + path.sep + theRequireContentB).mode,
  fs.lstatSync(__dirname + '/' + theRequireContentB).mode,
  windows ? fs.lstatSync(__dirname + '/\\' + theRequireContentB).mode : '',
  windows ? fs.lstatSync(__dirname + '\\' + theRequireContentB).mode : '',
  windows ? fs.lstatSync(__dirname + '\\/' + theRequireContentB).mode : '',

  fs.lstatSync(firstLowerCase(path.join(__dirname, theRequireContentA))).mode,
  fs.lstatSync(firstLowerCase(__dirname + path.sep + theRequireContentB)).mode,
  fs.lstatSync(firstLowerCase(__dirname + '/' + theRequireContentB)).mode,
  windows ? fs.lstatSync(firstLowerCase(__dirname + '/\\' + theRequireContentB)).mode : '',
  windows ? fs.lstatSync(firstLowerCase(__dirname + '\\' + theRequireContentB)).mode : '',
  windows ? fs.lstatSync(firstLowerCase(__dirname + '\\/' + theRequireContentB)).mode : '',

  fs.lstatSync(firstUpperCase(path.join(__dirname, theRequireContentA))).mode,
  fs.lstatSync(firstUpperCase(__dirname + path.sep + theRequireContentB)).mode,
  fs.lstatSync(firstUpperCase(__dirname + '/' + theRequireContentB)).mode,
  windows ? fs.lstatSync(firstUpperCase(__dirname + '/\\' + theRequireContentB)).mode : '',
  windows ? fs.lstatSync(firstUpperCase(__dirname + '\\' + theRequireContentB)).mode : '',
  windows ? fs.lstatSync(firstUpperCase(__dirname + '\\/' + theRequireContentB)).mode : '',

  //

  fs.realpathSync(path.join(__dirname, theRequireContentA)).mode,
  fs.realpathSync(__dirname + path.sep + theRequireContentB).mode,
  fs.realpathSync(__dirname + '/' + theRequireContentB).mode,
  windows ? fs.realpathSync(__dirname + '/\\' + theRequireContentB).mode : '',
  windows ? fs.realpathSync(__dirname + '\\' + theRequireContentB).mode : '',
  windows ? fs.realpathSync(__dirname + '\\/' + theRequireContentB).mode : '',

  fs.realpathSync(firstLowerCase(path.join(__dirname, theRequireContentA))).mode,
  fs.realpathSync(firstLowerCase(__dirname + path.sep + theRequireContentB)).mode,
  fs.realpathSync(firstLowerCase(__dirname + '/' + theRequireContentB)).mode,
  windows ? fs.realpathSync(firstLowerCase(__dirname + '/\\' + theRequireContentB)).mode : '',
  windows ? fs.realpathSync(firstLowerCase(__dirname + '\\' + theRequireContentB)).mode : '',
  windows ? fs.realpathSync(firstLowerCase(__dirname + '\\/' + theRequireContentB)).mode : '',

  fs.realpathSync(firstUpperCase(path.join(__dirname, theRequireContentA))).mode,
  fs.realpathSync(firstUpperCase(__dirname + path.sep + theRequireContentB)).mode,
  fs.realpathSync(firstUpperCase(__dirname + '/' + theRequireContentB)).mode,
  windows ? fs.realpathSync(firstUpperCase(__dirname + '/\\' + theRequireContentB)).mode : '',
  windows ? fs.realpathSync(firstUpperCase(__dirname + '\\' + theRequireContentB)).mode : '',
  windows ? fs.realpathSync(firstUpperCase(__dirname + '\\/' + theRequireContentB)).mode : ''

].join('\n'));
