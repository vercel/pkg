'use strict';

var moment = require('moment');
moment.locale('ru');
var newyear = new Date(2014, 0, 1);
var s = moment(newyear).format('llll');
if (s.indexOf('янв') >= 0) {
  console.log('ok');
}
