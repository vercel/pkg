/* eslint-disable dot-location */

"use strict";

var assert = require("assert");
var common = require("./common.js");

var ALIAS_AS_RELATIVE = common.ALIAS_AS_RELATIVE;
var ALIAS_AS_RESOLVABLE = common.ALIAS_AS_RESOLVABLE;

function forge() {
}

function valid2(v2) {
  return (typeof v2 === "undefined") ||
         (v2 === "dont-enclose") ||
         (v2 === "can-ignore");
}

function visitor_REQUIRE_RESOLVE(name, value) { // eslint-disable-line camelcase
}

function visitor_REQUIRE(name, value) { // eslint-disable-line camelcase
}

function visitor_PATH_JOIN(name, value) { // eslint-disable-line camelcase
}

module.exports.visitor_SUCCESSFUL = function(name, value, test) { // eslint-disable-line camelcase

  var dontEnclose, canIgnore, was;

  was = visitor_REQUIRE_RESOLVE(name, value);
  if (was) {
    if (test) return forge("require.resolve({v1}{c2}{v2})", was);
    if (!valid2(was.v2)) return null;
    dontEnclose = (was.v2 === "dont-enclose");
    canIgnore = (was.v2 === "can-ignore");
    return { alias: was.v1,
             aliasType: ALIAS_AS_RESOLVABLE,
             dontEnclose: dontEnclose,
             canIgnore: canIgnore };
  }

  was = visitor_REQUIRE(name, value);
  if (was) {
    if (test) return forge("require({v1}{c2}{v2})", was);
    if (!valid2(was.v2)) return null;
    dontEnclose = (was.v2 === "dont-enclose");
    canIgnore = (was.v2 === "can-ignore");
    return { alias: was.v1,
             aliasType: ALIAS_AS_RESOLVABLE,
             dontEnclose: dontEnclose,
             canIgnore: canIgnore };
  }

  was = visitor_PATH_JOIN(name, value);
  if (was) {
    if (test) return forge("path.join(__dirname{c1}{v1})", was);
    return { alias: was.v1,
             aliasType: ALIAS_AS_RELATIVE,
             canIgnore: false };
  }

  return null;

};

function visitor_NONLITERAL(name, value) { // eslint-disable-line camelcase
}

module.exports.visitor_NONLITERAL = function(name, value) { // eslint-disable-line camelcase

  var dontEnclose, canIgnore, was;

  was = visitor_NONLITERAL(name, value);
  if (was) {
    if (!valid2(was.v2)) return null;
    dontEnclose = (was.v2 === "dont-enclose");
    canIgnore = (was.v2 === "can-ignore");
    return { alias: was.v1,
             dontEnclose: dontEnclose,
             canIgnore: canIgnore };
  }

  return null;

};

function visitor_MALFORMED(name, value) { // eslint-disable-line camelcase
}

module.exports.visitor_MALFORMED = function(name, value) { // eslint-disable-line camelcase

  var was;

  was = visitor_MALFORMED(name, value);
  if (was) return { alias: was.v1 };

  return null;

};

function visitor_USESCWD(name, value) { // eslint-disable-line camelcase
}

module.exports.visitor_USESCWD = function(name, value) { // eslint-disable-line camelcase

  var was;

  was = visitor_USESCWD(name, value);
  if (was) return { alias: was.v1 };

  return null;

};

function reconstruct() {
  // TODO escodegen?
}

function isTry(node) {
}

function traverse(node, visitor, trying) {
  assert(Array.isArray(node));
  assert(node.length % 2 === 0);
  for (var i = 0; i < node.length; i += 2) {
    if (isTry(node[i])) {
      trying = true;
    }
    if (visitor(node[i], node[i + 1], trying)) {
      if (Array.isArray(node[i + 1])) {
        traverse(node[i + 1], visitor, trying);
      }
    }
  }
}

module.exports.parse = function(body) {
};

module.exports.detect = function(body, visitor) {

  var json = module.exports.parse(body);
  if (!json) return;
  traverse(json, visitor, false);

};
