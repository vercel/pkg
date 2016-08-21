#!/usr/bin/env node

let flags = [];
let enclose = require('../../').exec;
flags.push('--config', './config.js');
flags.push('./index.js');
enclose(flags);
