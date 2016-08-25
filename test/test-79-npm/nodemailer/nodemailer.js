'use strict';

var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport('smtps://user%40gmail.com:pass@smtp.gmail.com');
if (transporter.transporter) {
  console.log('ok');
}
