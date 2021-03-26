/* eslint-disable max-statements-per-line */
/* eslint-disable no-empty */

'use strict';

try {
  require.resolve('reqResSomeLit');
} catch (_) {}
try {
  require.resolve('reqResSomeLitMay', 'may-exclude');
} catch (_) {}
try {
  require.resolve('reqResSomeLitMust', 'must-exclude');
} catch (_) {}
try {
  require('reqSomeLit');
} catch (_) {}
try {
  require('reqSomeLitMay', 'may-exclude');
} catch (_) {}
try {
  require('reqSomeLitMust', 'must-exclude');
} catch (_) {}

var tryReqResSomeVar = 'some';
var tryReqResSomeVarMay = 'some';
var tryReqResSomeVarMust = 'some';

var tryReqSomeVar = 'some';
var tryReqSomeVarMay = 'some';
var tryReqSomeVarMust = 'some';

try {
  require.resolve(tryReqResSomeVar);
} catch (_) {}
try {
  require.resolve(tryReqResSomeVarMay, 'may-exclude');
} catch (_) {}
try {
  require.resolve(tryReqResSomeVarMust, 'must-exclude');
} catch (_) {}
try {
  require(tryReqSomeVar);
} catch (_) {}
try {
  require(tryReqSomeVarMay, 'may-exclude');
} catch (_) {}
try {
  require(tryReqSomeVarMust, 'must-exclude');
} catch (_) {}

var reqResSomeVar = 'some';
var reqResSomeVarMay = 'some';
var reqResSomeVarMust = 'some';

var reqSomeVar = 'some';
var reqSomeVarMay = 'some';
var reqSomeVarMust = 'some';

require.resolve(reqResSomeVar);
require.resolve(reqResSomeVarMay, 'may-exclude');
require.resolve(reqResSomeVarMust, 'must-exclude');
require.resolve(reqResSomeVar, reqResSomeVar);
require.resolve(reqResSomeVar, 'can-can');
require(reqSomeVar);
require(reqSomeVarMay, 'may-exclude');
require(reqSomeVarMust, 'must-exclude');
require(reqSomeVar, reqSomeVar);
require(reqSomeVar, 'can-can');

require.resolve('./test-y-index.js');
require('./test-y-index.js');
