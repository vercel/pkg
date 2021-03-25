'use strict';

const home = require('../home.js');

module.exports = function (stamp) {
  return {
    allow: home(stamp),
    packages: ['leveldown@1'],
  };
};
