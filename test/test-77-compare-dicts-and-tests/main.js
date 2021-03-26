#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');

let configs = fs.readdirSync('../../dictionary');
configs = configs
  .filter(function (config) {
    return config !== '.eslintrc.json';
  })
  .map(function (config) {
    assert.strictEqual(config.slice(-3), '.js');
    return config.slice(0, -3);
  });

let tests = fs.readdirSync('../test-79-npm');
tests = tests.filter(function (test) {
  if (test === '_isolator') return false;
  const full = path.join('../test-79-npm', test);
  return fs.statSync(full).isDirectory();
});

tests.push('etc'); // TODO who creates it?
tests.push('steam-resources'); // absent in npm. installed via github

configs.push('etc'); // TODO who creates it?
configs.push('express-with-jade');
configs.push('redis-with-hiredis');

let absent = false;

configs.some(function (config) {
  if (tests.indexOf(config) < 0) {
    console.log(config + ' is absent in tests');
    absent = true;
  }
});

tests.some(function (test) {
  if (configs.indexOf(test) < 0) {
    console.log(test + ' is absent in dictionary');
    absent = true;
  }
});

assert(!absent);
