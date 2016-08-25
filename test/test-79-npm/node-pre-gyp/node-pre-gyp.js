'use strict';

var Run = require('node-pre-gyp').Run;
var r = new Run();

try {
  r.commands.clean();
} catch (e) {
  if (e.message.indexOf('undefined package.json is not node-pre-gyp ready') >= 0) {
    console.log('ok');
  }
}
