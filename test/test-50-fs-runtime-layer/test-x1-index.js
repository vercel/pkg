/* eslint-disable camelcase */
/* eslint-disable no-path-concat */

'use strict';

var fs = require('fs');
var path = require('path');
var windows = process.platform === 'win32';
var the_require_content_A = './test-z-asset-A.css';
var the_require_content_B = 'test-z-asset-B.css';

function first_lower_case (s) {
  return s.slice(0, 1).toLowerCase() + s.slice(1);
}

function first_upper_case (s) {
  return s.slice(0, 1).toUpperCase() + s.slice(1);
}

console.log([

  fs.readFileSync(path.join(__dirname, the_require_content_A)),
  fs.readFileSync(__dirname + path.sep + the_require_content_B),
  fs.readFileSync(__dirname + '/' + the_require_content_B),
  windows ? fs.readFileSync(__dirname + '/\\' + the_require_content_B) : '',
  windows ? fs.readFileSync(__dirname + '\\' + the_require_content_B) : '',
  windows ? fs.readFileSync(__dirname + '\\/' + the_require_content_B) : '',

  fs.readFileSync(first_lower_case(path.join(__dirname, the_require_content_A))),
  fs.readFileSync(first_lower_case(__dirname + path.sep + the_require_content_B)),
  fs.readFileSync(first_lower_case(__dirname + '/' + the_require_content_B)),
  windows ? fs.readFileSync(first_lower_case(__dirname + '/\\' + the_require_content_B)) : '',
  windows ? fs.readFileSync(first_lower_case(__dirname + '\\' + the_require_content_B)) : '',
  windows ? fs.readFileSync(first_lower_case(__dirname + '\\/' + the_require_content_B)) : '',

  fs.readFileSync(first_upper_case(path.join(__dirname, the_require_content_A))),
  fs.readFileSync(first_upper_case(__dirname + path.sep + the_require_content_B)),
  fs.readFileSync(first_upper_case(__dirname + '/' + the_require_content_B)),
  windows ? fs.readFileSync(first_upper_case(__dirname + '/\\' + the_require_content_B)) : '',
  windows ? fs.readFileSync(first_upper_case(__dirname + '\\' + the_require_content_B)) : '',
  windows ? fs.readFileSync(first_upper_case(__dirname + '\\/' + the_require_content_B)) : '',

  //

  fs.readdirSync(__dirname).length > 0,
  fs.readdirSync(path.dirname(__dirname)).length > 0,
  fs.readdirSync(path.dirname(path.dirname(__dirname))).length > 0,

  fs.readdirSync(first_lower_case(__dirname)).length > 0,
  fs.readdirSync(first_lower_case(path.dirname(__dirname))).length > 0,
  fs.readdirSync(first_lower_case(path.dirname(path.dirname(__dirname)))).length > 0,

  fs.readdirSync(first_upper_case(__dirname)).length > 0,
  fs.readdirSync(first_upper_case(path.dirname(__dirname))).length > 0,
  fs.readdirSync(first_upper_case(path.dirname(path.dirname(__dirname)))).length > 0,

  //

  fs.existsSync(path.join(__dirname, the_require_content_A)),
  fs.existsSync(__dirname + path.sep + the_require_content_B),
  fs.existsSync(__dirname + '/' + the_require_content_B),
  windows ? fs.existsSync(__dirname + '/\\' + the_require_content_B) : '',
  windows ? fs.existsSync(__dirname + '\\' + the_require_content_B) : '',
  windows ? fs.existsSync(__dirname + '\\/' + the_require_content_B) : '',

  fs.existsSync(first_lower_case(path.join(__dirname, the_require_content_A))),
  fs.existsSync(first_lower_case(__dirname + path.sep + the_require_content_B)),
  fs.existsSync(first_lower_case(__dirname + '/' + the_require_content_B)),
  windows ? fs.existsSync(first_lower_case(__dirname + '/\\' + the_require_content_B)) : '',
  windows ? fs.existsSync(first_lower_case(__dirname + '\\' + the_require_content_B)) : '',
  windows ? fs.existsSync(first_lower_case(__dirname + '\\/' + the_require_content_B)) : '',

  fs.existsSync(first_upper_case(path.join(__dirname, the_require_content_A))),
  fs.existsSync(first_upper_case(__dirname + path.sep + the_require_content_B)),
  fs.existsSync(first_upper_case(__dirname + '/' + the_require_content_B)),
  windows ? fs.existsSync(first_upper_case(__dirname + '/\\' + the_require_content_B)) : '',
  windows ? fs.existsSync(first_upper_case(__dirname + '\\' + the_require_content_B)) : '',
  windows ? fs.existsSync(first_upper_case(__dirname + '\\/' + the_require_content_B)) : '',

  //

  fs.existsSync(path.join(__dirname, the_require_content_A + '-no-such')),
  fs.existsSync(__dirname + path.sep + the_require_content_B + '-no-such'),
  fs.existsSync(__dirname + '/' + the_require_content_B + '-no-such'),
  windows ? fs.existsSync(__dirname + '/\\' + the_require_content_B + '-no-such') : '',
  windows ? fs.existsSync(__dirname + '\\' + the_require_content_B + '-no-such') : '',
  windows ? fs.existsSync(__dirname + '\\/' + the_require_content_B + '-no-such') : '',

  fs.existsSync(first_lower_case(path.join(__dirname, the_require_content_A + '-no-such'))),
  fs.existsSync(first_lower_case(__dirname + path.sep + the_require_content_B + '-no-such')),
  fs.existsSync(first_lower_case(__dirname + '/' + the_require_content_B + '-no-such')),
  windows ? fs.existsSync(first_lower_case(__dirname + '/\\' + the_require_content_B + '-no-such')) : '',
  windows ? fs.existsSync(first_lower_case(__dirname + '\\' + the_require_content_B + '-no-such')) : '',
  windows ? fs.existsSync(first_lower_case(__dirname + '\\/' + the_require_content_B + '-no-such')) : '',

  fs.existsSync(first_upper_case(path.join(__dirname, the_require_content_A + '-no-such'))),
  fs.existsSync(first_upper_case(__dirname + path.sep + the_require_content_B + '-no-such')),
  fs.existsSync(first_upper_case(__dirname + '/' + the_require_content_B + '-no-such')),
  windows ? fs.existsSync(first_upper_case(__dirname + '/\\' + the_require_content_B + '-no-such')) : '',
  windows ? fs.existsSync(first_upper_case(__dirname + '\\' + the_require_content_B + '-no-such')) : '',
  windows ? fs.existsSync(first_upper_case(__dirname + '\\/' + the_require_content_B + '-no-such')) : '',

  //

  fs.accessSync(path.join(__dirname, the_require_content_A)),
  fs.accessSync(__dirname + path.sep + the_require_content_B),
  fs.accessSync(__dirname + '/' + the_require_content_B),
  windows ? fs.accessSync(__dirname + '/\\' + the_require_content_B) : '',
  windows ? fs.accessSync(__dirname + '\\' + the_require_content_B) : '',
  windows ? fs.accessSync(__dirname + '\\/' + the_require_content_B) : '',

  fs.accessSync(first_lower_case(path.join(__dirname, the_require_content_A))),
  fs.accessSync(first_lower_case(__dirname + path.sep + the_require_content_B)),
  fs.accessSync(first_lower_case(__dirname + '/' + the_require_content_B)),
  windows ? fs.accessSync(first_lower_case(__dirname + '/\\' + the_require_content_B)) : '',
  windows ? fs.accessSync(first_lower_case(__dirname + '\\' + the_require_content_B)) : '',
  windows ? fs.accessSync(first_lower_case(__dirname + '\\/' + the_require_content_B)) : '',

  fs.accessSync(first_upper_case(path.join(__dirname, the_require_content_A))),
  fs.accessSync(first_upper_case(__dirname + path.sep + the_require_content_B)),
  fs.accessSync(first_upper_case(__dirname + '/' + the_require_content_B)),
  windows ? fs.accessSync(first_upper_case(__dirname + '/\\' + the_require_content_B)) : '',
  windows ? fs.accessSync(first_upper_case(__dirname + '\\' + the_require_content_B)) : '',
  windows ? fs.accessSync(first_upper_case(__dirname + '\\/' + the_require_content_B)) : '',

  //

  fs.statSync(path.join(__dirname, the_require_content_A)).mode,
  fs.statSync(__dirname + path.sep + the_require_content_B).mode,
  fs.statSync(__dirname + '/' + the_require_content_B).mode,
  windows ? fs.statSync(__dirname + '/\\' + the_require_content_B).mode : '',
  windows ? fs.statSync(__dirname + '\\' + the_require_content_B).mode : '',
  windows ? fs.statSync(__dirname + '\\/' + the_require_content_B).mode : '',

  fs.statSync(first_lower_case(path.join(__dirname, the_require_content_A))).mode,
  fs.statSync(first_lower_case(__dirname + path.sep + the_require_content_B)).mode,
  fs.statSync(first_lower_case(__dirname + '/' + the_require_content_B)).mode,
  windows ? fs.statSync(first_lower_case(__dirname + '/\\' + the_require_content_B)).mode : '',
  windows ? fs.statSync(first_lower_case(__dirname + '\\' + the_require_content_B)).mode : '',
  windows ? fs.statSync(first_lower_case(__dirname + '\\/' + the_require_content_B)).mode : '',

  fs.statSync(first_upper_case(path.join(__dirname, the_require_content_A))).mode,
  fs.statSync(first_upper_case(__dirname + path.sep + the_require_content_B)).mode,
  fs.statSync(first_upper_case(__dirname + '/' + the_require_content_B)).mode,
  windows ? fs.statSync(first_upper_case(__dirname + '/\\' + the_require_content_B)).mode : '',
  windows ? fs.statSync(first_upper_case(__dirname + '\\' + the_require_content_B)).mode : '',
  windows ? fs.statSync(first_upper_case(__dirname + '\\/' + the_require_content_B)).mode : '',

  //

  fs.statSync(path.join(__dirname, the_require_content_A)).birthtime.getTime(),
  fs.statSync(__dirname + path.sep + the_require_content_B).birthtime.getTime(),
  fs.statSync(__dirname + '/' + the_require_content_B).birthtime.getTime(),
  windows ? fs.statSync(__dirname + '/\\' + the_require_content_B).birthtime.getTime() : '',
  windows ? fs.statSync(__dirname + '\\' + the_require_content_B).birthtime.getTime() : '',
  windows ? fs.statSync(__dirname + '\\/' + the_require_content_B).birthtime.getTime() : '',

  fs.statSync(first_lower_case(path.join(__dirname, the_require_content_A))).birthtime.getTime(),
  fs.statSync(first_lower_case(__dirname + path.sep + the_require_content_B)).birthtime.getTime(),
  fs.statSync(first_lower_case(__dirname + '/' + the_require_content_B)).birthtime.getTime(),
  windows ? fs.statSync(first_lower_case(__dirname + '/\\' + the_require_content_B)).birthtime.getTime() : '',
  windows ? fs.statSync(first_lower_case(__dirname + '\\' + the_require_content_B)).birthtime.getTime() : '',
  windows ? fs.statSync(first_lower_case(__dirname + '\\/' + the_require_content_B)).birthtime.getTime() : '',

  fs.statSync(first_upper_case(path.join(__dirname, the_require_content_A))).birthtime.getTime(),
  fs.statSync(first_upper_case(__dirname + path.sep + the_require_content_B)).birthtime.getTime(),
  fs.statSync(first_upper_case(__dirname + '/' + the_require_content_B)).birthtime.getTime(),
  windows ? fs.statSync(first_upper_case(__dirname + '/\\' + the_require_content_B)).birthtime.getTime() : '',
  windows ? fs.statSync(first_upper_case(__dirname + '\\' + the_require_content_B)).birthtime.getTime() : '',
  windows ? fs.statSync(first_upper_case(__dirname + '\\/' + the_require_content_B)).birthtime.getTime() : '',

  //

  fs.statSync(path.join(__dirname, the_require_content_A)).isFile(),
  fs.statSync(__dirname + path.sep + the_require_content_B).isFile(),
  fs.statSync(__dirname + '/' + the_require_content_B).isFile(),
  windows ? fs.statSync(__dirname + '/\\' + the_require_content_B).isFile() : '',
  windows ? fs.statSync(__dirname + '\\' + the_require_content_B).isFile() : '',
  windows ? fs.statSync(__dirname + '\\/' + the_require_content_B).isFile() : '',

  fs.statSync(first_lower_case(path.join(__dirname, the_require_content_A))).isFile(),
  fs.statSync(first_lower_case(__dirname + path.sep + the_require_content_B)).isFile(),
  fs.statSync(first_lower_case(__dirname + '/' + the_require_content_B)).isFile(),
  windows ? fs.statSync(first_lower_case(__dirname + '/\\' + the_require_content_B)).isFile() : '',
  windows ? fs.statSync(first_lower_case(__dirname + '\\' + the_require_content_B)).isFile() : '',
  windows ? fs.statSync(first_lower_case(__dirname + '\\/' + the_require_content_B)).isFile() : '',

  fs.statSync(first_upper_case(path.join(__dirname, the_require_content_A))).isFile(),
  fs.statSync(first_upper_case(__dirname + path.sep + the_require_content_B)).isFile(),
  fs.statSync(first_upper_case(__dirname + '/' + the_require_content_B)).isFile(),
  windows ? fs.statSync(first_upper_case(__dirname + '/\\' + the_require_content_B)).isFile() : '',
  windows ? fs.statSync(first_upper_case(__dirname + '\\' + the_require_content_B)).isFile() : '',
  windows ? fs.statSync(first_upper_case(__dirname + '\\/' + the_require_content_B)).isFile() : '',

  //

  fs.statSync(path.join(__dirname, the_require_content_A)).isDirectory(),
  fs.statSync(__dirname + path.sep + the_require_content_B).isDirectory(),
  fs.statSync(__dirname + '/' + the_require_content_B).isDirectory(),
  windows ? fs.statSync(__dirname + '/\\' + the_require_content_B).isDirectory() : '',
  windows ? fs.statSync(__dirname + '\\' + the_require_content_B).isDirectory() : '',
  windows ? fs.statSync(__dirname + '\\/' + the_require_content_B).isDirectory() : '',

  fs.statSync(first_lower_case(path.join(__dirname, the_require_content_A))).isDirectory(),
  fs.statSync(first_lower_case(__dirname + path.sep + the_require_content_B)).isDirectory(),
  fs.statSync(first_lower_case(__dirname + '/' + the_require_content_B)).isDirectory(),
  windows ? fs.statSync(first_lower_case(__dirname + '/\\' + the_require_content_B)).isDirectory() : '',
  windows ? fs.statSync(first_lower_case(__dirname + '\\' + the_require_content_B)).isDirectory() : '',
  windows ? fs.statSync(first_lower_case(__dirname + '\\/' + the_require_content_B)).isDirectory() : '',

  fs.statSync(first_upper_case(path.join(__dirname, the_require_content_A))).isDirectory(),
  fs.statSync(first_upper_case(__dirname + path.sep + the_require_content_B)).isDirectory(),
  fs.statSync(first_upper_case(__dirname + '/' + the_require_content_B)).isDirectory(),
  windows ? fs.statSync(first_upper_case(__dirname + '/\\' + the_require_content_B)).isDirectory() : '',
  windows ? fs.statSync(first_upper_case(__dirname + '\\' + the_require_content_B)).isDirectory() : '',
  windows ? fs.statSync(first_upper_case(__dirname + '\\/' + the_require_content_B)).isDirectory() : '',

  //

  fs.lstatSync(path.join(__dirname, the_require_content_A)).mode,
  fs.lstatSync(__dirname + path.sep + the_require_content_B).mode,
  fs.lstatSync(__dirname + '/' + the_require_content_B).mode,
  windows ? fs.lstatSync(__dirname + '/\\' + the_require_content_B).mode : '',
  windows ? fs.lstatSync(__dirname + '\\' + the_require_content_B).mode : '',
  windows ? fs.lstatSync(__dirname + '\\/' + the_require_content_B).mode : '',

  fs.lstatSync(first_lower_case(path.join(__dirname, the_require_content_A))).mode,
  fs.lstatSync(first_lower_case(__dirname + path.sep + the_require_content_B)).mode,
  fs.lstatSync(first_lower_case(__dirname + '/' + the_require_content_B)).mode,
  windows ? fs.lstatSync(first_lower_case(__dirname + '/\\' + the_require_content_B)).mode : '',
  windows ? fs.lstatSync(first_lower_case(__dirname + '\\' + the_require_content_B)).mode : '',
  windows ? fs.lstatSync(first_lower_case(__dirname + '\\/' + the_require_content_B)).mode : '',

  fs.lstatSync(first_upper_case(path.join(__dirname, the_require_content_A))).mode,
  fs.lstatSync(first_upper_case(__dirname + path.sep + the_require_content_B)).mode,
  fs.lstatSync(first_upper_case(__dirname + '/' + the_require_content_B)).mode,
  windows ? fs.lstatSync(first_upper_case(__dirname + '/\\' + the_require_content_B)).mode : '',
  windows ? fs.lstatSync(first_upper_case(__dirname + '\\' + the_require_content_B)).mode : '',
  windows ? fs.lstatSync(first_upper_case(__dirname + '\\/' + the_require_content_B)).mode : '',

  //

  fs.realpathSync(path.join(__dirname, the_require_content_A)).mode,
  fs.realpathSync(__dirname + path.sep + the_require_content_B).mode,
  fs.realpathSync(__dirname + '/' + the_require_content_B).mode,
  windows ? fs.realpathSync(__dirname + '/\\' + the_require_content_B).mode : '',
  windows ? fs.realpathSync(__dirname + '\\' + the_require_content_B).mode : '',
  windows ? fs.realpathSync(__dirname + '\\/' + the_require_content_B).mode : '',

  fs.realpathSync(first_lower_case(path.join(__dirname, the_require_content_A))).mode,
  fs.realpathSync(first_lower_case(__dirname + path.sep + the_require_content_B)).mode,
  fs.realpathSync(first_lower_case(__dirname + '/' + the_require_content_B)).mode,
  windows ? fs.realpathSync(first_lower_case(__dirname + '/\\' + the_require_content_B)).mode : '',
  windows ? fs.realpathSync(first_lower_case(__dirname + '\\' + the_require_content_B)).mode : '',
  windows ? fs.realpathSync(first_lower_case(__dirname + '\\/' + the_require_content_B)).mode : '',

  fs.realpathSync(first_upper_case(path.join(__dirname, the_require_content_A))).mode,
  fs.realpathSync(first_upper_case(__dirname + path.sep + the_require_content_B)).mode,
  fs.realpathSync(first_upper_case(__dirname + '/' + the_require_content_B)).mode,
  windows ? fs.realpathSync(first_upper_case(__dirname + '/\\' + the_require_content_B)).mode : '',
  windows ? fs.realpathSync(first_upper_case(__dirname + '\\' + the_require_content_B)).mode : '',
  windows ? fs.realpathSync(first_upper_case(__dirname + '\\/' + the_require_content_B)).mode : ''

].join('\n'));
