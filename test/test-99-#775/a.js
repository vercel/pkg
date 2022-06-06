'use strict';

console.log('Starting a');

// note : worker_threads in only valid for nodejs >= 12.0
const MAJOR_VERSION = parseInt(process.version.match(/v([0-9]+)/)[1], 10);
if (MAJOR_VERSION < 12) {
  return;
}

const { Worker } = require('worker_threads');
// eslint-disable-next-line no-new
new Worker('./b.js');
console.log('Finishing a');
