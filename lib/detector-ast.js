/* eslint-disable dot-location */

let vm = require('vm');
let Script = vm.Script;
let assert = require('assert');
let common = require('./common.js');

let ALIAS_AS_RELATIVE = common.ALIAS_AS_RELATIVE;
let ALIAS_AS_RESOLVABLE = common.ALIAS_AS_RESOLVABLE;

let binding;

try {
  binding = process.binding('enclose');
} catch (_) {
  assert(_);
}

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
  return (typeof v2 === 'undefined') ||
         (v2 === 'dont-enclose') ||
         (v2 === 'can-ignore');
}

// require.resolve("module") ------------------------ работает
// require.resolve("module", "dont-enclose") -------- не работает
// require("module") -------------------------------- работает
// require("module", "dont-enclose") ---------------- не работает
// path.join(__dirname, "module") ------------------- работает

function visitor_REQUIRE_RESOLVE (name, value) { // eslint-disable-line camelcase
  if (name !== 'CALL') return null;
  if ((value.length === 6) &&
      (value[0] === 'PROPERTY') &&
      (value[1][0] === 'VAR_PROXY') &&
      (value[1][1] === 'require') &&
      (value[1][2] === 'NAME') &&
      (value[1][3] === 'resolve') &&
      (value[2] === 'LITERAL') &&
      (value[4] === 'LITERAL')) {
    return { v1: value[3], v2: value[5] };
  }
  if ((value.length === 4) &&
      (value[0] === 'PROPERTY') &&
      (value[1][0] === 'VAR_PROXY') &&
      (value[1][1] === 'require') &&
      (value[1][2] === 'NAME') &&
      (value[1][3] === 'resolve') &&
      (value[2] === 'LITERAL')) {
    return { v1: value[3] };
  }
  return null;
}

function visitor_REQUIRE (name, value) { // eslint-disable-line camelcase
  if (name !== 'CALL') return null;
  if ((value.length === 6) &&
      (value[0] === 'VAR_PROXY') &&
      (value[1] === 'require') &&
      (value[2] === 'LITERAL') &&
      (value[4] === 'LITERAL')) {
    return { v1: value[3], v2: value[5] };
  }
  if ((value.length === 4) &&
      (value[0] === 'VAR_PROXY') &&
      (value[1] === 'require') &&
      (value[2] === 'LITERAL')) {
    return { v1: value[3] };
  }
  return null;
}

function visitor_PATH_JOIN (name, value) { // eslint-disable-line camelcase
  if (name !== 'CALL') return null;
  if ((value.length === 6) &&
      (value[0] === 'PROPERTY') &&
      (value[1][0] === 'VAR_PROXY') &&
      (value[1][1] === 'path') &&
      (value[1][2] === 'NAME') &&
      (value[1][3] === 'join') &&
      (value[2] === 'VAR_PROXY') &&
      (value[3] === '__dirname') &&
      (value[4] === 'LITERAL')) {
    return { v1: value[5] };
  }
  return null;
}

module.exports.visitor_SUCCESSFUL = function (name, value, test) { // eslint-disable-line camelcase

  let dontEnclose, canIgnore, was;

  was = visitor_REQUIRE_RESOLVE(name, value);
  if (was) {
    if (test) return forge('require.resolve({v1}{c2}{v2})', was);
    if (!valid2(was.v2)) return null;
    dontEnclose = (was.v2 === 'dont-enclose');
    canIgnore = (was.v2 === 'can-ignore');
    return { alias: was.v1,
             aliasType: ALIAS_AS_RESOLVABLE,
             dontEnclose: dontEnclose,
             canIgnore: canIgnore };
  }

  was = visitor_REQUIRE(name, value);
  if (was) {
    if (test) return forge('require({v1}{c2}{v2})', was);
    if (!valid2(was.v2)) return null;
    dontEnclose = (was.v2 === 'dont-enclose');
    canIgnore = (was.v2 === 'can-ignore');
    return { alias: was.v1,
             aliasType: ALIAS_AS_RESOLVABLE,
             dontEnclose: dontEnclose,
             canIgnore: canIgnore };
  }

  was = visitor_PATH_JOIN(name, value);
  if (was) {
    if (test) return forge('path.join(__dirname{c1}{v1})', was);
    return { alias: was.v1,
             aliasType: ALIAS_AS_RELATIVE,
             canIgnore: false };
  }

  return null;

};

