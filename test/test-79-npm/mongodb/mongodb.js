let mongodb = require('mongodb');
let MongoClient = mongodb.MongoClient;
if (typeof MongoClient === 'function') {
  console.log('ok');
}
