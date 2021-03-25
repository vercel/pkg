'use strict';

var phantom = require('phantom');

var instance, page;
Promise.resolve()
  .then(function () {
    return phantom.create();
  })
  .then(function (i) {
    instance = i;
    return instance.createPage();
  })
  .then(function (p) {
    page = p;
    return page.open('https://stackoverflow.com/');
  })
  .then(function () {
    return page.property('content');
  })
  .then(function (content) {
    if (content.length > 1000) console.log('ok');
    return instance.exit();
  });
