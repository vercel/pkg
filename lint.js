#!/usr/bin/env node

"use strict";

var assert = require("assert");
var eslint = require("enclose-eslint")("eslint/lib/cli.js");
var eslintrc = require.resolve("enclose-eslint/.eslintrc.json");

assert(!module.parent);
assert.equal(__dirname, process.cwd());

var args = [ "--config", eslintrc, "**/*.js" ];
var result = eslint.execute(args.join(" "));
assert(result === 0, "lint failed");
