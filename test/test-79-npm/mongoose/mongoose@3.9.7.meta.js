'use strict';

let home = require('../home.js');

module.exports = function (stamp) {
  return {
    allow: home(stamp) && (stamp.p !== 'win32') && (stamp.m <= 46) // requires MongoDB installed, 'mongodb/node_modules/bson' does not work in npm 3
  };
};
