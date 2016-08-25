'use strict';

var aws = require('aws-sdk');

var s3 = new aws.S3({
  accessKeyId: 'AKIAIVHNVWTSY6A5YGXA',
  secretAccessKey: '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'
});

s3.listObjects({
  Bucket: 'enclosejs'
}, function (error, objects) {

  if (error) throw error;

  if (objects.Contents.length > 4) {
    console.log('ok');
  }

});
