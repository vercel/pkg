'use strict';

require('safe_datejs');
let today = new Date(2011, 11, 12, 0, 0, 0, 0);
let wrap = today.AsDateJs(); // eslint-disable-line new-cap
if (wrap.is().today() === false) {
  console.log('ok');
}
