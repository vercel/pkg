/* eslint-disable no-undef */

'use strict';

onmessage = function (ev) {
  postMessage(ev.data.slice(0, 2));
};
