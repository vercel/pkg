#!/usr/bin/env node

'use strict';

const fetch = require('pkg-fetch');
const knownPlatforms = fetch.system.knownPlatforms;
const items = [];

for (const nodeRange of [ 'node0', 'node4', 'node6' ]) {
  for (const platform of knownPlatforms) {
    // const archs = (platform === 'linux' ? knownArchs : [ 'x86', 'x64' ]); // TODO armv6/7?
    const archs = [ 'x64' ]; // TODO 'x86'
    for (const arch of archs) {
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
