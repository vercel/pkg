/* eslint-disable operator-linebreak */

'use strict'; // eslint-disable-line

const common = require('../prelude/common.js');
const generate = require('escodegen').generate;
const parse = require('acorn').parse;

const ALIAS_AS_RELATIVE = common.ALIAS_AS_RELATIVE;
const ALIAS_AS_RESOLVABLE = common.ALIAS_AS_RESOLVABLE;

function forge (pattern, was) {
  if (was.v2) {
    return pattern.replace('{c1}', ', ')
                  .replace('{v1}', '"' + was.v1 + '"')
                  .replace('{c2}', ', ')
                  .replace('{v2}', '"' + was.v2 + '"');
  } else {
    return pattern.replace('{c1}', ', ')
                  .replace('{v1}', '"' + was.v1 + '"')
                  .replace('{c2}', '')
                  .replace('{v2}', '');
  }
}

function valid2 (v2) {
  return (v2 === undefined) ||
         (v2 === null) ||
         (v2 === 'must-exclude') ||
         (v2 === 'may-exclude');
}

function visitor_REQUIRE_RESOLVE (n) { // eslint-disable-line camelcase
  const c = n.callee;
  if (!c) return null;
  const ci = (c.object
           && c.object.type === 'Identifier'
           && c.object.name === 'require'
           && c.property
           && c.property.type === 'Identifier'
           && c.property.name === 'resolve');
  if (!ci) return null;
  const f = (n.type === 'CallExpression'
          && n.arguments
          && n.arguments[0]
          && n.arguments[0].type === 'Literal');
  if (!f) return null;
  const m = (n.arguments[1]
          && n.arguments[1].type === 'Literal');
  return { v1: n.arguments[0].value,
           v2: m ? n.arguments[1].value : null };
}

function visitor_REQUIRE (n) { // eslint-disable-line camelcase
  const c = n.callee;
  if (!c) return null;
  const ci = (c.type === 'Identifier'
           && c.name === 'require');
  if (!ci) return null;
  const f = (n.type === 'CallExpression'
          && n.arguments
          && n.arguments[0]
          && n.arguments[0].type === 'Literal');
  if (!f) return null;
  const m = (n.arguments[1]
          && n.arguments[1].type === 'Literal');
  return { v1: n.arguments[0].value,
           v2: m ? n.arguments[1].value : null };
}

function visitor_PATH_JOIN (n) { // eslint-disable-line camelcase
  const c = n.callee;
  if (!c) return null;
  const ci = (c.object
           && c.object.type === 'Identifier'
           && c.object.name === 'path'
           && c.property
           && c.property.type === 'Identifier'
           && c.property.name === 'join');
  if (!ci) return null;
  const dn = (n.arguments[0]
           && n.arguments[0].type === 'Identifier'
           && n.arguments[0].name === '__dirname');
  if (!dn) return null;
  const f = (n.type === 'CallExpression'
          && n.arguments
          && n.arguments[1]
          && n.arguments[1].type === 'Literal'
          && n.arguments.length === 2); // TODO concate them
  if (!f) return null;
  return { v1: n.arguments[1].value };
}

module.exports.visitor_SUCCESSFUL = function (node, test) { // eslint-disable-line camelcase
  let mustExclude, mayExclude, was;

  was = visitor_REQUIRE_RESOLVE(node);
  if (was) {
    if (test) return forge('require.resolve({v1}{c2}{v2})', was);
    if (!valid2(was.v2)) return null;
    mustExclude = (was.v2 === 'must-exclude');
    mayExclude = (was.v2 === 'may-exclude');
    return { alias: was.v1,
             aliasType: ALIAS_AS_RESOLVABLE,
             mustExclude: mustExclude,
             mayExclude: mayExclude };
  }

  was = visitor_REQUIRE(node);
  if (was) {
    if (test) return forge('require({v1}{c2}{v2})', was);
    if (!valid2(was.v2)) return null;
    mustExclude = (was.v2 === 'must-exclude');
    mayExclude = (was.v2 === 'may-exclude');
    return { alias: was.v1,
             aliasType: ALIAS_AS_RESOLVABLE,
             mustExclude: mustExclude,
             mayExclude: mayExclude };
  }

  was = visitor_PATH_JOIN(node);
  if (was) {
    if (test) return forge('path.join(__dirname{c1}{v1})', was);
    return { alias: was.v1,
             aliasType: ALIAS_AS_RELATIVE,
             mayExclude: false };
  }

  return null;
};

