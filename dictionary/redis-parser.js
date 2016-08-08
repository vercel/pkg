"use strict";

module.exports = {

  patches: {

    "lib/hiredis.js": [
      "require('hiredis')",
      "require('hiredis', 'can-ignore')"
    ]

  }

};
