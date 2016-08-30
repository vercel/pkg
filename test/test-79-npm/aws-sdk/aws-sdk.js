'use strict';

var aws = require('aws-sdk');

var s3 = new aws.S3({
  accessKeyId: 'AKWAI6HNVITSXVA5YGXA',
  secretAccessKey: 'TdYfRLZvALdm7LzLPTHdTwTMd7eMuWkI3a3Lw5pi'
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
