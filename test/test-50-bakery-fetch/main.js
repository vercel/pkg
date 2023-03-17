#!/usr/bin/env node

'use strict';

const path = require('path');
const assert = require('assert');
const utils = require('../utils.js');
const fetch = require('pkg-fetch');

assert(!module.parent);
assert(__dirname === process.cwd());

const host = 'node' + process.version.match(/^v(\d+)/)[1];
const target = process.argv[2] || host;

let right;

fetch
  .need({
    nodeRange: target,
    platform: fetch.system.hostPlatform,
    arch: fetch.system.hostArch,
  })
  .then(function (needed) {
    if (process.platform === 'darwin') {
      utils.spawn.sync(
        'codesign',
        ['-fds', '-', './' + path.basename(needed)],
        { cwd: path.dirname(needed) }
      );
    }

    right = utils.spawn.sync(
      './' + path.basename(needed),
      ['--expose-gc', '-e', 'if (global.gc) console.log("ok");'],
      { cwd: path.dirname(needed), env: { PKG_EXECPATH: 'PKG_INVOKE_NODEJS' } }
    );

    assert.strictEqual(right, 'ok\n');
  })
  .catch(function (error) {
    console.error(`> ${error.message}`);
    process.exit(2);
  });
