'use strict';

const home = require('../home.js');

module.exports = function (stamp) {
  return {
    allow: home(stamp) && (stamp.p !== 'win32') && (!(/^arm/).test(stamp.a)),
    note: 'requires OpenSSL-dev and mdns installed'
  };
};
