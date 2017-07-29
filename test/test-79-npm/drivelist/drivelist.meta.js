'use strict';

module.exports = function () {
  return {
    deployFiles: [
      [ 'node_modules/drivelist/scripts/darwin.sh', 'scripts/darwin.sh' ],
      [ 'node_modules/drivelist/scripts/linux.sh', 'scripts/linux.sh' ]
    ]
  };
};
