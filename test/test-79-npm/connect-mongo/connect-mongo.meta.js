'use strict';

module.exports = function (stamp, flags) {
  if (flags.ci) {
    return {
      allow: false,
      note: 'CI'
    };
  }

  return {
    allow: stamp.m >= 46
  };
};
