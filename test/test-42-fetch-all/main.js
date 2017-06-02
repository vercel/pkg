#!/usr/bin/env node

'use strict';

const assert = require('assert');
const fetch = require('pkg-fetch');
const dontBuild = require('pkg-fetch/lib-es5/upload.js').dontBuild;
const knownPlatforms = fetch.system.knownPlatforms;
const items = [];

function nodeRangeToNodeVersion (nodeRange) {
  assert(/^node/.test(nodeRange));
  return 'v' + nodeRange.slice(4);
}

for (const nodeRange of [ 'node0', 'node4', 'node6', 'node7', 'node8' ]) {
  const nodeVersion = nodeRangeToNodeVersion(nodeRange);
  for (const platform of knownPlatforms) {
    const archs = [ 'x86', 'x64' ];
    // preparing pkg-fetch arm binaries is an obstacle.
    // lets do arm building and pkg testing simultaneously
    // if (platform === 'linux') archs.push('armv6', 'armv7');
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
