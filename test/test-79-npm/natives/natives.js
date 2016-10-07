'use strict';

var natives = require('natives');
var fsCopy = natives.require('fs');
if (fsCopy !== require('fs')) {
  console.log('ok');
}
