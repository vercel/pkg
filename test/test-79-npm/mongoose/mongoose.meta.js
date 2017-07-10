'use strict';

module.exports = function (stamp) {
  return {
    allow: stamp.p !== 'win32',
    note: 'requires MongoDB installed'
  };
};
