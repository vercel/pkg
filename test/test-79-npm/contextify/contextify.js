'use strict';

let contextify = require('contextify');
let sandbox = { console: console, message: 'ok' };
contextify(sandbox);
sandbox.run('console.log(message);');
sandbox.dispose();
