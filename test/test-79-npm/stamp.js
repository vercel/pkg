#!/usr/bin/env node

let o = {
  p: process.platform,
  a: require('../../bin/enclose.js').arch(),
  m: parseInt(process.versions.modules, 10)
};

if (module.parent) {
  module.exports = o;
} else {
  process.stdout.write(JSON.stringify(o));
}
