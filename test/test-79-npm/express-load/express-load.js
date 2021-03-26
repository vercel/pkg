'use strict';

var load = require('express-load');

var app = {};
app.get = function () {};
app.index = 'Welcome!';

var opts = {};
// opts.verbose = true;

load('controllers', opts).then('routes').into(app);

if (app.controllers.fixture && app.routes.fixture) {
  console.log('ok');
}
