'use strict';

const o = require('./stamp.js');

module.exports = function (stamp) {
  return o.p === stamp.p && o.a === stamp.a && o.m === stamp.m;
};
