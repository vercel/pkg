#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const configs = Object.keys(require('../../lib-es5/dictionary').default);

const directory = '../test-79-npm';
function onlyDirectories(name) {
  if (name === '_isolator') return false;
  const full = path.join(directory, name);
  return fs.statSync(full).isDirectory();
}
const folders = fs.readdirSync(directory).filter(onlyDirectories);

folders.push('etc'); // TODO who creates it?
folders.push('steam-resources'); // absent in npm. installed via github

configs.push('etc'); // TODO who creates it?
configs.push('express-with-jade');
configs.push('redis-with-hiredis');

let absent = false;

configs.some(function (config) {
  if (folders.indexOf(config) < 0) {
    console.log(config + ' is absent in tests');
    absent = true;
  }
});

folders.some(function (test) {
  if (configs.indexOf(test) < 0) {
    console.log(test + ' is absent in dictionary');
    absent = true;
  }
});

assert(!absent);
