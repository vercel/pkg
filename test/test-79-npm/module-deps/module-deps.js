'use strict';

var Deps = require('module-deps');
var deps = new Deps();
if (deps.parseDeps) {
  console.log('ok');
}
