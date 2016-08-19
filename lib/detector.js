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

function visitor_REQUIRE_RESOLVE(node) { // eslint-disable-line camelcase
}

function visitor_REQUIRE(node) { // eslint-disable-line camelcase
}

function visitor_PATH_JOIN(node) { // eslint-disable-line camelcase
}

module.exports.visitor_SUCCESSFUL = function(node, test) { // eslint-disable-line camelcase

  var dontEnclose, canIgnore, was;

  was = visitor_REQUIRE_RESOLVE(node);
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

  was = visitor_REQUIRE(node);
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

  was = visitor_PATH_JOIN(node);
  if (was) {
    if (test) return forge("path.join(__dirname{c1}{v1})", was);
    return { alias: was.v1,
             aliasType: ALIAS_AS_RELATIVE,
             canIgnore: false };
  }

  return null;

};

function visitor_NONLITERAL(node) { // eslint-disable-line camelcase
}

module.exports.visitor_NONLITERAL = function(node) { // eslint-disable-line camelcase

  var dontEnclose, canIgnore, was;

  was = visitor_NONLITERAL(node);
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

function visitor_MALFORMED(node) { // eslint-disable-line camelcase
}

module.exports.visitor_MALFORMED = function(node) { // eslint-disable-line camelcase

  var was;

  was = visitor_MALFORMED(node);
  if (was) return { alias: was.v1 };

  return null;

};

function visitor_USESCWD(node) { // eslint-disable-line camelcase
}

module.exports.visitor_USESCWD = function(node) { // eslint-disable-line camelcase

  var was;

  was = visitor_USESCWD(node);
  if (was) return { alias: was.v1 };

  return null;

};

function reconstruct() {
  // TODO escodegen?
}

function isTry(node) {
}

function traverse(ast, visitor, trying) {
}

module.exports.parse = function(body) {
};

module.exports.detect = function(body, visitor) {

  var json = module.exports.parse(body);
  if (!json) return;
  traverse(json, visitor, false);

};
