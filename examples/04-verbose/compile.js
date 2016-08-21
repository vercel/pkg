#!/usr/bin/env node

let flags = [];
let enclose = require('../../').exec;
flags.push('--loglevel', 'info');
flags.push('./index.js');
enclose(flags);
