'use strict';

var Promise = require('any-promise');

function p() {
  return new Promise((resolve) => {
    resolve('ok');
  });
}

p().then((result) => {
  console.log(result);
});
