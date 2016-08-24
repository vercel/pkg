'use strict';

var name = 'not-exists';
var error1, error2;

try {
  require.resolve(name);
} catch (e) {
  error1 = e;
}

try {
  require(name);
} catch (e) {
  error2 = e;
}

console.log([

  error1.message.split('\n')[0],
  error1.code,
  error2.message.split('\n')[0],
  error2.code

].join('\n'));
