#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const utils = require('../utils.js');

assert(!module.parent);
assert(__dirname === process.cwd());

const host = 'node' + process.version[1];
const target = process.argv[2] || host;

function rnd () {
  return Math.random().toString().slice(-6);
}

const pairs = fs.readdirSync('.').filter(function (f) {
  return (/\.js$/.test(f)) &&
         (f !== 'main.js') &&
         (!(/-child\.js$/.test(f)));
}).map(function (f) {
  return ({
    input: f, output: './test-output-' + rnd() + '.exe'
  });
});

assert(pairs.length > 6);

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
    console.log('<<left<<\n' + left);
    console.log('>>right>>\n' + right);
    throw new Error('Assertion');
  }

  utils.vacuum.sync(output);
  console.log(__dirname, input, 'ok');
});
