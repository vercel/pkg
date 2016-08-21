let load = require('express-load');

let app = {};
app.get = function () {};
app.index = 'Welcome!';

let opts = {};
// opts.verbose = true;

load('controllers', opts).then('routes').into(app);

if (app.controllers.fixture &&
    app.routes.fixture) {
  console.log('ok');
}
