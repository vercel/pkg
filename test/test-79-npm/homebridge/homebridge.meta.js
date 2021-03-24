'use strict';

const home = require('../home.js');

module.exports = function (stamp, flags) {
  if (flags.ci) {
    return {
      allow: false,
      note: 'headless CI seems to fail',
    };
  }

  return {
    allow: home(stamp),
    note: 'requires OpenSSL-dev and mdns installed',
  };
};
