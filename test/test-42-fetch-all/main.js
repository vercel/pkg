#!/usr/bin/env node

'use strict';

const assert = require('assert');
const fetch = require('pkg-fetch');
const dontBuild = require('pkg-fetch/lib-es5/upload.js').dontBuild;
const knownPlatforms = fetch.system.knownPlatforms;
const items = [];

function nodeRangeToNodeVersion(nodeRange) {
  assert(/^node/.test(nodeRange));
  return 'v' + nodeRange.slice(4);
}

for (const platform of knownPlatforms) {
  const nodeRanges = ['node8', 'node10', 'node12', 'node14', 'node16'];
  for (const nodeRange of nodeRanges) {
    const nodeVersion = nodeRangeToNodeVersion(nodeRange);
    const archs = ['x64'];
    if (platform === 'win') archs.unshift('x86');
    if (platform === 'linux') archs.push('arm64');
    // linux-arm64 is needed in multi-arch tests,
    // so keeping it here as obligatory. but let's
    // leave compiling for freebsd to end users
    if (platform === 'freebsd') continue;
    for (const arch of archs) {
      if (dontBuild(nodeVersion, platform, arch)) continue;
      items.push({ nodeRange, platform, arch });
    }
  }
}

let p = Promise.resolve();
items.forEach((item) => {
  p = p.then(() => fetch.need(item));
});

p.catch((error) => {
  if (!error.wasReported) console.log(`> ${error}`);
  process.exit(2);
});
