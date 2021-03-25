'use strict';

var bson = require('bson');

var Long = bson.Long;
var doc = { long: Long.fromNumber(100) };
var BSON = bson.BSON;
var obj = new BSON();
var data = obj.serialize(doc, false, true, false);
var doc2 = obj.deserialize(data);

if (doc2.long === 100) {
  console.log('ok');
}
