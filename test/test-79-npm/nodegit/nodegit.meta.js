'use strict';

const home = require('../home.js');

module.exports = function (stamp) {
  return {
    allow: home(stamp) && stamp.m === 51, // TODO check node8 some day
    note: 'precompiled binary is for node7 only',
  };
};
