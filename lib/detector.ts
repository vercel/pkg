/* eslint-disable operator-linebreak */
/* eslint-disable prefer-const */

import { generate } from 'escodegen';
// eslint-disable-next-line import/no-extraneous-dependencies
import * as babelTypes from '@babel/types';
import * as babel from '@babel/parser';

import { ALIAS_AS_RELATIVE, ALIAS_AS_RESOLVABLE } from './common';

function isLiteral(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  node: any
): node is babelTypes.StringLiteral | babelTypes.TemplateLiteral {
  // TODO: this function is a lie and can probably be better
  // I was using babelTypes.isStringLiteral but that broke a bunch of tests
  return (
    node &&
    (node.type === 'Literal' ||
      (node.type === 'TemplateLiteral' && node.expressions.length === 0))
  );
}

function getLiteralValue(
  node: babelTypes.StringLiteral | babelTypes.TemplateLiteral
) {
  if (node.type === 'TemplateLiteral') {
    return node.quasis[0].value.raw;
  }

  return node.value;
}

function reconstructSpecifiers(
  specs: (
    | babelTypes.ImportDefaultSpecifier
    | babelTypes.ImportNamespaceSpecifier
    | babelTypes.ImportSpecifier
  )[]
) {
  if (!specs || !specs.length) {
    return '';
  }

  const defaults = [];

  for (const spec of specs) {
    if (babelTypes.isImportDefaultSpecifier(spec)) {
      defaults.push(spec.local.name);
    }
  }

  const nonDefaults = [];

  for (const spec of specs) {
    if (babelTypes.isImportSpecifier(spec)) {
      const importedName = babelTypes.isIdentifier(spec.imported)
        ? spec.imported.name
        : spec.imported.value;

      if (spec.local.name === importedName) {
        nonDefaults.push(spec.local.name);
      } else {
        nonDefaults.push(`${importedName} as ${spec.local.name}`);
      }
    }
  }

  if (nonDefaults.length) {
    defaults.push(`{ ${nonDefaults.join(', ')} }`);
  }

  return defaults.join(', ');
}

function reconstruct(node: babelTypes.Node) {
  let v = generate(node).replace(/\n/g, '');
  let v2;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    v2 = v.replace(/\[ /g, '[').replace(/ \]/g, ']').replace(/ {2}/g, ' ');

    if (v2 === v) {
      break;
    }

    v = v2;
  }

  return v2;
}

interface Was {
  v1: string | number | boolean;
  v2?: string | number | boolean | null;
  v3?: string;
}

function forge(pattern: string, was: Was) {
  return pattern
    .replace('{c1}', ', ')
    .replace('{v1}', `"${was.v1}"`)
    .replace('{c2}', was.v2 ? ', ' : '')
    .replace('{v2}', was.v2 ? `"${was.v2}"` : '')
    .replace('{c3}', was.v3 ? ' from ' : '')
    .replace('{v3}', was.v3 ? was.v3 : '');
}

function valid2(v2?: Was['v2']) {
  return (
    v2 === undefined ||
    v2 === null ||
    v2 === 'must-exclude' ||
    v2 === 'may-exclude'
  );
}

function visitorRequireResolve(n: babelTypes.Node) {
  if (!babelTypes.isCallExpression(n)) {
    return null;
  }

  if (!babelTypes.isMemberExpression(n.callee)) {
    return null;
  }

  const ci =
    n.callee.object.type === 'Identifier' &&
    n.callee.object.name === 'require' &&
    n.callee.property.type === 'Identifier' &&
    n.callee.property.name === 'resolve';

  if (!ci) {
    return null;
  }

  if (!n.arguments || !isLiteral(n.arguments[0])) {
    return null;
  }

  return {
    v1: getLiteralValue(n.arguments[0]),
    v2: isLiteral(n.arguments[1]) ? getLiteralValue(n.arguments[1]) : null,
  };
}

