'use strict';

let chokidar = require('chokidar');

let watcher = chokidar.watch('./chokidar.js', {
  persistent: true
});

watcher.on('ready', function () {
  console.log('ok');
  process.exit();
});
