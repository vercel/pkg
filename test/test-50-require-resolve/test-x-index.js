#!/usr/bin/env node

/* eslint-disable camelcase */
/* eslint-disable no-implicit-coercion */
/* eslint-disable no-multi-spaces */
/* eslint-disable no-useless-concat */

'use strict';

let fs = require('fs');
let path = require('path');

let the_resolve =                                require.resolve('./test-y-resolve.any');

let the_require_code_1 =                                  require('./test-z-require-code-1');
let the_require_code_2b =                         require.resolve('./test-z-require-code-2');
let the_require_code_3 =                                  require('./test-z-require-code-3.js');
let the_require_code_4b =                         require.resolve('./test-z-require-code-4.js');

let the_require_code_1x =                                 require('./test-z-require-code-1' + '');
let the_require_code_2bx =                        require.resolve('./test-z-require-code-2' + '');
let the_require_code_3x =                                 require('./test-z-require-code-3.js' + '');
let the_require_code_4bx =                        require.resolve('./test-z-require-code-4.js' + '');

let the_require_content =   fs.readFileSync(path.join(__dirname, './test-z-require-content.css'));
let the_require_contentx =  fs.readFileSync(path.join(__dirname, './test-z-require-content.css' + ''));

let the_require_json_1 =                                  require('./test-z-require-json-1');
let the_require_json_2b =                         require.resolve('./test-z-require-json-2');
let the_require_json_3 =                                  require('./test-z-require-json-3.json');
let the_require_json_4b =                         require.resolve('./test-z-require-json-4.json');

let the_require_json_1x =                                 require('./test-z-require-json-1' + '');
let the_require_json_2bx =                        require.resolve('./test-z-require-json-2' + '');
let the_require_json_3x =                                 require('./test-z-require-json-3.json' + '');
let the_require_json_4bx =                        require.resolve('./test-z-require-json-4.json' + '');

let the_require_json_5 =     fs.readFileSync(path.join(__dirname, './test-z-require-json-5.json'));
let the_require_json_5s =    fs.readFileSync(require.resolve(
                                             path.join(__dirname, './test-z-require-json-5.json')));

console.log([

  require(the_resolve).what,

  the_require_code_1.what,
  path.basename(the_require_code_2b),
  the_require_code_3.what,
  path.basename(the_require_code_4b),

  the_require_code_1x.what,
  path.basename(the_require_code_2bx),
  the_require_code_3x.what,
  path.basename(the_require_code_4bx),

  the_require_content.toString().split('\n')[0].split(' ')[0],
  the_require_contentx.toString().split('\n')[0].split(' ')[0],

  the_require_json_1.what,
  path.basename(the_require_json_2b),
  the_require_json_3.what,
  path.basename(the_require_json_4b),

  the_require_json_1x.what,
  path.basename(the_require_json_2bx),
  the_require_json_3x.what,
  path.basename(the_require_json_4bx),

  the_require_json_5.toString().split('"')[3],
  the_require_json_5s.toString().split('"')[3]

].join('\n'));
