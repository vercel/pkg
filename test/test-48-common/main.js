#!/usr/bin/env node

/* eslint-disable no-multi-spaces */

'use strict';

const assert = require('assert');
const common = require('../../prelude/common.js');

if (process.platform === 'win32') {

  assert.equal('c:',                   common.normalizePath('c:'));
  assert.equal('C:\\',                 common.normalizePath('c:\\'));
  assert.equal('C:\\',                 common.normalizePath('c:\\\\'));
  assert.equal('C:\\thebox',           common.normalizePath('c:\\thebox'));
  assert.equal('C:\\theboxer',         common.normalizePath('c:\\theboxer'));
  assert.equal('C:\\thebox',           common.normalizePath('c:\\thebox\\'));
  assert.equal('C:\\theboxer',         common.normalizePath('c:\\theboxer\\'));
  assert.equal('C:\\thebox\\foo',      common.normalizePath('c:\\thebox\\\\foo'));
  assert.equal('C:\\thebox\\foo\\bar', common.normalizePath('c:\\thebox\\\\foo\\\\bar\\\\\\'));

  assert.equal(common.insideTheBox('c:'), false);
  assert.equal(common.insideTheBox('c:\\'), false);
  assert.equal(common.insideTheBox('c:\\foo'), false);
  assert.equal(common.insideTheBox('c:\\foo\\thebox'), false);
  assert.equal(common.insideTheBox('c:\\thebox'), true);
  assert.equal(common.insideTheBox('c:\\theboxer'), false);
  assert.equal(common.insideTheBox('c:\\thebox\\'), true);
  assert.equal(common.insideTheBox('c:\\theboxer\\'), false);
  assert.equal(common.insideTheBox('c:\\thebox\\\\'), true);
  assert.equal(common.insideTheBox('c:\\thebox\\foo'), true);
  assert.equal(common.insideTheBox('c:\\theboxer\\foo'), false);

  assert.equal('c:\\',           common.stripTheBox('c:\\'));
  assert.equal('c:\\\\',         common.stripTheBox('c:\\\\'));
  assert.equal('C:\\',           common.stripTheBox('c:\\thebox'));
  assert.equal('c:\\theboxer',   common.stripTheBox('c:\\theboxer'));
  assert.equal('C:\\',           common.stripTheBox('c:\\thebox\\'));
  assert.equal('c:\\theboxer\\', common.stripTheBox('c:\\theboxer\\'));
  assert.equal('C:\\foo',        common.stripTheBox('c:\\thebox\\\\foo'));
  assert.equal('C:\\foo\\bar',   common.stripTheBox('c:\\thebox\\\\foo\\\\bar\\\\\\'));

  assert.equal('C:\\thebox\\',         common.theboxify('c:\\'));
  assert.equal('C:\\thebox\\foo',      common.theboxify('c:\\foo'));
  assert.equal('C:\\thebox\\foo',      common.theboxify('c:\\foo\\'));
  assert.equal('C:\\thebox\\foo',      common.theboxify('c:\\foo\\\\'));
  assert.equal('C:\\thebox\\foo\\bar', common.theboxify('c:\\foo\\\\bar'));
  assert.equal('C:\\thebox\\foo\\bar', common.theboxify('c:\\foo\\\\bar\\\\\\'));

} else {

  assert.equal('/',               common.normalizePath('/'));
  assert.equal('/',               common.normalizePath('//'));
  assert.equal('/thebox',         common.normalizePath('/thebox'));
  assert.equal('/theboxer',       common.normalizePath('/theboxer'));
  assert.equal('/thebox',         common.normalizePath('/thebox/'));
  assert.equal('/theboxer',       common.normalizePath('/theboxer/'));
  assert.equal('/thebox/foo',     common.normalizePath('/thebox//foo'));
  assert.equal('/thebox/foo/bar', common.normalizePath('/thebox//foo//bar///'));

  assert.equal(common.insideTheBox(''), false);
  assert.equal(common.insideTheBox('/'), false);
  assert.equal(common.insideTheBox('/foo'), false);
  assert.equal(common.insideTheBox('/foo/thebox'), false);
  assert.equal(common.insideTheBox('/thebox'), true);
  assert.equal(common.insideTheBox('/theboxer'), false);
  assert.equal(common.insideTheBox('/thebox/'), true);
  assert.equal(common.insideTheBox('/theboxer/'), false);
  assert.equal(common.insideTheBox('/thebox//'), true);
  assert.equal(common.insideTheBox('/thebox/foo'), true);
  assert.equal(common.insideTheBox('/theboxer/foo'), false);

  assert.equal('/',          common.stripTheBox('/'));
  assert.equal('//',         common.stripTheBox('//'));
  assert.equal('/',          common.stripTheBox('/thebox'));
  assert.equal('/theboxer',  common.stripTheBox('/theboxer'));
  assert.equal('/',          common.stripTheBox('/thebox/'));
  assert.equal('/theboxer/', common.stripTheBox('/theboxer/'));
  assert.equal('/foo',       common.stripTheBox('/thebox//foo'));
  assert.equal('/foo/bar',   common.stripTheBox('/thebox//foo//bar///'));

  assert.equal('/thebox/',        common.theboxify('/'));
  assert.equal('/thebox/foo',     common.theboxify('/foo'));
  assert.equal('/thebox/foo',     common.theboxify('/foo/'));
  assert.equal('/thebox/foo',     common.theboxify('/foo//'));
  assert.equal('/thebox/foo/bar', common.theboxify('/foo//bar'));
  assert.equal('/thebox/foo/bar', common.theboxify('/foo//bar///'));

}
