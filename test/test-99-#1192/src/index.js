'use strict';

const http = require('http');
const path = require('path');
const express = require('express');

// Express app
const app = express();
// Express views
app.set('views', path.join(__dirname, '../public/views'));
// Use pug as Express view engine
app.set('view engine', 'pug');
// Match all routes
app.use('*', (_req, res) => {
  res.render('index.pug');
});

// Start HTTP server
const listener = http.createServer(app).listen(8080, () => {
  console.info('Server started, listening on %d', listener.address().port);
});

// ------------------ now query he server
(async () => {
  const options = {
    hostname: '127.0.0.1',
    path: '/',
    method: 'GET',
    port: 8080,
  };

  const req = http.request(options, (res) => {
    console.log(`statusCode: ${res.statusCode}`);
    res.on('data', (d) => {
      process.stdout.write(d);
    });
  });

  req.on('error', (error) => {
    console.error(error);
    process.exit(1);
  });
  req.on('close', () => {
    process.exit(0);
  });
  req.end();
})();
