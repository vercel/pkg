#!/usr/bin/env node

/* eslint-disable camelcase */
/* eslint-disable no-multi-spaces */

"use strict";

var fs = require("fs");
var path = require("path");
/*
var the_rs_A =    require.resolve("./test-y-resolve-A.txt");
var the_rs_B =    require.resolve("./test-y-resolve-B.txt", "dont-enclose");
var the_rs_B2 =   require.resolve("./test-y-resolve-B.txt", "can-ignore");
var the_rs_C_path =               "./test-y-resolve-C.txt"; var the_rs_C = require.resolve(the_rs_C_path);
var the_rs_D_path =               "./test-y-resolve-D.txt"; var the_rs_D = require.resolve(the_rs_D_path, "dont-enclose");
var the_rs_D2_path =              "./test-y-resolve-D.txt"; var the_rs_D = require.resolve(the_rs_D_path, "can-ignore");
var the_rs_E =    require.resolve("./test-y-resolve-E.txt");
var the_rs_F =    require.resolve("./test-y-resolve-F.txt", "dont-enclose");
var the_rs_F2 =   require.resolve("./test-y-resolve-F.txt", "can-ignore");
var the_rs_G_path =               "./test-y-resolve-G.txt"; var the_rs_G = require.resolve(the_rs_G_path);
var the_rs_H_path =               "./test-y-resolve-H.txt"; var the_rs_H = require.resolve(the_rs_H_path, "dont-enclose");
var the_rs_H2_path =              "./test-y-resolve-H.txt"; var the_rs_H = require.resolve(the_rs_H_path, "can-ignore");
*/
var the_rqcd_I =                                require("./test-z-require-code-I.js");
var the_rqcd_J =                                require("./test-z-require-code-J.js", "dont-enclose");
var the_rqcd_J2 =                               require("./test-z-require-code-J.js", "can-ignore");
var the_rqcnt_K =                       fs.readFileSync("./test-z-require-content-K.txt");
var the_rqcnt_L =                       fs.readFileSync("./test-z-require-content-L.txt", null, "dont-enclose");
var the_rqcnt_L2 =                      fs.readFileSync("./test-z-require-content-L.txt", null, "can-ignore");
var the_rqcnt_M =  fs.readFileSync(path.join(__dirname, "./test-z-require-content-M.txt"));
var the_rqcnt_N =  fs.readFileSync(path.join(__dirname, "./test-z-require-content-N.txt"), null, "dont-enclose");
var the_rqcnt_N2 = fs.readFileSync(path.join(__dirname, "./test-z-require-content-N.txt"), null, "can-ignore");

console.log([
//  fs.readFileSync(the_rs_A).toString(),
//  fs.readFileSync(the_rs_B).toString(),
//  fs.readFileSync(the_rs_C).toString(),
//  fs.readFileSync(the_rs_D).toString(),
//  fs.readFileSync(the_rs_E).toString(),
//  fs.readFileSync(the_rs_F, null, "dont-enclose").toString(),
//  fs.readFileSync(the_rs_G).toString(),
//  fs.readFileSync(the_rs_H, null, "dont-enclose").toString(),
  the_rqcd_I.v,
  the_rqcd_J.v,
  the_rqcd_J2.v,
  the_rqcnt_K.toString(),
  the_rqcnt_L.toString(),
  the_rqcnt_L2.toString(),
  the_rqcnt_M.toString(),
  the_rqcnt_N.toString(),
  the_rqcnt_N2.toString()
].join("\n"));
