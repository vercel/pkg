'use strict';

let moment = require('moment');
moment.locale('ru');
let newyear = new Date(2014, 0, 1);
let s = moment(newyear).format('llll');
if (s.indexOf('янв') >= 0) {
  console.log('ok');
}
