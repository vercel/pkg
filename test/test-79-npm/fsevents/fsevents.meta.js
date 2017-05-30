'use strict';

module.exports = function (stamp) {
  return {
    allow: stamp.p === 'darwin',
    note: 'requires macOS'
  };
};
