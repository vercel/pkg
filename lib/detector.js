/* eslint-disable operator-linebreak */
/* eslint-disable prefer-const */

import { generate } from 'escodegen';
import * as babel from '@babel/parser';
import { ALIAS_AS_RELATIVE, ALIAS_AS_RESOLVABLE } from './common';

function reconstructSpecifiers(specs) {
  if (!specs || !specs.length) return '';
  const defaults = [];

  for (const spec of specs) {
    if (spec.type === 'ImportDefaultSpecifier') {
      defaults.push(spec.local.name);
    }
  }

  const nonDefaults = [];

  for (const spec of specs) {
    if (spec.type === 'ImportSpecifier') {
      if (spec.local.name === spec.imported.name) {
        nonDefaults.push(spec.local.name);
      } else {
        nonDefaults.push(`${spec.imported.name} as ${spec.local.name}`);
      }
    }
  }

  if (nonDefaults.length) {
    defaults.push(`{ ${nonDefaults.join(', ')} }`);
  }

  return defaults.join(', ');
}

function reconstruct(node) {
  let v = generate(node).replace(/\n/g, '');
  let v2;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    v2 = v.replace(/\[ /g, '[').replace(/ \]/g, ']').replace(/ {2}/g, ' ');
    if (v2 === v) break;
    v = v2;
  }

  return v2;
}

function forge(pattern, was) {
  return pattern
    .replace('{c1}', ', ')
    .replace('{v1}', `"${was.v1}"`)
    .replace('{c2}', was.v2 ? ', ' : '')
    .replace('{v2}', was.v2 ? `"${was.v2}"` : '')
    .replace('{c3}', was.v3 ? ' from ' : '')
    .replace('{v3}', was.v3 ? was.v3 : '');
}

function valid2(v2) {
  return (
    v2 === undefined ||
    v2 === null ||
    v2 === 'must-exclude' ||
    v2 === 'may-exclude'
  );
}

function isLiteral(argument) {
  return (
    argument &&
    (argument.type === 'Literal' ||
      (argument.type === 'TemplateLiteral' &&
        argument.expressions.length === 0))
  );
}

function getLiteralValue(node) {
  if (!node) {
    return;
  }

  if (node.type === 'Literal') {
    return node.value;
  }

  if (node.type === 'TemplateLiteral') {
    return node.quasis[0].value.raw;
  }
}

function visitor_REQUIRE_RESOLVE(n) {
  // eslint-disable-line camelcase
  const c = n.callee;
  if (!c) return null;
  const ci =
    c.object &&
    c.object.type === 'Identifier' &&
    c.object.name === 'require' &&
    c.property &&
    c.property.type === 'Identifier' &&
    c.property.name === 'resolve';
  if (!ci) return null;
  const f =
    n.type === 'CallExpression' && n.arguments && isLiteral(n.arguments[0]);
  if (!f) return null;
  const m = isLiteral(n.arguments[1]);
  return {
    v1: getLiteralValue(n.arguments[0]),
    v2: m ? getLiteralValue(n.arguments[1]) : null,
  };
}

function visitor_REQUIRE(n) {
  // eslint-disable-line camelcase
  const c = n.callee;
  if (!c) return null;
  const ci = c.type === 'Identifier' && c.name === 'require';
  if (!ci) return null;
  const f =
    n.type === 'CallExpression' && n.arguments && isLiteral(n.arguments[0]);
  if (!f) return null;
  const m = isLiteral(n.arguments[1]);
  return {
    v1: getLiteralValue(n.arguments[0]),
    v2: m ? getLiteralValue(n.arguments[1]) : null,
  };
}

function visitor_IMPORT(n) {
  // eslint-disable-line camelcase
  const ni = n.type === 'ImportDeclaration';
  if (!ni) return null;
  const s = n.specifiers;
  return { v1: n.source.value, v3: reconstructSpecifiers(s) };
}

function visitor_PATH_JOIN(n) {
  // eslint-disable-line camelcase
  const c = n.callee;
  if (!c) return null;
  const ci =
    c.object &&
    c.object.type === 'Identifier' &&
    c.object.name === 'path' &&
    c.property &&
    c.property.type === 'Identifier' &&
    c.property.name === 'join';
  if (!ci) return null;
  const dn =
    n.arguments[0] &&
    n.arguments[0].type === 'Identifier' &&
    n.arguments[0].name === '__dirname';
  if (!dn) return null;
  const f =
    n.type === 'CallExpression' &&
    n.arguments &&
    isLiteral(n.arguments[1]) &&
    n.arguments.length === 2; // TODO concate them
  if (!f) return null;
  return { v1: getLiteralValue(n.arguments[1]) };
}

export function visitor_SUCCESSFUL(node, test) {
  let mustExclude;
  let mayExclude;
  let was;

  was = visitor_REQUIRE_RESOLVE(node);
  if (was) {
    if (test) return forge('require.resolve({v1}{c2}{v2})', was);
    if (!valid2(was.v2)) return null;

    mustExclude = was.v2 === 'must-exclude';
    mayExclude = was.v2 === 'may-exclude';

    return {
      alias: was.v1,
      aliasType: ALIAS_AS_RESOLVABLE,
      mustExclude,
      mayExclude,
    };
  }

  was = visitor_REQUIRE(node);
  if (was) {
    if (test) return forge('require({v1}{c2}{v2})', was);
    if (!valid2(was.v2)) return null;
    mustExclude = was.v2 === 'must-exclude';
    mayExclude = was.v2 === 'may-exclude';
    return {
      alias: was.v1,
      aliasType: ALIAS_AS_RESOLVABLE,
      mustExclude,
      mayExclude,
    };
  }

  was = visitor_IMPORT(node);
  if (was) {
    if (test) return forge('import {v3}{c3}{v1}', was);
    return { alias: was.v1, aliasType: ALIAS_AS_RESOLVABLE };
  }

  was = visitor_PATH_JOIN(node);
  if (was) {
    if (test) return forge('path.join(__dirname{c1}{v1})', was);
    return { alias: was.v1, aliasType: ALIAS_AS_RELATIVE, mayExclude: false };
  }

  return null;
}

