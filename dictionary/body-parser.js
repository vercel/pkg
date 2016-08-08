"use strict";

module.exports = {

  scripts: [
    "lib/types/*.js" // for 1.4-1.13
  ],

  patches: {

    "lib/types/urlencoded.js": [
      "var parse = parser('qs')",
      "var parse = parser('qs'); require('qs')" // for 1.4-1.13
    ]

  }

};
