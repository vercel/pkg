#!/usr/bin/env node

let fs = require('fs');
let path = require('path');
let assert = require('assert');
let utils = require('../../utils.js');
let enclose = require('../../').exec;

assert(!module.parent);
assert(__dirname === process.cwd());

let flags = process.argv.slice(2);
let input = './test-x-index.js';
let output = './run-time/test-output.exe';
let output3 = './run-time-3/dummy';

let left, right, right3;
utils.mkdirp.sync(path.dirname(output));
utils.mkdirp.sync(path.dirname(output3));

left = utils.spawn.sync(
  'node', [ path.basename(input) ],
  { cwd: path.dirname(input) }
);

fs.readdirSync('./').some(function (file) {
  if (/^test-/.test(file)) {
    let nf = path.join(
      path.dirname(file),
      path.basename(path.dirname(output)),
      path.basename(file)
    );
    fs.writeFileSync(
      nf,
      fs.readFileSync(file, 'utf8').replace(
        'compile-time', 'run-time'
      )
    );
    let nf3 = path.join(
      path.dirname(file),
      path.basename(path.dirname(output3)),
      path.basename(file)
    );
    fs.writeFileSync(
      nf3,
      fs.readFileSync(file, 'utf8').replace(
        'compile-time', 'run-time-3'
      )
    );
  }
});

enclose.sync(flags.concat([
  '--config', './test-config.js',
  '--output', output, input
]));

right = utils.spawn.sync(
  './' + path.basename(output), [],
  { cwd: path.dirname(output) }
);

right3 = utils.spawn.sync(
  './' + path.join('..', path.dirname(output), path.basename(output)), [],
  { cwd: path.dirname(output3) }
);

right = right.replace(
  /-J-run-time/g,
  '-J-compile-time'
).replace(
  /-K-run-time/g,
  '-K-compile-time'
).replace(
  /-L-run-time/g,
  '-L-compile-time'
);

right3 = right3.replace(
  /-J-run-time-3/g,
  '-J-compile-time'
).replace(
  /-K-run-time-3/g,
  '-K-compile-time'
).replace(
  /-L-run-time-3/g,
  '-L-compile-time'
);

if (left.length === 0) {
  left = 'left is empty';
}

if (right.length === 0) {
  right = 'right is empty';
}

if (right3.length === 0) {
  right3 = 'right3 is empty';
}

assert.equal(left, right);
assert.equal(left, right3);
utils.vacuum.sync(path.dirname(output));
utils.vacuum.sync(path.dirname(output3));
