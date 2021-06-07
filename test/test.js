#!/usr/bin/env node

'use strict';

const chalk = require('chalk');
const globby = require('globby');
const path = require('path');
const utils = require('./utils.js');
const host = 'node' + process.version.match(/^v(\d+)/)[1];
let target = process.argv[2] || 'host';
if (target === 'host') target = host;

// note to developer , you can use
//    FLAVOR=test-1191 npm test
// if you only want to run all combination of this specific test case
// ( the env variable FLAVOR takes precedence over the second argument passed to this main.js file)

const flavor = process.env.FLAVOR || process.argv[3] || 'all';

console.log('');
console.log('*************************************');
console.log(target + ' ' + flavor);
console.log('*************************************');
console.log('');

if (process.env.CI) {
  if (
    target === 'node0' ||
    target === 'node4' ||
    target === 'node6' ||
    target === 'node7' ||
    target === 'node9' ||
    target === 'node11' ||
    target === 'node13' ||
    target === 'node15'
  ) {
    console.log(target + ' is skipped in CI!');
    console.log('');
    process.exit();
  }
}

function joinAndForward(d) {
  let r = path.join(__dirname, d);
  if (process.platform === 'win32') r = r.replace(/\\/g, '/');
  return r;
}

const list = [];

if (flavor.match(/^test/)) {
  list.push(joinAndForward(`${flavor}/main.js`));
} else if (flavor === 'only-npm') {
  list.push(joinAndForward('test-79-npm/main.js'));
} else {
  list.push(joinAndForward('**/main.js'));
  if (flavor === 'no-npm') {
    list.push('!' + joinAndForward('test-42-fetch-all'));
    list.push('!' + joinAndForward('test-46-multi-arch'));
    list.push('!' + joinAndForward('test-46-multi-arch-2'));
    list.push('!' + joinAndForward('test-79-npm'));
  }
}

const files = globby.sync(list);

files.sort().some(function (file) {
  file = path.resolve(file);
  try {
    utils.spawn.sync('node', [path.basename(file), target], {
      cwd: path.dirname(file),
      stdio: 'inherit',
    });
  } catch (error) {
    console.log();
    console.log(`> ${chalk.red('Error!')} ${error.message}`);
    console.log(`> ${chalk.red('Error!')} ${file} FAILED (in ${target})`);
    process.exit(2);
  }
  console.log(file, 'ok');
});
