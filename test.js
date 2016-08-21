#!/usr/bin/env node

let path = require('path');
let globby = require('globby');
let utils = require('./utils.js');

function main (args) {
  let flags = args;
  let testDirectory = path.join(__dirname, 'test/*/main.js');
  globby.sync(testDirectory).sort().some(function (file) {
    file = path.resolve(file);
    try {
      utils.spawn.sync(
        'node', [ path.basename(file) ].concat(flags),
        { cwd: path.dirname(file), stdio: 'inherit' }
      );
    } catch (error) {
      console.log(file, 'FAILED');
      throw error;
    }
    console.log(file, 'ok');
  });
}

module.exports = function (args) {
  main(args);
  console.log(__filename, 'ok');
};

if (!module.parent) {
  module.exports(process.argv.slice(2));
}
