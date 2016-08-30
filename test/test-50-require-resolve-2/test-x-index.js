#!/usr/bin/env node

/* eslint-disable camelcase */
/* eslint-disable no-multi-spaces */

'use strict';

var fs = require('fs');
var path = require('path');

/*
var the_rs_A =    require.resolve("./test-y-resolve-A.txt");
var the_rs_B =    require.resolve("./test-y-resolve-B.txt", "must-exclude");
var the_rs_B2 =   require.resolve("./test-y-resolve-B.txt", "may-exclude");
var the_rs_C_path =               "./test-y-resolve-C.txt"; var the_rs_C = require.resolve(the_rs_C_path);
var the_rs_D_path =               "./test-y-resolve-D.txt"; var the_rs_D = require.resolve(the_rs_D_path, "must-exclude");
var the_rs_D2_path =              "./test-y-resolve-D.txt"; var the_rs_D = require.resolve(the_rs_D_path, "may-exclude");
var the_rs_E =    require.resolve("./test-y-resolve-E.txt");
var the_rs_F =    require.resolve("./test-y-resolve-F.txt", "must-exclude");
var the_rs_F2 =   require.resolve("./test-y-resolve-F.txt", "may-exclude");
var the_rs_G_path =               "./test-y-resolve-G.txt"; var the_rs_G = require.resolve(the_rs_G_path);
var the_rs_H_path =               "./test-y-resolve-H.txt"; var the_rs_H = require.resolve(the_rs_H_path, "must-exclude");
var the_rs_H2_path =              "./test-y-resolve-H.txt"; var the_rs_H = require.resolve(the_rs_H_path, "may-exclude");
*/
var the_rqcd_I =                                require('./test-z-require-code-I.js');
var the_rqcd_J =                                require('./test-z-require-code-J.js', 'must-exclude');
var the_rqcd_J2 =                               require('./test-z-require-code-J.js', 'may-exclude');
var the_rqcnt_K =                       fs.readFileSync('./test-z-require-content-K.txt');
var the_rqcnt_L =                       fs.readFileSync('./test-z-require-content-L.txt', null, 'must-exclude');
var the_rqcnt_L2 =                      fs.readFileSync('./test-z-require-content-L.txt', null, 'may-exclude');
var the_rqcnt_M =  fs.readFileSync(path.join(__dirname, './test-z-require-content-M.txt'));
var the_rqcnt_N =  fs.readFileSync(path.join(__dirname, './test-z-require-content-N.txt'), null, 'must-exclude');
var the_rqcnt_N2 = fs.readFileSync(path.join(__dirname, './test-z-require-content-N.txt'), null, 'may-exclude');

console.log([
//  fs.readFileSync(the_rs_A).toString(),
//  fs.readFileSync(the_rs_B).toString(),
//  fs.readFileSync(the_rs_C).toString(),
//  fs.readFileSync(the_rs_D).toString(),
//  fs.readFileSync(the_rs_E).toString(),
//  fs.readFileSync(the_rs_F, null, "must-exclude").toString(),
//  fs.readFileSync(the_rs_G).toString(),
//  fs.readFileSync(the_rs_H, null, "must-exclude").toString(),
  the_rqcd_I.v,
  the_rqcd_J.v,
  the_rqcd_J2.v,
  the_rqcnt_K.toString(),
  the_rqcnt_L.toString(),
  the_rqcnt_L2.toString(),
  the_rqcnt_M.toString(),
  the_rqcnt_N.toString(),
  the_rqcnt_N2.toString()
].join('\n'));
