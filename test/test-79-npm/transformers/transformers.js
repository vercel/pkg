'use strict';

var transformers = require('transformers');

try {
  transformers.ejs.loadModule();
} catch (e) {
  if (e.code === 'MODULE_NOT_FOUND') {
    console.log('ok');
  }
}