function visitor_NONLITERAL (name, value) { // eslint-disable-line camelcase
  if (name !== 'CALL') return null;
  if ((value.length === 6) &&
      (value[0] === 'PROPERTY') &&
      (value[1][0] === 'VAR_PROXY') &&
      (value[1][1] === 'require') &&
      (value[1][2] === 'NAME') &&
      (value[1][3] === 'resolve') &&
      (value[2] !== 'LITERAL') &&
      (typeof value[3] !== 'undefined') &&
      (value[4] === 'LITERAL')) {
    return { v1: reconstruct(value[2], value[3]), v2: value[5] };
  }
  if ((value.length === 4) &&
      (value[0] === 'PROPERTY') &&
      (value[1][0] === 'VAR_PROXY') &&
      (value[1][1] === 'require') &&
      (value[1][2] === 'NAME') &&
      (value[1][3] === 'resolve') &&
      (value[2] !== 'LITERAL') &&
      (typeof value[3] !== 'undefined')) {
    return { v1: reconstruct(value[2], value[3]) };
  }
  if ((value.length === 6) &&
      (value[0] === 'VAR_PROXY') &&
      (value[1] === 'require') &&
      (value[2] !== 'LITERAL') &&
      (typeof value[3] !== 'undefined') &&
      (value[4] === 'LITERAL')) {
    return { v1: reconstruct(value[2], value[3]), v2: value[5] };
  }
  if ((value.length === 4) &&
      (value[0] === 'VAR_PROXY') &&
      (value[1] === 'require') &&
      (value[2] !== 'LITERAL') &&
      (typeof value[3] !== 'undefined')) {
    return { v1: reconstruct(value[2], value[3]) };
  }
  return null;
}

module.exports.visitor_NONLITERAL = function (name, value) { // eslint-disable-line camelcase

  let dontEnclose, canIgnore, was;

  was = visitor_NONLITERAL(name, value);
  if (was) {
    if (!valid2(was.v2)) return null;
    dontEnclose = (was.v2 === 'dont-enclose');
    canIgnore = (was.v2 === 'can-ignore');
    return { alias: was.v1,
             dontEnclose: dontEnclose,
             canIgnore: canIgnore };
  }

  return null;

};

function visitor_MALFORMED (name, value) { // eslint-disable-line camelcase
  if (name !== 'CALL') return null;
  if ((value[0] === 'PROPERTY') && // any number of params
      (value[1][0] === 'VAR_PROXY') &&
      (value[1][1] === 'require') &&
      (value[1][2] === 'NAME') &&
      (value[1][3] === 'resolve') &&
      (typeof value[2] !== 'undefined') &&
      (typeof value[3] !== 'undefined')) {
    return { v1: reconstruct(name, value) };
  }
  if ((value[0] === 'VAR_PROXY') && // any number of params
      (value[1] === 'require') &&
      (typeof value[2] !== 'undefined') &&
      (typeof value[3] !== 'undefined')) {
    return { v1: reconstruct(name, value) };
  }
  return null;
}

module.exports.visitor_MALFORMED = function (name, value) { // eslint-disable-line camelcase

  let was;

  was = visitor_MALFORMED(name, value);
  if (was) return { alias: was.v1 };

  return null;

};

