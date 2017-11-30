'use strict';

var webdriverio = require('webdriverio');
var client = webdriverio.remote().init();
client.url('http://google.com').catch((e) => {
  if (e.message.includes('ECONNREFUSED')) {
    console.log('ok');
  }
});
