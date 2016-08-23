#!/usr/bin/env node

/* eslint-disable camelcase */

'use strict';

require('node-thrust')(function (error, api) {
  if (error) throw error;
  let w = api.window({
    root_url: 'http://enclosejs.com'
  });
  w.on('closed', function () {
    process.exit();
  });
  w.show();
}, {
  exec_path: process.platform === 'darwin'
    ? './node_modules/node-thrust/vendor/thrust/ThrustShell.app/Contents/MacOS/ThrustShell'
    : './node_modules/node-thrust/vendor/thrust/thrust_shell'
});
