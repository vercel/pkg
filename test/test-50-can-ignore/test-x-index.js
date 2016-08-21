/* eslint-disable no-process-env */

'use strict';

// 1

let error1;

function func1 () {
  require.resolve('not-exists-1', 'can-ignore');
}

try {
  func1();
} catch (e) {
  error1 = e;
}

// 2

let error2;

function func2 () {
  require.resolve('not-exists-2', 'can-ignore');
}

try {
  func2();
} catch (e) {
  error2 = e;
}

// 3

let error3;

try {
  require.resolve('not-exists-3');
} catch (e) {
  error3 = e;
}

// 4

let error4;

try {
  if (process.env.HELLO !== 'WORLD') {
    require.resolve('not-exists-4');
  }
} catch (e) {
  error4 = e;
}

console.log([

  error1.message,
  error1.code,
  JSON.stringify(error1),
  error2.message,
  error2.code,
  JSON.stringify(error2),
  error3.message,
  error3.code,
  JSON.stringify(error3),
  error4.message,
  error4.code,
  JSON.stringify(error4)

].join('\n'));
