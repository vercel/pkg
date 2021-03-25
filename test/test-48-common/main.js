#!/usr/bin/env node

/* eslint-disable no-multi-spaces */

'use strict';

const assert = require('assert');
const common = require('../../lib-es5/common.js');

function substituteMany(files) {
  const d = common.retrieveDenominator(files);
  return files.map((f) => common.substituteDenominator(f, d));
}

if (process.platform === 'win32') {
  assert.strictEqual('c:', common.normalizePath('c:'));
  assert.strictEqual('C:\\', common.normalizePath('c:\\'));
  assert.strictEqual('C:\\', common.normalizePath('c:\\\\'));
  assert.strictEqual('C:\\snapshot', common.normalizePath('c:\\snapshot'));
  assert.strictEqual('C:\\snapshoter', common.normalizePath('c:\\snapshoter'));
  assert.strictEqual('C:\\snapshot', common.normalizePath('c:\\snapshot\\'));
  assert.strictEqual(
    'C:\\snapshoter',
    common.normalizePath('c:\\snapshoter\\')
  );
  assert.strictEqual(
    'C:\\snapshot\\foo',
    common.normalizePath('c:\\snapshot\\\\foo')
  );
  assert.strictEqual(
    'C:\\snapshot\\foo\\bar',
    common.normalizePath('c:\\snapshot\\\\foo\\\\bar\\/\\\\')
  );

  assert.strictEqual(common.insideSnapshot('c:'), false);
  assert.strictEqual(common.insideSnapshot('c:\\'), false);
  assert.strictEqual(common.insideSnapshot('c:\\foo'), false);
  assert.strictEqual(common.insideSnapshot('c:\\foo\\snapshot'), false);
  assert.strictEqual(common.insideSnapshot('c:\\snapshot'), true);
  assert.strictEqual(common.insideSnapshot('c:\\snapshoter'), false);
  assert.strictEqual(common.insideSnapshot('c:\\snapshot\\'), true);
  assert.strictEqual(common.insideSnapshot('c:\\snapshoter\\'), false);
  assert.strictEqual(common.insideSnapshot('c:\\snapshot\\\\'), true);
  assert.strictEqual(common.insideSnapshot('c:\\snapshot\\foo'), true);
  assert.strictEqual(common.insideSnapshot('c:\\snapshoter\\foo'), false);

  assert.strictEqual('c:\\', common.stripSnapshot('c:\\'));
  assert.strictEqual('c:\\\\', common.stripSnapshot('c:\\\\'));
  assert.strictEqual('C:\\**\\', common.stripSnapshot('c:\\snapshot'));
  assert.strictEqual('c:\\snapshoter', common.stripSnapshot('c:\\snapshoter'));
  assert.strictEqual('C:\\**\\', common.stripSnapshot('c:\\snapshot\\'));
  assert.strictEqual(
    'c:\\snapshoter\\',
    common.stripSnapshot('c:\\snapshoter\\')
  );
  assert.strictEqual(
    'C:\\**\\foo',
    common.stripSnapshot('c:\\snapshot\\\\foo')
  );
  assert.strictEqual(
    'C:\\**\\foo\\bar',
    common.stripSnapshot('c:\\snapshot\\\\foo\\\\bar\\/\\\\')
  );

  assert.strictEqual('C:\\snapshot', common.snapshotify('C:\\'));
  assert.strictEqual('C:\\snapshot\\foo', common.snapshotify('C:\\foo'));
  assert.strictEqual(
    'C:\\snapshot\\foo\\bar',
    common.snapshotify('C:\\foo\\bar')
  );

  assert.strictEqual('foo', common.removeUplevels('..\\foo'));
  assert.strictEqual('foo', common.removeUplevels('..\\..\\foo'));
  assert.strictEqual('.\\foo', common.removeUplevels('.\\foo'));
  assert.strictEqual('.', common.removeUplevels('.'));
  assert.strictEqual('.', common.removeUplevels('..'));
  assert.strictEqual('.', common.removeUplevels('..\\..'));

  assert.deepStrictEqual(
    substituteMany([
      'C:\\long\\haired\\freaky\\people',
      'C:\\long\\haired\\aliens',
    ]),
    ['C:\\freaky\\people', 'C:\\aliens']
  );

  assert.deepStrictEqual(
    substituteMany([
      'C:\\long\\haired\\freaky\\people',
      'C:\\long\\hyphen\\sign',
    ]),
    ['C:\\haired\\freaky\\people', 'C:\\hyphen\\sign']
  );

  assert.deepStrictEqual(
    substituteMany([
      'C:\\long\\haired\\freaky\\people',
      'D:\\long\\hyphen\\sign',
    ]),
    ['C:\\long\\haired\\freaky\\people', 'D:\\long\\hyphen\\sign']
  );
} else {
  assert.strictEqual('/', common.normalizePath('/'));
  assert.strictEqual('/', common.normalizePath('//'));
  assert.strictEqual('/snapshot', common.normalizePath('/snapshot'));
  assert.strictEqual('/snapshoter', common.normalizePath('/snapshoter'));
  assert.strictEqual('/snapshot', common.normalizePath('/snapshot/'));
  assert.strictEqual('/snapshoter', common.normalizePath('/snapshoter/'));
  assert.strictEqual('/snapshot/foo', common.normalizePath('/snapshot//foo'));
  assert.strictEqual(
    '/snapshot/foo/bar',
    common.normalizePath('/snapshot//foo//bar/\\//')
  );

  assert.strictEqual(common.insideSnapshot(''), false);
  assert.strictEqual(common.insideSnapshot('/'), false);
  assert.strictEqual(common.insideSnapshot('/foo'), false);
  assert.strictEqual(common.insideSnapshot('/foo/snapshot'), false);
  assert.strictEqual(common.insideSnapshot('/snapshot'), true);
  assert.strictEqual(common.insideSnapshot('/snapshoter'), false);
  assert.strictEqual(common.insideSnapshot('/snapshot/'), true);
  assert.strictEqual(common.insideSnapshot('/snapshoter/'), false);
  assert.strictEqual(common.insideSnapshot('/snapshot//'), true);
  assert.strictEqual(common.insideSnapshot('/snapshot/foo'), true);
  assert.strictEqual(common.insideSnapshot('/snapshoter/foo'), false);

  assert.strictEqual('/', common.stripSnapshot('/'));
  assert.strictEqual('//', common.stripSnapshot('//'));
  assert.strictEqual('/**/', common.stripSnapshot('/snapshot'));
  assert.strictEqual('/snapshoter', common.stripSnapshot('/snapshoter'));
  assert.strictEqual('/**/', common.stripSnapshot('/snapshot/'));
  assert.strictEqual('/snapshoter/', common.stripSnapshot('/snapshoter/'));
  assert.strictEqual('/**/foo', common.stripSnapshot('/snapshot//foo'));
  assert.strictEqual(
    '/**/foo/bar',
    common.stripSnapshot('/snapshot//foo//bar/\\//')
  );

  assert.strictEqual('/snapshot', common.snapshotify('/'));
  assert.strictEqual('/snapshot/foo', common.snapshotify('/foo'));
  assert.strictEqual('/snapshot/foo/bar', common.snapshotify('/foo/bar'));

  assert.strictEqual('foo', common.removeUplevels('../foo'));
  assert.strictEqual('foo', common.removeUplevels('../../foo'));
  assert.strictEqual('./foo', common.removeUplevels('./foo'));
  assert.strictEqual('.', common.removeUplevels('.'));
  assert.strictEqual('.', common.removeUplevels('..'));
  assert.strictEqual('.', common.removeUplevels('../..'));

  assert.deepStrictEqual(
    substituteMany(['/long/haired/freaky/people', '/long/haired/aliens']),
    ['/freaky/people', '/aliens']
  );

  assert.deepStrictEqual(
    substituteMany(['/long/haired/freaky/people', '/long/hyphen/sign']),
    ['/haired/freaky/people', '/hyphen/sign']
  );
}
