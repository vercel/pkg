'use strict';

var google = require('googleapis');
var urlshortener = google.urlshortener('v1');
if (urlshortener.url) {
  console.log('ok');
}
