'use strict';

module.exports = {
  pkgConfig: {
    scripts: [
      'lib/appenders/*.js'
    ],
    patches: {
      'lib/appenders/hipchat.js': [
        'require(\'hipchat-client\')',
        'require(\'hipchat-client\', \'can-ignore\')',
        'require(\'hipchat-notifier\')',
        'require(\'hipchat-notifier\', \'can-ignore\')'
      ],
      'lib/appenders/hookio.js': [
        'require(\'hook.io\')',
        'require(\'hook.io\', \'can-ignore\')'
      ],
      'lib/appenders/loggly.js': [
        'require(\'loggly\')',
        'require(\'loggly\', \'can-ignore\')'
      ],
      'lib/appenders/mailgun.js': [
        'require(\'mailgun-js\')',
        'require(\'mailgun-js\', \'can-ignore\')'
      ],
      'lib/appenders/smtp.js': [
        'require("nodemailer")',
        'require("nodemailer", "can-ignore")'
      ],
      'lib/appenders/slack.js': [
        'require(\'slack-node\')',
        'require(\'slack-node\', \'can-ignore\')'
      ]
    }
  }
};
