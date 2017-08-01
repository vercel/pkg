'use strict';

var fs = require('fs');
process.env.NEW_RELIC_APP_NAME = 'pkg-test';
process.env.NEW_RELIC_NO_CONFIG_FILE = true;
var Agent = require('newrelic/lib/agent.js');
Agent.prototype.start = function () {
  console.log('ok');
  fs.unlinkSync('newrelic_agent.log');
  process.exit();
};

require('newrelic');
