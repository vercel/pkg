/* eslint-disable no-multi-spaces */

'use strict';

var fs = require('fs');
var path = require('path');

/*
var theResolveA =    require.resolve("./test-y-resolve-A.txt");
var theResolveB =    require.resolve("./test-y-resolve-B.txt", "must-exclude");
var theResolveB2 =   require.resolve("./test-y-resolve-B.txt", "may-exclude");
var theResolvePathC =                "./test-y-resolve-C.txt"; var theResolveC = require.resolve(theResolvePathC);
var theResolvePathD =                "./test-y-resolve-D.txt"; var theResolveD = require.resolve(theResolvePathD, "must-exclude");
var theResolvePathD2 =               "./test-y-resolve-D.txt"; var theResolveD2 = require.resolve(theResolvePathD2, "may-exclude");
var theResolveE =    require.resolve("./test-y-resolve-E.txt");
var theResolveF =    require.resolve("./test-y-resolve-F.txt", "must-exclude");
var theResolveF2 =   require.resolve("./test-y-resolve-F.txt", "may-exclude");
var theResolvePathG =                "./test-y-resolve-G.txt"; var theResolveG = require.resolve(theResolvePathG);
var theResolvePathH =                "./test-y-resolve-H.txt"; var theResolveH = require.resolve(theResolvePathH, "must-exclude");
var theResolvePathH2 =               "./test-y-resolve-H.txt"; var theResolveH2 = require.resolve(theResolvePathH2, "may-exclude");
*/
var theReqCodeI =                                  require('./test-z-require-code-I.js');
var theReqCodeJ =                                  require('./test-z-require-code-J.js', 'must-exclude');
var theReqCodeJ2 =                                 require('./test-z-require-code-J.js', 'may-exclude');
var theReqContentK =                       fs.readFileSync('./test-z-require-content-K.txt');
var theReqContentL =                       fs.readFileSync('./test-z-require-content-L.txt', null, 'must-exclude');
var theReqContentL2 =                      fs.readFileSync('./test-z-require-content-L.txt', null, 'may-exclude');
var theReqContentM =  fs.readFileSync(path.join(__dirname, './test-z-require-content-M.txt'));
var theReqContentN =  fs.readFileSync(path.join(__dirname, './test-z-require-content-N.txt'), null, 'must-exclude');
var theReqContentN2 = fs.readFileSync(path.join(__dirname, './test-z-require-content-N.txt'), null, 'may-exclude');

console.log([
//  fs.readFileSync(theResolveA).toString(),
//  fs.readFileSync(theResolveB).toString(),
//  fs.readFileSync(theResolveC).toString(),
//  fs.readFileSync(theResolveD).toString(),
//  fs.readFileSync(theResolveE).toString(),
//  fs.readFileSync(theResolveF, null, "must-exclude").toString(),
//  fs.readFileSync(theResolveG).toString(),
//  fs.readFileSync(theResolveH, null, "must-exclude").toString(),
  theReqCodeI.v,
  theReqCodeJ.v,
  theReqCodeJ2.v,
  theReqContentK.toString(),
  theReqContentL.toString(),
  theReqContentL2.toString(),
  theReqContentM.toString(),
  theReqContentN.toString(),
  theReqContentN2.toString()
].join('\n'));
