'use strict';

module.exports = function (stamp) {
  return {
    allow: (!(/^arm/).test(stamp.a)) // TODO memory consumption aim is to compile geoip-lite on arm
  };
};
