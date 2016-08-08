"use strict";

var home = require("../home.js");

module.exports = function(stamp) {
  return {
    allow: home(stamp) && (stamp.p !== "win32") // requires C:\OpenSSL-Win64\lib\libeay32.lib
  };
};
