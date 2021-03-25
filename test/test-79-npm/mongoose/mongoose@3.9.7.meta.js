'use strict';

const home = require('../home.js');

module.exports = function (stamp) {
  return {
    allow: home(stamp) && stamp.p !== 'win32' && stamp.m <= 46,
    note:
      'requires MongoDB installed\n' +
      ' ...also require("mongodb/node_modules/bson") does not work in flat npm',
  };
};
