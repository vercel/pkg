#!/usr/bin/env node

"use strict";

// the generated executable does
// not need submodule.js on disk.
// submodule.js is bundled inside
// the executable

console.log("before");
require("./submodule.js");
console.log("after");
