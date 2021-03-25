'use strict';

module.exports = function (stamp, flags) {
  if (flags.ci) {
    return {
      allow: false,
    };
  }
};
