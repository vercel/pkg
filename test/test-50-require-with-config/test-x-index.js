/* eslint-disable max-statements-per-line */
/* eslint-disable no-multi-spaces */
/* eslint-disable no-useless-concat */

'use strict';

var fs = require('fs');
var path = require('path');
var theResolveA =        require.resolve('./test-y-' + 'resolve-A.txt');
var theResolveB =        require.resolve('./test-y-' + 'resolve-B.txt', 'must-exclude');
var theResolvePathC =                    './test-y-' + 'resolve-C.txt'; var theResolveC = require.resolve(theResolvePathC);
var theResolvePathD =                    './test-y-' + 'resolve-D.txt'; var theResolveD = require.resolve(theResolvePathD, 'must-exclude');
var theResolveE =        require.resolve('./test-y-' + 'resolve-E.txt');
var theResolveF =        require.resolve('./test-y-' + 'resolve-F.txt', 'must-exclude');
var theResolvePathG =                    './test-y-' + 'resolve-G.txt'; var theResolveG = require.resolve(theResolvePathG);
var theResolvePathH =                    './test-y-' + 'resolve-H.txt'; var theResolveH = require.resolve(theResolvePathH, 'must-exclude');
var theReqCodeI =                require('./test-z-' + 'require-code-I.js');
var theReqCodeJ =   require(path.resolve('./test-z-' + 'require-code-J'));
var theReqContentK =     fs.readFileSync('./test-z-' + 'require-content-K.txt');
var theReqContentL =     fs.readFileSync('./test-z-' + 'require-content-L.txt', null, 'must-exclude');
var theReqContentM = fs.readFileSync(path.join(__dirname,
                                         './test-z-' + 'require-content-M.txt'));
var theReqContentN = fs.readFileSync(path.join(__dirname,
                                         './test-z-' + 'require-content-N.txt'), null, 'must-exclude');

console.log([
  fs.readFileSync(theResolveA).toString(),
  fs.readFileSync(theResolveB).toString(),
  fs.readFileSync(theResolveC).toString(),
  fs.readFileSync(theResolveD).toString(),
  fs.readFileSync(theResolveE).toString(),
  fs.readFileSync(theResolveF, null, 'must-exclude').toString(),
  fs.readFileSync(theResolveG).toString(),
  fs.readFileSync(theResolveH, null, 'must-exclude').toString(),
  theReqCodeI.v,
  theReqCodeJ.v,
  theReqContentK.toString(),
  theReqContentL.toString(),
  theReqContentM.toString(),
  theReqContentN.toString()
].join('\n'));