function visitorNonLiteral(n) {
  // eslint-disable-line camelcase
  return (
    (() => {
      const c = n.callee;
      if (!c) return null;
      const ci =
        c.object &&
        c.object.type === 'Identifier' &&
        c.object.name === 'require' &&
        c.property &&
        c.property.type === 'Identifier' &&
        c.property.name === 'resolve';
      if (!ci) return null;
      const f =
        n.type === 'CallExpression' &&
        n.arguments &&
        !isLiteral(n.arguments[0]);
      if (!f) return null;
      const m = n.arguments[1];
      if (!m) return { v1: reconstruct(n.arguments[0]) };
      const q = isLiteral(n.arguments[1]);
      if (!q) return null;
      return {
        v1: reconstruct(n.arguments[0]),
        v2: getLiteralValue(n.arguments[1]),
      };
    })() ||
    (() => {
      const c = n.callee;
      if (!c) return null;
      const ci = c.type === 'Identifier' && c.name === 'require';
      if (!ci) return null;
      const f =
        n.type === 'CallExpression' &&
        n.arguments &&
        !isLiteral(n.arguments[0]);
      if (!f) return null;
      const m = n.arguments[1];
      if (!m) return { v1: reconstruct(n.arguments[0]) };
      const q = isLiteral(n.arguments[1]);
      if (!q) return null;
      return {
        v1: reconstruct(n.arguments[0]),
        v2: getLiteralValue(n.arguments[1]),
      };
    })()
  );
}

export function visitor_NONLITERAL(node) {
  // eslint-disable-line camelcase
  let mustExclude;
  let mayExclude;
  let was;

  was = visitorNonLiteral(node);
  if (was) {
    if (!valid2(was.v2)) return null;
    mustExclude = was.v2 === 'must-exclude';
    mayExclude = was.v2 === 'may-exclude';
    return { alias: was.v1, mustExclude, mayExclude };
  }

  return null;
}

function visitorMalformed(n) {
  // eslint-disable-line camelcase
  return (
    (() => {
      const c = n.callee;
      if (!c) return null;
      const ci =
        c.object &&
        c.object.type === 'Identifier' &&
        c.object.name === 'require' &&
        c.property &&
        c.property.type === 'Identifier' &&
        c.property.name === 'resolve';
      if (!ci) return null;
      const f = n.type === 'CallExpression' && n.arguments && n.arguments[0];
      if (!f) return null;
      return { v1: reconstruct(n.arguments[0]) };
    })() ||
    (() => {
      const c = n.callee;
      if (!c) return null;
      const ci = c.type === 'Identifier' && c.name === 'require';
      if (!ci) return null;
      const f = n.type === 'CallExpression' && n.arguments && n.arguments[0];
      if (!f) return null;
      return { v1: reconstruct(n.arguments[0]) };
    })()
  );
}

export function visitor_MALFORMED(node) {
  // eslint-disable-line camelcase
  let was;

  was = visitorMalformed(node);
  if (was) return { alias: was.v1 };

  return null;
}

function visitorUseCwd(n) {
  // eslint-disable-line camelcase
  const c = n.callee;
  if (!c) return null;
  const ci =
    c.object &&
    c.object.type === 'Identifier' &&
    c.object.name === 'path' &&
    c.property &&
    c.property.type === 'Identifier' &&
    c.property.name === 'resolve';
  if (!ci) return null;
  return { v1: n.arguments.map(reconstruct).join(', ') };
}

export function visitor_USESCWD(node) {
  // eslint-disable-line camelcase
  let was;

  was = visitorUseCwd(node);
  if (was) return { alias: was.v1 };

  return null;
}

function traverse(ast, visitor) {
  // modified esprima-walk to support
  // visitor return value and "trying" flag
  let stack = [[ast, false]];
  let i;
  let j;
  let key;
  let len;
  let item;
  let node;
  let trying;
  let child;

  for (i = 0; i < stack.length; i += 1) {
    item = stack[i];
    [node] = item;

    if (node) {
      trying = item[1] || node.type === 'TryStatement';

      if (visitor(node, trying)) {
        for (key in node) {
          if (node[key]) {
            child = node[key];

            if (child instanceof Array) {
              len = child.length;
              for (j = 0; j < len; j += 1) {
                stack.push([child[j], trying]);
              }
            } else if (child && typeof child.type === 'string') {
              stack.push([child, trying]);
            }
          }
        }
      }
    }
  }
}

export function parse(body) {
  return babel.parse(body, {
    allowImportExportEverywhere: true,
    allowReturnOutsideFunction: true,
    ecmaVersion: 8,
    plugins: ['estree', 'bigInt', 'classPrivateProperties', 'classProperties'],
  });
}

export function detect(body, visitor) {
  const json = parse(body);
  if (!json) return;
  traverse(json, visitor);
}
