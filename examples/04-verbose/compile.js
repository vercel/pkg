#!/usr/bin/env node

"use strict";

var flags = [];
var enclose = require("../../").exec;
flags.push("--loglevel", "info");
flags.push("./index.js");
enclose(flags);
