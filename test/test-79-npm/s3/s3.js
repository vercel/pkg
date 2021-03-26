'use strict';

var s3 = require('s3');

var client = s3.createClient({
  s3Options: {
    accessKeyId: 'ABRACADABRABRACADABR',
    secretAccessKey: 'TdTdTdTdTdTdTdTdTdTdTdTdTdTdTdTdTdTdTdTd',
  },
});

var ee = client.listObjects({
  s3Params: {
    Bucket: 'enclosejs',
  },
});

ee.on('error', function (error) {
  if (error) {
    if (error.message.indexOf('does not exist') >= 0) {
      console.log('ok');
    }
  }
});
