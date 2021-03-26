'use strict';

function isModuleNotFoundError(error) {
  return (
    error.code === 'MODULE_NOT_FOUND' &&
    error.message.indexOf('build/Release/kerberos') >= 0
  );
}

var kerberos;

function hideTryBlockFromBundleDetectorIgnoreFlag() {
  kerberos = require('kerberos');
}

try {
  hideTryBlockFromBundleDetectorIgnoreFlag();
} catch (error) {
  if (!isModuleNotFoundError(error)) {
    console.log('bad1', error);
    return;
  }
}

var sspi;

function hideTryBlockFromBundleDetectorIgnoreFlag2() {
  sspi = require('kerberos/lib/sspi');
}

try {
  if (process.platform === 'win32') {
    hideTryBlockFromBundleDetectorIgnoreFlag2();
  }
} catch (error) {
  if (!isModuleNotFoundError(error)) {
    console.log('bad2', error);
    return;
  }
}

if (kerberos) {
  if (typeof kerberos.Kerberos !== 'function') {
    console.log('bad');
    return;
  }
}

if (sspi) {
  if (typeof sspi.SSPI !== 'function') {
    console.log('bad');
    return;
  }
}

console.log('ok');
