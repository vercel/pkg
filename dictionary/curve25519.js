"use strict";

module.exports = {

  patches: {

    "index.js": [
      "require(\"bindings\")(\"curve\")",
      "require(\"bindings\")({ bindings: \"curve\", module_root: __dirname })"
    ]

  }

};
