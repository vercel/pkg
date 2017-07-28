'use strict';

const home = require('../home.js');

module.exports = function (stamp, flags) {
  if (flags.ci) {
    return {
      allow: false,
      note: 'CI'
    };
  }

  return {
    allow: home(stamp),
    take: 'last-line'
  };
};
