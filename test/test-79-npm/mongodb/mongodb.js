'use strict';

var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
if (typeof MongoClient === 'function') {
  console.log('ok');
}
