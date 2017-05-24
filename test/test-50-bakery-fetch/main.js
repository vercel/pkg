#!/usr/bin/env node

'use strict';

const path = require('path');
const assert = require('assert');
const utils = require('../utils.js');
const fetch = require('pkg-fetch');

assert(!module.parent);
assert(__dirname === process.cwd());

const host = 'node' + process.version[1];
const target = process.argv[2] || host;

let right;

fetch.need({
  nodeRange: target,
  platform: fetch.system.hostPlatform,
  arch: fetch.system.hostArch
}).then(function (needed) {
  right = utils.spawn.sync(
    './' + path.basename(needed),
    [ '-e', 'if (global.gc) console.log("ok");',
      '--runtime', '--expose-gc' ],
    { cwd: path.dirname(needed) }
  );

  assert.equal(right, 'ok\n');
}).catch(function (error) {
  console.error(`> ${error.message}`);
  process.exit(2);
});
