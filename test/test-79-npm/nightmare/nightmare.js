'use strict';

var Nightmare = require('nightmare');
var nightmare = new Nightmare({ show: false });

nightmare
  .goto('http://yahoo.com')
  .type('form[action*="/search"] [name=p]', 'github nightmare')
  .click('form[action*="/search"] [type=submit]')
  .wait('#main')
  .evaluate(function () {
    // nightmare takes thisFunction.toString(), so --public
    // is needed (or placing this file to assets)
    return document.querySelector('#main .searchCenterMiddle li a').href;
  })
  .end()
  .then(function (result) {
    if (result.indexOf('segmentio') >= 0) console.log('ok');
  });
