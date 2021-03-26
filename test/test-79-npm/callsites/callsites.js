'use strict';

var path = require('path');
var callsites = require('callsites');
var fns = callsites().map(function (c) {
  return c.getFileName();
});
if (
  fns[1] === 'pkg/prelude/bootstrap.js' ||
  path.basename(fns[0]) === 'callsites.js'
) {
  console.log('ok');
}