function visitor_USESCWD (name, value) { // eslint-disable-line camelcase
  if (name !== 'CALL') return null;
  if ((value[0] === 'PROPERTY') && // any number of params
      (value[1][0] === 'VAR_PROXY') &&
      (value[1][1] === 'path') &&
      (value[1][2] === 'NAME') &&
      (value[1][3] === 'resolve')) {
    let args = reconstructMany(value.slice(2));
    return { v1: args.join(', ') };
  }
  return null;
}

module.exports.visitor_USESCWD = function (name, value) { // eslint-disable-line camelcase

  let was;

  was = visitor_USESCWD(name, value);
  if (was) return { alias: was.v1 };

  return null;

};

function reconstructMany (node) {
  if (Array.isArray(node)) {
    let rs = [];
    for (let i = 0; i < node.length; i += 2) {
      rs.push(reconstruct(node[i], node[i + 1]));
    }
    return rs;
  } else {
    return [ node ];
  }
}

function reconstruct (name, value) {
  let r;
  if (name === 'ADD') {
    r = reconstructMany(value);
    return r.join(' + ');
  } else
  if (name === 'ARRAY_LITERAL') {
    r = reconstructMany(value);
    return '[' + r[0] + ']';
  } else
  if (name === 'CALL') {
    r = reconstructMany(value);
    let ps = r.slice(1).join(', ');
    return r[0] + '(' + ps + ')';
  } else
  if (name === 'CONDITION') {
    r = reconstructMany(value);
    return r[0];
  } else
  if (name === 'CONDITIONAL') {
    r = reconstructMany(value);
    return r[0] + ' ? ' + r[1] + ' : ' + r[2];
  } else
  if (name === 'ELSE') {
    r = reconstructMany(value);
    return r[0];
  } else
  if (name === 'KEY') {
    r = reconstructMany(value);
    return '[' + r[0] + ']';
  } else
  if (name === 'LITERAL') {
    if (typeof value === 'number') {
      return value.toString();
    } else
    if (typeof value === 'string') {
      return '"' + value + '"';
    } else {
      return '<unknown type ' + typeof value + '>';
    }
  } else
  if (name === 'NAME') {
    return '.' + value;
  } else
  if (name === 'PROPERTY') {
    r = reconstructMany(value);
    return r.join('');
  } else
  if (name === 'THEN') {
    r = reconstructMany(value);
    return r[0];
  } else
  if (name === 'VALUES') {
    r = reconstructMany(value);
    return r.join(', ');
  } else
  if (name === 'VAR_PROXY') {
    return value;
  } else {
    return '<unknown ' + name + '>';
  }
}

function traverse (node, visitor, trying) {
  assert(Array.isArray(node));
  assert(node.length % 2 === 0);
  for (let i = 0; i < node.length; i += 2) {
    if (node[i] === 'TRY') {
      trying = true;
    }
    if (visitor(node[i], node[i + 1], trying)) {
      if (Array.isArray(node[i + 1])) {
        traverse(node[i + 1], visitor, trying);
      }
    }
  }
}

module.exports.parse = function (body) {

  if (!binding) return null;

  let wrap = [
    '(function(require, module, exports, __filename, __dirname) {\n',
      body,
    '\n})' // dont remove \n, otherwise last comment will cover right brace
  ].join('');

  let plain = binding.parse(wrap);

  if (plain.length === 0) {

    try {             // там где-то копится ошибка.
      assert(false);  // здесь я её сбрасываю. если
    } catch (_) {     // не сбросить, она сыграет ниже
    }                 // TODO сделай что нужно в v8

    let script = new Script(wrap);
    assert(script);
    throw new Error('Cannot parse JS, but can make a script');

  }

  let json;

  try {
    json = JSON.parse(plain);
  } catch (__) {
    throw new Error('Cannot parse AST. ' + __.toString());
  }

  return json;

};

module.exports.detect = function (body, visitor) {

  let json = module.exports.parse(body);
  if (!json) return;
  traverse(json, visitor, false);

};
