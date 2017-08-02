/* eslint-disable no-multi-spaces */
/* eslint-disable no-useless-concat */

'use strict';

var fs = require('fs');
var path = require('path');

var theResolve =                           require.resolve('./test-y-resolve.any');

var theReqCode1 =                                  require('./test-z-require-code-1');
var theReqCode2b =                         require.resolve('./test-z-require-code-2');
var theReqCode3 =                                  require('./test-z-require-code-3.js');
var theReqCode4b =                         require.resolve('./test-z-require-code-4.js');

var theReqCode1x =                                 require('./test-z-require-code-1' + '');
var theReqCode2bx =                        require.resolve('./test-z-require-code-2' + '');
var theReqCode3x =                                 require('./test-z-require-code-3.js' + '');
var theReqCode4bx =                        require.resolve('./test-z-require-code-4.js' + '');

var theReqContent =   fs.readFileSync(path.join(__dirname, './test-z-require-content.css'));
var theReqContentX =  fs.readFileSync(path.join(__dirname, './test-z-require-content.css' + ''));

var theReqJson1 =                                  require('./test-z-require-json-1');
var theReqJson2b =                         require.resolve('./test-z-require-json-2');
var theReqJson3 =                                  require('./test-z-require-json-3.json');
var theReqJson4b =                         require.resolve('./test-z-require-json-4.json');

var theReqJson1x =                                 require('./test-z-require-json-1' + '');
var theReqJson2bx =                        require.resolve('./test-z-require-json-2' + '');
var theReqJson3x =                                 require('./test-z-require-json-3.json' + '');
var theReqJson4bx =                        require.resolve('./test-z-require-json-4.json' + '');

var theReqJson5 =     fs.readFileSync(path.join(__dirname, './test-z-require-json-5.json'));
var theReqJson5s =    fs.readFileSync(require.resolve(
                                      path.join(__dirname, './test-z-require-json-5.json')));

console.log([

  require(theResolve).what,

  theReqCode1.what,
  path.basename(theReqCode2b),
  theReqCode3.what,
  path.basename(theReqCode4b),

  theReqCode1x.what,
  path.basename(theReqCode2bx),
  theReqCode3x.what,
  path.basename(theReqCode4bx),

  theReqContent.toString().split('\n')[0].split(' ')[0],
  theReqContentX.toString().split('\n')[0].split(' ')[0],

  theReqJson1.what,
  path.basename(theReqJson2b),
  theReqJson3.what,
  path.basename(theReqJson4b),

  theReqJson1x.what,
  path.basename(theReqJson2bx),
  theReqJson3x.what,
  path.basename(theReqJson4bx),

  theReqJson5.toString().split('"')[3],
  theReqJson5s.toString().split('"')[3]

].join('\n'));
