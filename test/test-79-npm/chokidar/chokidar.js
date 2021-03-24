'use strict';

var chokidar = require('chokidar');

var watcher = chokidar.watch('./chokidar.js', {
  persistent: true,
});

watcher.on('ready', function () {
  console.log('ok');
  process.exit();
});
