'use strict';

const path = require('path');
const util = require('util');
const fs = require('fs');
let fsp;

try {
  fsp = require('fs/promises');
} catch (_) {
  fsp = require('fs').promises;
}

const filePath = path.join(__dirname, 'files/test.txt');

async function test() {
  for (const key of ['stat', 'lstat']) {
    console.log(key, 'callback');
    const promisified = util.promisify(fs[key]);
    console.log(serialize(await promisified(filePath)));

    console.log(key, 'promise');
    console.log(serialize(await fsp[key](filePath)));
  }
}

function serialize(result) {
  if (!result) return null;
  return `${result.size} ${result.mode}`;
}

test();
