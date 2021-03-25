'use strict';

var bson = require('bson');

var pure = {};
pure.Long = bson.pure().Long;
pure.doc = { long: pure.Long.fromNumber(100) };
pure.BSON = bson.pure().BSON;
pure.obj = new pure.BSON();
pure.data = pure.obj.serialize(pure.doc, false, true, false);
pure.doc2 = pure.obj.deserialize(pure.data);

var natv = {};
natv.Long = bson.native().Long;
natv.doc = { long: natv.Long.fromNumber(200) };
natv.BSON = bson.native().BSON;
natv.obj = new natv.BSON();
natv.data = natv.obj.serialize(natv.doc, false, true, false);
natv.doc2 = natv.obj.deserialize(natv.data);

if (pure.doc2.long === 100) {
  if (natv.doc2.long === 200) {
    console.log('ok');
  }
}
