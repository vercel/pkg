#!/usr/bin/env node

"use strict";

var nonLiteralInRequire = "./views/profile.js";
var profile = require(nonLiteralInRequire);
console.log(profile);
