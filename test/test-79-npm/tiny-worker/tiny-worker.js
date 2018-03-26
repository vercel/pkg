'use strict';

var Worker = require('tiny-worker');
var worker = new Worker('fixture.js');

worker.onmessage = function (ev) {
  console.log(ev.data);
  worker.terminate();
};

worker.postMessage('ok?');
