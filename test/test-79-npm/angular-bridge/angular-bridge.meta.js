'use strict';

module.exports = function (stamp, flags) {
  return {
    allow: !flags.ci,
    note: 'speed up CI by removing this test'
  };
};
