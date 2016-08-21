'use strict';

let mdns = require('mdns');
if (mdns.dns_sd) {
  console.log('ok');
}
