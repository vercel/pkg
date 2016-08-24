#!/usr/bin/env node

/* eslint-disable no-var */

'use strict';

var o = {
  p: process.platform,
  a: process.arch,
  m: parseInt(process.versions.modules, 10)
};

if (module.parent) {
  module.exports = o;
} else {
  process.stdout.write(JSON.stringify(o));
}
