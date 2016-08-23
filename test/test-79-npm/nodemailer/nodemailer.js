'use strict';

let nodemailer = require('nodemailer');
let transporter = nodemailer.createTransport('smtps://user%40gmail.com:pass@smtp.gmail.com');
if (transporter.transporter) {
  console.log('ok');
}
