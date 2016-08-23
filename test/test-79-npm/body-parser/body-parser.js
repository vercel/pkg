'use strict';

let parser = require('body-parser');
let req = { headers: { } };
let res = {};

let middleware = parser.json();

middleware(req, res, function () {
  let middleware2 = parser.urlencoded({ extended: true });
  middleware2(req, res, function () {
    let middleware3 = parser.urlencoded({ extended: false });
    middleware3(req, res, function () {
      console.log('ok');
    });
  });
});
