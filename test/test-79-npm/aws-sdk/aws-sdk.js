'use strict';

var aws = require('aws-sdk');

var s3 = new aws.S3({
  accessKeyId: 'ABRACADABRABRACADABR',
  secretAccessKey: 'TdTdTdTdTdTdTdTdTdTdTdTdTdTdTdTdTdTdTdTd'
});

s3.listObjects({
  Bucket: 'enclosejs'
}, function (error) {
  if (error) {
    if (error.message.indexOf('does not exist') >= 0) {
      console.log('ok');
    }
  }
});
