"use strict";

module.exports = {

  scripts: [
    "lib/*.js"
  ],

  patches: {

    "lib/help.js": [
      "path.dirname(__dirname)",
      "path.dirname(process.argv[1])"
    ]

  }

};
