'use strict';

var muri = require('muri');
// console.log(muri.version);
var o = muri('mongodb://user:pass@local,remote:27018,japan:27019/neatdb?replicaSet=myreplset&journal=true&w=2&wtimeoutMS=50');
if (o.options.replicaSet === 'myreplset') {
  console.log('ok');
}
