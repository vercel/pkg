#!/usr/bin/env node

/* eslint-disable no-multi-spaces */

'use strict';

const assert = require('assert');
const common = require('../../prelude/common.js');

function snapshotifyMany (files) {
  const d = common.retrieveDenominator(files);
  return files.map((f) => common.snapshotify(f, d));
}

if (process.platform === 'win32') {
  assert.equal('c:',                     common.normalizePath('c:'));
  assert.equal('C:\\',                   common.normalizePath('c:\\'));
  assert.equal('C:\\',                   common.normalizePath('c:\\\\'));
  assert.equal('C:\\snapshot',           common.normalizePath('c:\\snapshot'));
  assert.equal('C:\\snapshoter',         common.normalizePath('c:\\snapshoter'));
  assert.equal('C:\\snapshot',           common.normalizePath('c:\\snapshot\\'));
  assert.equal('C:\\snapshoter',         common.normalizePath('c:\\snapshoter\\'));
  assert.equal('C:\\snapshot\\foo',      common.normalizePath('c:\\snapshot\\\\foo'));
  assert.equal('C:\\snapshot\\foo\\bar', common.normalizePath('c:\\snapshot\\\\foo\\\\bar\\/\\\\'));

  assert.equal(common.insideSnapshot('c:'), false);
  assert.equal(common.insideSnapshot('c:\\'), false);
  assert.equal(common.insideSnapshot('c:\\foo'), false);
  assert.equal(common.insideSnapshot('c:\\foo\\snapshot'), false);
  assert.equal(common.insideSnapshot('c:\\snapshot'), true);
  assert.equal(common.insideSnapshot('c:\\snapshoter'), false);
  assert.equal(common.insideSnapshot('c:\\snapshot\\'), true);
  assert.equal(common.insideSnapshot('c:\\snapshoter\\'), false);
  assert.equal(common.insideSnapshot('c:\\snapshot\\\\'), true);
  assert.equal(common.insideSnapshot('c:\\snapshot\\foo'), true);
  assert.equal(common.insideSnapshot('c:\\snapshoter\\foo'), false);

  assert.equal('c:\\',             common.stripSnapshot('c:\\'));
  assert.equal('c:\\\\',           common.stripSnapshot('c:\\\\'));
  assert.equal('C:\\**\\',         common.stripSnapshot('c:\\snapshot'));
  assert.equal('c:\\snapshoter',   common.stripSnapshot('c:\\snapshoter'));
  assert.equal('C:\\**\\',         common.stripSnapshot('c:\\snapshot\\'));
  assert.equal('c:\\snapshoter\\', common.stripSnapshot('c:\\snapshoter\\'));
  assert.equal('C:\\**\\foo',      common.stripSnapshot('c:\\snapshot\\\\foo'));
  assert.equal('C:\\**\\foo\\bar', common.stripSnapshot('c:\\snapshot\\\\foo\\\\bar\\/\\\\'));

  assert.equal('C:\\snapshot',           common.snapshotify('c:\\'));
  assert.equal('C:\\snapshot\\foo',      common.snapshotify('c:\\foo'));
  assert.equal('C:\\snapshot\\foo',      common.snapshotify('c:\\foo\\'));
  assert.equal('C:\\snapshot\\foo',      common.snapshotify('c:\\foo\\\\'));
  assert.equal('C:\\snapshot\\foo\\bar', common.snapshotify('c:\\foo\\\\bar'));
  assert.equal('C:\\snapshot\\foo\\bar', common.snapshotify('c:\\foo\\\\bar\\/\\\\'));

  assert.equal('foo',     common.removeUplevels('..\\foo'));
  assert.equal('foo',     common.removeUplevels('..\\..\\foo'));
  assert.equal('.\\foo',  common.removeUplevels('.\\foo'));
  assert.equal('.',       common.removeUplevels('.'));
  assert.equal('.',       common.removeUplevels('..'));
  assert.equal('.',       common.removeUplevels('..\\..'));

  assert.deepEqual(snapshotifyMany(
    [ 'C:\\long\\haired\\freaky\\people', 'C:\\long\\haired\\aliens' ]),
    [ 'C:\\snapshot\\freaky\\people',     'C:\\snapshot\\aliens' ]);

  assert.deepEqual(snapshotifyMany(
    [ 'C:\\long\\haired\\freaky\\people',     'C:\\long\\hyphen\\sign' ]),
    [ 'C:\\snapshot\\haired\\freaky\\people', 'C:\\snapshot\\hyphen\\sign' ]);

  assert.deepEqual(snapshotifyMany(
    [ 'C:\\long\\haired\\freaky\\people',           'D:\\long\\hyphen\\sign' ]),
    [ 'C:\\snapshot\\long\\haired\\freaky\\people', 'D:\\snapshot\\long\\hyphen\\sign' ]);
} else {
  assert.equal('/',                 common.normalizePath('/'));
  assert.equal('/',                 common.normalizePath('//'));
  assert.equal('/snapshot',         common.normalizePath('/snapshot'));
  assert.equal('/snapshoter',       common.normalizePath('/snapshoter'));
  assert.equal('/snapshot',         common.normalizePath('/snapshot/'));
  assert.equal('/snapshoter',       common.normalizePath('/snapshoter/'));
  assert.equal('/snapshot/foo',     common.normalizePath('/snapshot//foo'));
  assert.equal('/snapshot/foo/bar', common.normalizePath('/snapshot//foo//bar/\\//'));

  assert.equal(common.insideSnapshot(''), false);
  assert.equal(common.insideSnapshot('/'), false);
  assert.equal(common.insideSnapshot('/foo'), false);
  assert.equal(common.insideSnapshot('/foo/snapshot'), false);
  assert.equal(common.insideSnapshot('/snapshot'), true);
  assert.equal(common.insideSnapshot('/snapshoter'), false);
  assert.equal(common.insideSnapshot('/snapshot/'), true);
  assert.equal(common.insideSnapshot('/snapshoter/'), false);
  assert.equal(common.insideSnapshot('/snapshot//'), true);
  assert.equal(common.insideSnapshot('/snapshot/foo'), true);
  assert.equal(common.insideSnapshot('/snapshoter/foo'), false);

  assert.equal('/',            common.stripSnapshot('/'));
  assert.equal('//',           common.stripSnapshot('//'));
  assert.equal('/**/',         common.stripSnapshot('/snapshot'));
  assert.equal('/snapshoter',  common.stripSnapshot('/snapshoter'));
  assert.equal('/**/',         common.stripSnapshot('/snapshot/'));
  assert.equal('/snapshoter/', common.stripSnapshot('/snapshoter/'));
  assert.equal('/**/foo',      common.stripSnapshot('/snapshot//foo'));
  assert.equal('/**/foo/bar',  common.stripSnapshot('/snapshot//foo//bar/\\//'));

  assert.equal('/snapshot',         common.snapshotify('/'));
  assert.equal('/snapshot/foo',     common.snapshotify('/foo'));
  assert.equal('/snapshot/foo',     common.snapshotify('/foo/'));
  assert.equal('/snapshot/foo',     common.snapshotify('/foo//'));
  assert.equal('/snapshot/foo/bar', common.snapshotify('/foo//bar'));
  assert.equal('/snapshot/foo/bar', common.snapshotify('/foo//bar/\\//'));

  assert.equal('foo',     common.removeUplevels('../foo'));
  assert.equal('foo',     common.removeUplevels('../../foo'));
  assert.equal('./foo',   common.removeUplevels('./foo'));
  assert.equal('.',       common.removeUplevels('.'));
  assert.equal('.',       common.removeUplevels('..'));
  assert.equal('.',       common.removeUplevels('../..'));

  assert.deepEqual(snapshotifyMany(
    [ '/long/haired/freaky/people', '/long/haired/aliens' ]),
    [ '/snapshot/freaky/people',    '/snapshot/aliens' ]);

  assert.deepEqual(snapshotifyMany(
    [ '/long/haired/freaky/people',     '/long/hyphen/sign' ]),
    [ '/snapshot/haired/freaky/people', '/snapshot/hyphen/sign' ]);
}
