#!/usr/bin/env node

let path = require('path');
let windows = process.platform === 'win32';
let reporter = require('../lib/reporter.js');

function defined (v) {
  if (v === null) return false;
  if (typeof v === 'undefined') return false;
  return true;
}

let optionator = require('optionator')({
  prepend:
    'enclose@' + process.versions.enclose + '\n' +
    'Usage: ' +
    'enclose [options] input',
  options: [ {
    option: 'output',
    alias: 'o',
    type: 'String',
    description: 'name of output executable'
  }, {
    option: 'arch',
    alias: 'a',
    type: 'String',
    description: 'arch of executable: x86 or x64'
  }, {
    option: 'version',
    alias: 'v',
    type: 'String',
    description: 'node version to put into exe'
  }, {
    option: 'loglevel',
    alias: 'l',
    type: 'String',
    description: '\'error\', \'warning\' or \'info\''
  }, {
    option: 'config',
    alias: 'c',
    type: 'String',
    description: 'config file with includes'
  }, {
    option: 'color',
    type: 'Boolean',
    description: 'force using color in console'
  }, {
    option: 'no-color',
    type: 'Boolean',
    description: 'disable color in console'
  } ]
});

let opts = optionator.parse(
  process.argv
);

let cli = {};

if (opts._.length > 1) {
  throw new Error(
    'Only one input file is expected. ' +
    'But ' + JSON.stringify(opts._) + ' is passed'
  );
}

if (opts._.length > 0) {
  cli.input = opts._[0];
}

if (defined(opts.loglevel)) {
  cli.loglevel = opts.loglevel;
}

if (defined(opts.output)) {
  cli.output = opts.output;
}

if (defined(opts.config)) {
  cli.config = opts.config;
}

if (defined(opts.version)) {
  cli.version = opts.version;
}

// ///////////////////////////////////////////////////////////////////
// ///////////////////////////////////////////////////////////////////
// ///////////////////////////////////////////////////////////////////

if (defined(cli.input)) {
  cli.input = path.resolve(cli.input);
}

if (defined(cli.output)) {
  cli.output = path.resolve(cli.output);
}

if (defined(cli.config)) {
  cli.config = path.resolve(cli.config);
}

// ///////////////////////////////////////////////////////////////////
// ///////////////////////////////////////////////////////////////////
// ///////////////////////////////////////////////////////////////////

if (!defined(cli.input)) {
  reporter.output(optionator.generateHelp());
  process.exit();
}

function outputFromInput (input) {
  let ext;
  if (input.slice(-3) === '.js') {
    ext = windows ? '.exe' : '';
    return input.slice(0, -3) + ext;
  } else {
    ext = windows ? '.exe' : '.out';
    return input + ext;
  }
}

if (defined(cli.input) && !defined(cli.output)) {
  let dni = path.dirname(cli.input);
  let bni = path.basename(cli.input);
  cli.output = path.join(dni, outputFromInput(bni));
}

// ///////////////////////////////////////////////////////////////////
// ///////////////////////////////////////////////////////////////////
// ///////////////////////////////////////////////////////////////////

if (defined(cli.input)) {
  if (typeof cli.input !== 'string') {
    throw new Error(
      '\'input\' must be of type \'string\''
    );
  }
}

if (defined(cli.loglevel)) {
  if (typeof cli.loglevel !== 'string') {
    throw new Error(
      '\'loglevel\' must be of type \'string\''
    );
  }
}

if (defined(cli.output)) {
  if (typeof cli.output !== 'string') {
    throw new Error(
      '\'output\' must be of type \'string\''
    );
  }
}

if (defined(cli.config)) {
  if (typeof cli.config !== 'string') {
    throw new Error(
      '\'config\' must be of type \'string\''
    );
  }
}

module.exports = cli;

if (!module.parent) {
  reporter.output(cli);
}
