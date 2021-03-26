'use strict';

var fs = require('fs');
var puppeteer = require('puppeteer');

puppeteer.launch().then(function (browser) {
  browser.newPage().then(function (page) {
    page
      .goto('https://zeit.co')
      .then(function () {
        page.screenshot({ path: 'zeit.png' }).then(function () {
          browser.close();
          fs.unlinkSync('zeit.png');
          console.log('ok');
        });
      })
      .catch((error) => {
        console.error(error);
        process.exit(1);
      });
  });
});
