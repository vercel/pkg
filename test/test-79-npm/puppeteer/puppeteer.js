'use strict';

var fs = require('fs');
var puppeteer = require('puppeteer');

puppeteer.launch().then(function (browser) {
  browser.newPage().then(function (page) {
    page.goto('https://example.com').then(function () {
      page.screenshot({ path: 'example.png' }).then(function () {
        browser.close();
        fs.unlinkSync('example.png');
        console.log('ok');
      });
    });
  });
});
