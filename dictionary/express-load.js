"use strict";

module.exports = {

  patches: {

    "lib/express-load.js": [
      "entity = path.resolve(",
      "entity = process.enclose.path.resolve("
    ]

  }

};
