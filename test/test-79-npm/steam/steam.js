'use strict';

var Steam = require('steam');
var steamClient = new Steam.SteamClient();
if (typeof steamClient.connect === 'function') {
  console.log('ok');
}
