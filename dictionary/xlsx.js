"use strict";

module.exports = {

  patches: {

    "xlsx.js": [
      "require('js'+'zip')",
      "require('jszip')",
      "require('./od' + 's')",
      "require('./ods')"
    ]

  }

};
