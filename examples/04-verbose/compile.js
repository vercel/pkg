#!/usr/bin/env node

'use strict';

let flags = [];
let enclose = require('../../').exec;
flags.push('--loglevel', 'info');
flags.push('./index.js');
enclose(flags);
