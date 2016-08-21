let home = require('../home.js');

module.exports = function (stamp) {
  return {
    allow: home(stamp) && (stamp.p !== 'win32') // where is dns_sd.h?
  };
};