function visitor_NONLITERAL (n) { // eslint-disable-line camelcase
  return (function () {
    const c = n.callee;
    if (!c) return null;
    const ci = (c.object
             && c.object.type === 'Identifier'
             && c.object.name === 'require'
             && c.property
             && c.property.type === 'Identifier'
             && c.property.name === 'resolve');
    if (!ci) return null;
    const f = (n.type === 'CallExpression'
            && n.arguments
            && n.arguments[0]
            && n.arguments[0].type !== 'Literal');
    if (!f) return null;
    const m = n.arguments[1];
    if (!m) return { v1: reconstruct(n.arguments[0]) };
    const q = (n.arguments[1]
            && n.arguments[1].type === 'Literal');
    if (!q) return null;
    return { v1: reconstruct(n.arguments[0]),
             v2: n.arguments[1].value };
  }()) || (function () {
    const c = n.callee;
    if (!c) return null;
    const ci = (c.type === 'Identifier'
             && c.name === 'require');
    if (!ci) return null;
    const f = (n.type === 'CallExpression'
            && n.arguments
            && n.arguments[0]
            && n.arguments[0].type !== 'Literal');
    if (!f) return null;
    const m = n.arguments[1];
    if (!m) return { v1: reconstruct(n.arguments[0]) };
    const q = (n.arguments[1]
            && n.arguments[1].type === 'Literal');
    if (!q) return null;
    return { v1: reconstruct(n.arguments[0]),
             v2: n.arguments[1].value };
  }());
}

module.exports.visitor_NONLITERAL = function (node) { // eslint-disable-line camelcase
  let mustExclude, mayExclude, was;

  was = visitor_NONLITERAL(node);
  if (was) {
    if (!valid2(was.v2)) return null;
    mustExclude = (was.v2 === 'must-exclude');
    mayExclude = (was.v2 === 'may-exclude');
    return { alias: was.v1,
             mustExclude: mustExclude,
             mayExclude: mayExclude };
  }

  return null;
};

function visitor_MALFORMED (n) { // eslint-disable-line camelcase
  return (function () {
    const c = n.callee;
    if (!c) return null;
    const ci = (c.object
             && c.object.type === 'Identifier'
             && c.object.name === 'require'
             && c.property
             && c.property.type === 'Identifier'
             && c.property.name === 'resolve');
    if (!ci) return null;
    const f = (n.type === 'CallExpression'
            && n.arguments
            && n.arguments[0]);
    if (!f) return null;
    return { v1: reconstruct(n.arguments[0]) };
  }()) || (function () {
    const c = n.callee;
    if (!c) return null;
    const ci = (c.type === 'Identifier'
             && c.name === 'require');
    if (!ci) return null;
    const f = (n.type === 'CallExpression'
            && n.arguments
            && n.arguments[0]);
    if (!f) return null;
    return { v1: reconstruct(n.arguments[0]) };
  }());
}

module.exports.visitor_MALFORMED = function (node) { // eslint-disable-line camelcase
  let was;

  was = visitor_MALFORMED(node);
  if (was) return { alias: was.v1 };

  return null;
};

function visitor_USESCWD (n) { // eslint-disable-line camelcase
  const c = n.callee;
  if (!c) return null;
  const ci = (c.object
           && c.object.type === 'Identifier'
           && c.object.name === 'path'
           && c.property
           && c.property.type === 'Identifier'
           && c.property.name === 'resolve');
  if (!ci) return null;
  return { v1: n.arguments.map(reconstruct).join(', ') };
}

module.exports.visitor_USESCWD = function (node) { // eslint-disable-line camelcase
  let was;

  was = visitor_USESCWD(node);
  if (was) return { alias: was.v1 };

  return null;
};

function reconstruct (node) {
  let v = generate(node).replace(/\n/g, '');
  let v2;
  while (true) {
    v2 = v.replace(/\[ /g, '[')
      .replace(/ \]/g, ']')
      .replace(/ {2}/g, ' ');
    if (v2 === v) break;
    v = v2;
  }
  return v2;
}

function traverse (ast, visitor) {
  // modified esprima-walk to support
  // visitor return value and "trying" flag
  let stack = [ [ ast, false ] ];
  let i, j, key;
  let len, item, node, trying, child;
  for (i = 0; i < stack.length; i += 1) {
    item = stack[i];
    node = item[0];
    if (node) {
      trying = item[1] || (node.type === 'TryStatement');
      if (visitor(node, trying)) {
        for (key in node) {
          child = node[key];
          if (child instanceof Array) {
            len = child.length;
            for (j = 0; j < len; j += 1) {
              stack.push([ child[j], trying ]);
            }
          } else
          if (child && typeof child.type === 'string') {
            stack.push([ child, trying ]);
          }
        }
      }
    }
  }
}

module.exports.parse = function (body) {
  return parse(body, {
    ecmaVersion: 8,
    allowReturnOutsideFunction: true
  });
};

module.exports.detect = function (body, visitor) {
  const json = module.exports.parse(body);
  if (!json) return;
  traverse(json, visitor);
};
