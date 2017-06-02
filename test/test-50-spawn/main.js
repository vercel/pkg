#!/usr/bin/env node

'use strict';

const path = require('path');
const assert = require('assert');
const utils = require('../utils.js');

assert(!module.parent);
assert(__dirname === process.cwd());

const target = process.argv[2] || 'host';

function rnd () {
  return Math.random().toString().slice(-6);
}

const pairs = [
  { input: './test-cluster.js', output: './test-output-' + rnd() + '.exe' },
  { input: './test-cpfork-a-1.js', output: './test-output-' + rnd() + '.exe' },
  { input: './test-cpfork-a-2.js', output: './test-output-' + rnd() + '.exe' },
  { input: './test-cpfork-b-1.js', output: './test-output-' + rnd() + '.exe' },
  { input: './test-cpfork-b-2.js', output: './test-output-' + rnd() + '.exe' },
  { input: './test-execFile-a-1.js', output: './test-output-' + rnd() + '.exe' },
  { input: './test-execFile-a-2.js', output: './test-output-' + rnd() + '.exe' },
  { input: './test-spawn-a-1.js', output: './test-output-' + rnd() + '.exe' },
  { input: './test-spawn-a-2.js', output: './test-output-' + rnd() + '.exe' },
  { input: './test-spawn-a-3.js', output: './test-output-' + rnd() + '.exe' },
  { input: './test-spawn-a-4.js', output: './test-output-' + rnd() + '.exe' },
  { input: './test-spawn-a-5.js', output: './test-output-' + rnd() + '.exe' },
  { input: './test-spawn-a-6.js', output: './test-output-' + rnd() + '.exe' },
  { input: './test-spawn-a-7.js', output: './test-output-' + rnd() + '.exe' },
  { input: './test-spawn-a-8.js', output: './test-output-' + rnd() + '.exe' },
  { input: './test-spawn-b-1.js', output: './test-output-' + rnd() + '.exe' },
  { input: './test-spawn-b-2.js', output: './test-output-' + rnd() + '.exe' },
  { input: './test-spawnSync-a-1.js', output: './test-output-' + rnd() + '.exe' },
  { input: './test-spawnSync-a-2.js', output: './test-output-' + rnd() + '.exe' }
];

function stripTraceOpt (lines) {
  return lines.split('\n').filter(function (line) {
    return (line.indexOf('[disabled optimization') < 0) &&
           (line.indexOf('[marking') < 0) &&
           (line.indexOf('[compiling method') < 0) &&
           (line.indexOf('[optimizing') < 0) &&
           (line.indexOf('[completed optimizing') < 0) &&
           (line.indexOf('einfo:') < 0);
  }).join('\n');
}

pairs.some(function (pair) {
  const input = pair.input;
  const output = pair.output;

  let left, right;
  utils.mkdirp.sync(path.dirname(output));

  left = utils.spawn.sync(
    'node', [ path.basename(input) ],
    { cwd: path.dirname(input) }
  );

  utils.pkg.sync([
    '--target', target,
    '--output', output, input
  ]);

  right = utils.spawn.sync(
    './' + path.basename(output), [],
    { cwd: path.dirname(output) }
  );

  right = stripTraceOpt(right);
  left = stripTraceOpt(left);
  if (left !== right) {
    console.log(JSON.stringify(pair));
    console.log('<<left<<', left);
    console.log('>>right>>', right);
    throw new Error('Assertion');
  }

  utils.vacuum.sync(output);
});
