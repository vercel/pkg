'use strict';

var contextify = require('contextify');
var sandbox = { console: console, message: 'ok' };
contextify(sandbox);
sandbox.run('console.log(message);');
sandbox.dispose();
