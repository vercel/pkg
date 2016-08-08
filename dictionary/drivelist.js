"use strict";

module.exports = {

  assets: [
    "scripts/*"
  ],

  patches: {

    "build/scripts.js": [
      "path.join(__dirname, '..', 'scripts')",
      "path.join(path.dirname(process.execPath), 'scripts')"
    ]

  }

};
