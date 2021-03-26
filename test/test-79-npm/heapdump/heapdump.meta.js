'use strict';

const home = require('../home.js');

module.exports = function (stamp) {
  return {
    allow: home(stamp),
  };
};

// TODO windows has an error
// 'Invalid access to memory location'
