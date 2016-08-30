'use strict';

module.exports = {
  pkgConfig: {
    scripts: [
      'lib/appenders/*.js'
    ],
    patches: {
      'lib/appenders/hipchat.js': [
        'require(\'hipchat-client\')',
        'require(\'hipchat-client\', \'may-exclude\')',
        'require(\'hipchat-notifier\')',
        'require(\'hipchat-notifier\', \'may-exclude\')'
      ],
      'lib/appenders/hookio.js': [
        'require(\'hook.io\')',
        'require(\'hook.io\', \'may-exclude\')'
      ],
      'lib/appenders/loggly.js': [
        'require(\'loggly\')',
        'require(\'loggly\', \'may-exclude\')'
      ],
      'lib/appenders/mailgun.js': [
        'require(\'mailgun-js\')',
        'require(\'mailgun-js\', \'may-exclude\')'
      ],
      'lib/appenders/smtp.js': [
        'require("nodemailer")',
        'require("nodemailer", "may-exclude")'
      ],
      'lib/appenders/slack.js': [
        'require(\'slack-node\')',
        'require(\'slack-node\', \'may-exclude\')'
      ]
    }
  }
};
