#!/usr/bin/env node

let nonLiteralInRequire = './views/profile.js';
let profile = require(nonLiteralInRequire);
console.log(profile);
