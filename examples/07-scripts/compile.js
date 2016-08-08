#!/usr/bin/env node

"use strict";

var flags = [];
var enclose = require("../../").exec;
flags.push("--config", "./config.js");
flags.push("./index.js");
enclose(flags);
