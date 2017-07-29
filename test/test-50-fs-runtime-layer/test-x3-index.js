/* eslint-disable brace-style */
/* eslint-disable no-path-concat */

'use strict';

var fs = require('fs');
var path = require('path');
var assert = require('assert');
var theRequireContentA = './test-z-asset-A.css';
var theRequireContentB = 'test-z-asset-B.css';

function firstLowerCase (s) {
  return s.slice(0, 1).toLowerCase() + s.slice(1);
}

function firstUpperCase (s) {
  return s.slice(0, 1).toUpperCase() + s.slice(1);
}

// ///////////////////////////////////////////////////////////////////////////

fs.exists(path.join(__dirname, theRequireContentA), function (e82, v82) {
fs.exists(__dirname + path.sep + theRequireContentB, function (e83, v83) {
fs.exists(__dirname + '/' + theRequireContentB, function (e84, v84) {
fs.exists(firstLowerCase(path.join(__dirname, theRequireContentA)), function (e85, v85) {
fs.exists(firstLowerCase(__dirname + path.sep + theRequireContentB), function (e86, v86) {
fs.exists(firstLowerCase(__dirname + '/' + theRequireContentB), function (e87, v87) {
fs.exists(firstUpperCase(path.join(__dirname, theRequireContentA)), function (e88, v88) {
fs.exists(firstUpperCase(__dirname + path.sep + theRequireContentB), function (e89, v89) {
fs.exists(firstUpperCase(__dirname + '/' + theRequireContentB), function (e90, v90) {
//

fs.exists(path.join(__dirname, theRequireContentA + '-no-such'), function (e91, v91) {
fs.exists(__dirname + path.sep + theRequireContentB + '-no-such', function (e92, v92) {
fs.exists(__dirname + '/' + theRequireContentB + '-no-such', function (e93, v93) {
fs.exists(firstLowerCase(path.join(__dirname, theRequireContentA + '-no-such')), function (e94, v94) {
fs.exists(firstLowerCase(__dirname + path.sep + theRequireContentB + '-no-such'), function (e95, v95) {
fs.exists(firstLowerCase(__dirname + '/' + theRequireContentB + '-no-such'), function (e96, v96) {
fs.exists(firstUpperCase(path.join(__dirname, theRequireContentA + '-no-such')), function (e97, v97) {
fs.exists(firstUpperCase(__dirname + path.sep + theRequireContentB + '-no-such'), function (e98, v98) {
fs.exists(firstUpperCase(__dirname + '/' + theRequireContentB + '-no-such'), function (e99, v99) {
//

fs.access(path.join(__dirname, theRequireContentA), function (e100, v100) {
fs.access(__dirname + path.sep + theRequireContentB, function (e101, v101) {
fs.access(__dirname + '/' + theRequireContentB, function (e102, v102) {
fs.access(firstLowerCase(path.join(__dirname, theRequireContentA)), function (e103, v103) {
fs.access(firstLowerCase(__dirname + path.sep + theRequireContentB), function (e104, v104) {
fs.access(firstLowerCase(__dirname + '/' + theRequireContentB), function (e105, v105) {
fs.access(firstUpperCase(path.join(__dirname, theRequireContentA)), function (e106, v106) {
fs.access(firstUpperCase(__dirname + path.sep + theRequireContentB), function (e107, v107) {
fs.access(firstUpperCase(__dirname + '/' + theRequireContentB), function (e108, v108) {
//

fs.access(path.join(__dirname, theRequireContentA + '-no-such'), function (e109, v109) {
fs.access(__dirname + path.sep + theRequireContentB + '-no-such', function (e110, v110) {
fs.access(__dirname + '/' + theRequireContentB + '-no-such', function (e111, v111) {
fs.access(firstLowerCase(path.join(__dirname, theRequireContentA + '-no-such')), function (e112, v112) {
fs.access(firstLowerCase(__dirname + path.sep + theRequireContentB + '-no-such'), function (e113, v113) {
fs.access(firstLowerCase(__dirname + '/' + theRequireContentB + '-no-such'), function (e114, v114) {
fs.access(firstUpperCase(path.join(__dirname, theRequireContentA + '-no-such')), function (e115, v115) {
fs.access(firstUpperCase(__dirname + path.sep + theRequireContentB + '-no-such'), function (e116, v116) {
fs.access(firstUpperCase(__dirname + '/' + theRequireContentB + '-no-such'), function (e117, v117) {
//

fs.stat(path.join(__dirname, theRequireContentA), function (e118, v118) {
fs.stat(__dirname + path.sep + theRequireContentB, function (e119, v119) {
fs.stat(__dirname + '/' + theRequireContentB, function (e120, v120) {
fs.stat(firstLowerCase(path.join(__dirname, theRequireContentA)), function (e121, v121) {
fs.stat(firstLowerCase(__dirname + path.sep + theRequireContentB), function (e122, v122) {
fs.stat(firstLowerCase(__dirname + '/' + theRequireContentB), function (e123, v123) {
fs.stat(firstUpperCase(path.join(__dirname, theRequireContentA)), function (e124, v124) {
fs.stat(firstUpperCase(__dirname + path.sep + theRequireContentB), function (e125, v125) {
fs.stat(firstUpperCase(__dirname + '/' + theRequireContentB), function (e126, v126) {
//

fs.lstat(path.join(__dirname, theRequireContentA), function (e127, v127) {
fs.lstat(__dirname + path.sep + theRequireContentB, function (e128, v128) {
fs.lstat(__dirname + '/' + theRequireContentB, function (e129, v129) {
fs.lstat(firstLowerCase(path.join(__dirname, theRequireContentA)), function (e130, v130) {
fs.lstat(firstLowerCase(__dirname + path.sep + theRequireContentB), function (e131, v131) {
fs.lstat(firstLowerCase(__dirname + '/' + theRequireContentB), function (e132, v132) {
fs.lstat(firstUpperCase(path.join(__dirname, theRequireContentA)), function (e133, v133) {
fs.lstat(firstUpperCase(__dirname + path.sep + theRequireContentB), function (e134, v134) {
fs.lstat(firstUpperCase(__dirname + '/' + theRequireContentB), function (e135, v135) {
//

fs.realpath(path.join(__dirname, theRequireContentA), function (e145, v145) {
fs.realpath(__dirname + path.sep + theRequireContentB, function (e146, v146) {
fs.realpath(__dirname + '/' + theRequireContentB, function (e147, v147) {
fs.realpath(firstLowerCase(path.join(__dirname, theRequireContentA)), function (e148, v148) {
fs.realpath(firstLowerCase(__dirname + path.sep + theRequireContentB), function (e149, v149) {
fs.realpath(firstLowerCase(__dirname + '/' + theRequireContentB), function (e150, v150) {
fs.realpath(firstUpperCase(path.join(__dirname, theRequireContentA)), function (e151, v151) {
fs.realpath(firstUpperCase(__dirname + path.sep + theRequireContentB), function (e152, v152) {
fs.realpath(firstUpperCase(__dirname + '/' + theRequireContentB), function (e153, v153) {
  console.log([

    '******************************************************',
    '******************************************************',
    '******************************************************',

    'exists', assert(v82 === undefined),
    e82, v82 === undefined,
    e83, v83 === undefined,
    e84, v84 === undefined,
    e85, v85 === undefined,
    e86, v86 === undefined,
    e87, v87 === undefined,
    e88, v88 === undefined,
    e89, v89 === undefined,
    e90, v90 === undefined,

    '******************************************************',
    '******************************************************',
    '******************************************************',

    'exists-no-such', assert(v91 === undefined),
    e91, v91 === undefined,
    e92, v92 === undefined,
    e93, v93 === undefined,
    e94, v94 === undefined,
    e95, v95 === undefined,
    e96, v96 === undefined,
    e97, v97 === undefined,
    e98, v98 === undefined,
    e99, v99 === undefined,

    '******************************************************',
    '******************************************************',
    '******************************************************',

    'access', assert(v100 === undefined || v100 === 0),
    e100 === null, v100 === undefined || v100 === 0, // odd behaviour in 0.12.14
    e101 === null, v101 === undefined || v101 === 0, // callback args are (null, 0). wtf 0?
    e102 === null, v102 === undefined || v102 === 0,
    e103 === null, v103 === undefined || v103 === 0,
    e104 === null, v104 === undefined || v104 === 0,
    e105 === null, v105 === undefined || v105 === 0,
    e106 === null, v106 === undefined || v106 === 0,
    e107 === null, v107 === undefined || v107 === 0,
    e108 === null, v108 === undefined || v108 === 0,

    '******************************************************',
    '******************************************************',
    '******************************************************',

    'access-no-such', assert(v109 === undefined),
    e109.errno, e109.code, v109 === undefined,
    e110.errno, e110.code, v110 === undefined,
    e111.errno, e111.code, v111 === undefined,
    e112.errno, e112.code, v112 === undefined,
    e113.errno, e113.code, v113 === undefined,
    e114.errno, e114.code, v114 === undefined,
    e115.errno, e115.code, v115 === undefined,
    e116.errno, e116.code, v116 === undefined,
    e117.errno, e117.code, v117 === undefined,

    '******************************************************',
    '******************************************************',
    '******************************************************',

    'stat', assert(e118 === null),
    e118 === null, v118.mode, v118.birthtime.getYear(), v118.isFile(), v118.isDirectory(),
    e119 === null, v119.mode, v119.birthtime.getYear(), v119.isFile(), v119.isDirectory(),
    e120 === null, v120.mode, v120.birthtime.getYear(), v120.isFile(), v120.isDirectory(),
    e121 === null, v121.mode, v121.birthtime.getYear(), v121.isFile(), v121.isDirectory(),
    e122 === null, v122.mode, v122.birthtime.getYear(), v122.isFile(), v122.isDirectory(),
    e123 === null, v123.mode, v123.birthtime.getYear(), v123.isFile(), v123.isDirectory(),
    e124 === null, v124.mode, v124.birthtime.getYear(), v124.isFile(), v124.isDirectory(),
    e125 === null, v125.mode, v125.birthtime.getYear(), v125.isFile(), v125.isDirectory(),
    e126 === null, v126.mode, v126.birthtime.getYear(), v126.isFile(), v126.isDirectory(),

    '******************************************************',
    '******************************************************',
    '******************************************************',

    'lstat', assert(e127 === null),
    e127 === null, v127.mode, v127.birthtime.getYear(), v127.isFile(), v127.isDirectory(),
    e128 === null, v128.mode, v128.birthtime.getYear(), v128.isFile(), v128.isDirectory(),
    e129 === null, v129.mode, v129.birthtime.getYear(), v129.isFile(), v129.isDirectory(),
    e130 === null, v130.mode, v130.birthtime.getYear(), v130.isFile(), v130.isDirectory(),
    e131 === null, v131.mode, v131.birthtime.getYear(), v131.isFile(), v131.isDirectory(),
    e132 === null, v132.mode, v132.birthtime.getYear(), v132.isFile(), v132.isDirectory(),
    e133 === null, v133.mode, v133.birthtime.getYear(), v133.isFile(), v133.isDirectory(),
    e134 === null, v134.mode, v134.birthtime.getYear(), v134.isFile(), v134.isDirectory(),
    e135 === null, v135.mode, v135.birthtime.getYear(), v135.isFile(), v135.isDirectory(),

    '******************************************************',
    '******************************************************',
    '******************************************************',

    'realpath', assert(e145 === null),
    e145 === null, path.basename(v145), path.basename(path.dirname(v145)),
    e146 === null, path.basename(v146), path.basename(path.dirname(v146)),
    e147 === null, path.basename(v147), path.basename(path.dirname(v147)),
    e148 === null, path.basename(v148), path.basename(path.dirname(v148)),
    e149 === null, path.basename(v149), path.basename(path.dirname(v149)),
    e150 === null, path.basename(v150), path.basename(path.dirname(v150)),
    e151 === null, path.basename(v151), path.basename(path.dirname(v151)),
    e152 === null, path.basename(v152), path.basename(path.dirname(v152)),
    e153 === null, path.basename(v153), path.basename(path.dirname(v153)),

    '******************************************************',
    '******************************************************',
    '******************************************************'

  ].join('\n'));
}); }); }); }); }); }); }); }); });
}); }); }); }); }); }); }); }); });
}); }); }); }); }); }); }); }); });
}); }); }); }); }); }); }); }); });
}); }); }); }); }); }); }); }); });
}); }); }); }); }); }); }); }); });
}); }); }); }); }); }); }); }); });