function visitorRequire(n: babelTypes.Node) {
  if (!babelTypes.isCallExpression(n)) {
    return null;
  }

  if (!babelTypes.isIdentifier(n.callee)) {
    return null;
  }

  if (n.callee.name !== 'require') {
    return null;
  }

  if (!n.arguments || !isLiteral(n.arguments[0])) {
    return null;
  }

  return {
    v1: getLiteralValue(n.arguments[0]),
    v2: isLiteral(n.arguments[1]) ? getLiteralValue(n.arguments[1]) : null,
  };
}

function visitorImport(n: babelTypes.Node) {
  if (!babelTypes.isImportDeclaration(n)) {
    return null;
  }

  return { v1: n.source.value, v3: reconstructSpecifiers(n.specifiers) };
}

function visitorPathJoin(n: babelTypes.Node) {
  if (!babelTypes.isCallExpression(n)) {
    return null;
  }

  if (!babelTypes.isMemberExpression(n.callee)) {
    return null;
  }

  const ci =
    n.callee.object &&
    n.callee.object.type === 'Identifier' &&
    n.callee.object.name === 'path' &&
    n.callee.property &&
    n.callee.property.type === 'Identifier' &&
    n.callee.property.name === 'join';

  if (!ci) {
    return null;
  }

  const dn =
    n.arguments[0] &&
    n.arguments[0].type === 'Identifier' &&
    n.arguments[0].name === '__dirname';

  if (!dn) {
    return null;
  }

  const f =
    n.arguments && isLiteral(n.arguments[1]) && n.arguments.length === 2; // TODO concat them

  if (!f) {
    return null;
  }

  return { v1: getLiteralValue(n.arguments[1] as babelTypes.StringLiteral) };
}

export function visitorSuccessful(node: babelTypes.Node, test = false) {
  let was: Was | null = visitorRequireResolve(node);

  if (was) {
    if (test) {
      return forge('require.resolve({v1}{c2}{v2})', was);
    }

    if (!valid2(was.v2)) {
      return null;
    }

    return {
      alias: was.v1,
      aliasType: ALIAS_AS_RESOLVABLE,
      mustExclude: was.v2 === 'must-exclude',
      mayExclude: was.v2 === 'may-exclude',
    };
  }

  was = visitorRequire(node);

  if (was) {
    if (test) {
      return forge('require({v1}{c2}{v2})', was);
    }

    if (!valid2(was.v2)) {
      return null;
    }

    return {
      alias: was.v1,
      aliasType: ALIAS_AS_RESOLVABLE,
      mustExclude: was.v2 === 'must-exclude',
      mayExclude: was.v2 === 'may-exclude',
    };
  }

  was = visitorImport(node);

  if (was) {
    if (test) {
      return forge('import {v3}{c3}{v1}', was);
    }

    return { alias: was.v1, aliasType: ALIAS_AS_RESOLVABLE };
  }

  was = visitorPathJoin(node);

  if (was) {
    if (test) {
      return forge('path.join(__dirname{c1}{v1})', was);
    }

    return { alias: was.v1, aliasType: ALIAS_AS_RELATIVE, mayExclude: false };
  }

  return null;
}

function nonLiteralRequireResolve(n: babelTypes.Node) {
  if (!babelTypes.isCallExpression(n)) {
    return null;
  }

  if (!babelTypes.isMemberExpression(n.callee)) {
    return null;
  }

  const ci =
    n.callee.object.type === 'Identifier' &&
    n.callee.object.name === 'require' &&
    n.callee.property.type === 'Identifier' &&
    n.callee.property.name === 'resolve';

  if (!ci) {
    return null;
  }

  if (isLiteral(n.arguments[0])) {
    return null;
  }

  const m = n.arguments[1];

  if (!m) {
    return { v1: reconstruct(n.arguments[0]) };
  }

  if (!isLiteral(n.arguments[1])) {
    return null;
  }

  return {
    v1: reconstruct(n.arguments[0]),
    v2: getLiteralValue(n.arguments[1]),
  };
}

