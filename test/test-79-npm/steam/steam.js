'use strict';

let Steam = require('steam');
let steamClient = new Steam.SteamClient();
if (typeof steamClient.connect === 'function') {
  console.log('ok');
}
