#!/usr/bin/env node

'use strict';

const Class = class {};
// test if Class.toString() segfaults
const cts = Class.toString();
if (cts.indexOf('function Class()') >= 0) {
  console.log('ok');
}
