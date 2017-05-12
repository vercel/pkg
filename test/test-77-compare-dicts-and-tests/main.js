#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');

let dicts = fs.readdirSync('../../dictionary');
dicts = dicts.filter(function (dict) {
  return dict !== '.eslintrc.json';
}).map(function (dict) {
  assert.equal(dict.slice(-3), '.js');
  return dict.slice(0, -3);
});

let tests = fs.readdirSync('../test-79-npm');
tests = tests.filter(function (test) {
  if (test === '_isolator') return false;
  const full = path.join('../test-79-npm', test);
  return fs.statSync(full).isDirectory();
});

tests.push('etc'); // TODO who creates it?
tests.push('steam-resources'); // absent in npm. installed via github

dicts.push('etc'); // TODO who creates it?
dicts.push('express-with-jade');
dicts.push('redis-with-hiredis');

let absent = false;

dicts.some(function (dict) {
  if (tests.indexOf(dict) < 0) {
    console.log(dict + ' is absent in tests');
    absent = true;
  }
});

tests.some(function (test) {
  if (dicts.indexOf(test) < 0) {
    console.log(test + ' is absent in dicts');
    absent = true;
  }
});

assert(!absent);
