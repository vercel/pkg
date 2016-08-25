'use strict';

// apt-get install libcurl4-openssl-dev

// IF YOU USE 32-BIT NODEJS:
// patch /usr/include/curl/curlbuild.h
// #define CURL_SIZEOF_LONG 4
// #define CURL_SIZEOF_CURL_OFF_T 4

var Curl = require('node-libcurl').Curl;
var curl = new Curl();
curl.setOpt('URL', 'www.yandex.ru');
curl.setOpt('FOLLOWLOCATION', true);
curl.on('end', function (status) {
  if (status === 200) {
    console.log('ok');
  }
  this.close(); // eslint-disable-line no-invalid-this
});
curl.perform();
