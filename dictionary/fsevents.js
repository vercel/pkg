"use strict";

module.exports = {

  patches: {

    "fsevents.js": [
      "require('./build/Release/fse')",
      "require('./build/Release/fse', 'can-ignore')"
    ]

  }

};
