'use strict';

const home = require('../home.js');

module.exports = function (stamp) {
  return {
    allow: home(stamp) && stamp.p !== 'win32',
    note: 'windows is not supported',
  };
};
