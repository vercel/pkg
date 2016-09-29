'use strict';

module.exports = {
  pkg: {
    patches: {
      // WARNING! THIS IS A FALLBACK!
      // CREATE A DICTIONARY LIKE LEVELDOWN AND CONTEXTIFY
      // USE 'module_root' OPTION TO BINDING
      // THIS IS BECAUSE NODE 5+ (NPM 3+) HAS FLAT NODE_MODULES
      // AND NATIVE ADDON IS NOT 2 LEVELS UP ANYMORE, BUT NEARBY
      'bindings.js': [
        'return fileName',
        'return dirname(__dirname)' // <- 2 levels up
      ]
    }
  }
};
