'use strict';

module.exports = function (stamp) {
  return {
    allow: stamp.m >= 46,
  };
};
