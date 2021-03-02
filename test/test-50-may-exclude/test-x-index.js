'use strict';

// 1

var error1;

function func1 () {
  require.resolve('not-exists-1', 'may-exclude');
}

try {
  func1();
} catch (e) {
  error1 = e;
}

// 2

var error2;

function func2 () {
  require.resolve('not-exists-2', 'may-exclude');
}

try {
  func2();
} catch (e) {
  error2 = e;
}

// 3

var error3;

try {
  require.resolve('not-exists-3');
} catch (e) {
  error3 = e;
}

// 4

var error4;

try {
  if (process.env.HELLO !== 'WORLD') {
    require.resolve('not-exists-4');
  }
} catch (e) {
  error4 = e;
}

console.log([

  error1.message.split('\n')[0],
  error1.code,
  JSON.stringify(Object.assign(error1, { requireStack: undefined })),
  error2.message.split('\n')[0],
  error2.code,
  JSON.stringify(Object.assign(error2, { requireStack: undefined })),
  error3.message.split('\n')[0],
  error3.code,
  JSON.stringify(Object.assign(error3, { requireStack: undefined })),
  error4.message.split('\n')[0],
  error4.code,
  JSON.stringify(Object.assign(error4, { requireStack: undefined }))

].join('\n'));