function nonLiteralRequire(n: babelTypes.Node) {
  if (!babelTypes.isCallExpression(n)) {
    return null;
  }

  if (!babelTypes.isIdentifier(n.callee)) {
    return null;
  }

  if (n.callee.name !== 'require') {
    return null;
  }

  if (isLiteral(n.arguments[0])) {
    return null;
  }

  const m = n.arguments[1];

  if (!m) {
    return { v1: reconstruct(n.arguments[0]) };
  }

  if (!isLiteral(n.arguments[1])) {
    return null;
  }

  return {
    v1: reconstruct(n.arguments[0]),
    v2: getLiteralValue(n.arguments[1]),
  };
}

export function visitorNonLiteral(n: babelTypes.Node) {
  const was = nonLiteralRequireResolve(n) || nonLiteralRequire(n);

  if (was) {
    if (!valid2(was.v2)) {
      return null;
    }

    return {
      alias: was.v1,
      mustExclude: was.v2 === 'must-exclude',
      mayExclude: was.v2 === 'may-exclude',
    };
  }

  return null;
}

function isRequire(n: babelTypes.Node) {
  if (!babelTypes.isCallExpression(n)) {
    return null;
  }

  if (!babelTypes.isIdentifier(n.callee)) {
    return null;
  }

  if (n.callee.name !== 'require') {
    return null;
  }

  const f = n.arguments && n.arguments[0];

  if (!f) {
    return null;
  }

  return { v1: reconstruct(n.arguments[0]) };
}

function isRequireResolve(n: babelTypes.Node) {
  if (!babelTypes.isCallExpression(n)) {
    return null;
  }

  if (!babelTypes.isMemberExpression(n.callee)) {
    return null;
  }

  const ci =
    n.callee.object.type === 'Identifier' &&
    n.callee.object.name === 'require' &&
    n.callee.property.type === 'Identifier' &&
    n.callee.property.name === 'resolve';

  if (!ci) {
    return null;
  }

  const f = n.type === 'CallExpression' && n.arguments && n.arguments[0];

  if (!f) {
    return null;
  }

  return { v1: reconstruct(n.arguments[0]) };
}

export function visitorMalformed(n: babelTypes.Node) {
  const was = isRequireResolve(n) || isRequire(n);

  if (was) {
    return { alias: was.v1 };
  }

  return null;
}

export function visitorUseSCWD(n: babelTypes.Node) {
  // eslint-disable-line camelcase
  if (!babelTypes.isCallExpression(n)) {
    return null;
  }

  if (!babelTypes.isMemberExpression(n.callee)) {
    return null;
  }

  const ci =
    n.callee.object.type === 'Identifier' &&
    n.callee.object.name === 'path' &&
    n.callee.property.type === 'Identifier' &&
    n.callee.property.name === 'resolve';

  if (!ci) {
    return null;
  }

  const was = { v1: n.arguments.map(reconstruct).join(', ') };

  if (was) {
    return { alias: was.v1 };
  }

  return null;
}

type VisitorFunction = (node: babelTypes.Node, trying?: boolean) => boolean;

function traverse(ast: babelTypes.File, visitor: VisitorFunction) {
  // modified esprima-walk to support
  // visitor return value and "trying" flag
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stack: Array<[any, boolean]> = [[ast, false]];

  for (let i = 0; i < stack.length; i += 1) {
    const item = stack[i];
    let [node] = item;

    if (node) {
      const trying = item[1] || babelTypes.isTryStatement(node);

      if (visitor(node, trying)) {
        for (const key in node) {
          if (node[key as keyof babelTypes.File]) {
            const child = node[key as keyof babelTypes.File];

            if (child instanceof Array) {
              for (let j = 0; j < child.length; j += 1) {
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

export function parse(body: string) {
  return babel.parse(body, {
    allowImportExportEverywhere: true,
    allowReturnOutsideFunction: true,
    plugins: ['estree', 'bigInt', 'classPrivateProperties', 'classProperties'],
  });
}

export function detect(body: string, visitor: VisitorFunction) {
  const json = parse(body);

  if (!json) {
    return;
  }

  traverse(json, visitor);
}
