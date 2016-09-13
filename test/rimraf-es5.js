'use strict';

const path = require('path');
const rimraf = require('rimraf');
rimraf.sync(path.join(__dirname, '../lib-es5/*'));
