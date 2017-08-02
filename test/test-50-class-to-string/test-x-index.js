'use strict';

const Class = class {};
// test if Class.toString() segfaults
// or returns incorrect value (#62)
const cts = Class.toString();
if (cts.indexOf('class {}') >= 0) {
  console.log('ok');
}
