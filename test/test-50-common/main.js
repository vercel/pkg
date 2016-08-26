#!/usr/bin/env node

'use strict';

const assert = require('assert');
const common = require('../../runtime/common.js');

if (process.platform === 'win32') {

  assert.equal('c:.',                  common.normalizePath('c:')); // TODO research
  assert.equal('C:\\',                 common.normalizePath('c:\\'));
  assert.equal('C:\\',                 common.normalizePath('c:\\\\'));
  assert.equal('C:\\thebox',           common.normalizePath('c:\\thebox'));
  assert.equal('C:\\thebox',           common.normalizePath('c:\\thebox\\'));
  assert.equal('C:\\thebox\\foo',      common.normalizePath('c:\\thebox\\\\foo'));
  assert.equal('C:\\thebox\\foo\\bar', common.normalizePath('c:\\thebox\\\\foo\\\\bar\\\\\\'));

  assert.equal(common.insideTheBox('c:'), false);
  assert.equal(common.insideTheBox('c:\\'), false);
  assert.equal(common.insideTheBox('c:\\foo'), false);
  assert.equal(common.insideTheBox('c:\\foo\\thebox'), false);
  assert.equal(common.insideTheBox('c:\\thebox'), true);
  assert.equal(common.insideTheBox('c:\\thebox\\'), true);
  assert.equal(common.insideTheBox('c:\\thebox\\\\'), true);
  assert.equal(common.insideTheBox('c:\\thebox\\foo'), true);

  assert.equal('c:\\',         common.stripTheBox('c:\\'));
  assert.equal('c:\\\\',       common.stripTheBox('c:\\\\'));
  assert.equal('C:\\',         common.stripTheBox('c:\\thebox'));
  assert.equal('C:\\',         common.stripTheBox('c:\\thebox\\'));
  assert.equal('C:\\foo',      common.stripTheBox('c:\\thebox\\\\foo'));
  assert.equal('C:\\foo\\bar', common.stripTheBox('c:\\thebox\\\\foo\\\\bar\\\\\\'));

  assert.equal('C:\\thebox\\',         common.theboxify('c:\\'));
  assert.equal('C:\\thebox\\foo',      common.theboxify('c:\\foo'));
  assert.equal('C:\\thebox\\foo',      common.theboxify('c:\\foo\\'));
  assert.equal('C:\\thebox\\foo',      common.theboxify('c:\\foo\\\\'));
  assert.equal('C:\\thebox\\foo\\bar', common.theboxify('c:\\foo\\\\bar'));
  assert.equal('C:\\thebox\\foo\\bar', common.theboxify('c:\\foo\\\\bar\\\\\\'));

} else {

  // TODO

}
