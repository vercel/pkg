#!/usr/bin/env node

'use strict';

let nonLiteralInRequire = './views/profile.js';
let profile = require(nonLiteralInRequire);
console.log(profile);
