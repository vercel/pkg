'use strict';

var path = require('path');
var async = 'async';
var config = 'config';
var i = 0;

require(/**/ async /**/);
require(/**/ async.toString() /**/);
require(/**/ async.toString('utf8') /**/);
require(/**/ path.resolve(process.cwd(), config) /**/);
require(/**/ async.slice().toString('utf8') /**/);
require(/**/ async.slice(0).toString('utf8') /**/);
require(/**/ async.slice(1.5).toString('utf8') /**/);

require(/**/ async + '.js' /**/);
require(/**/ async + 75.25 /**/);
require(/**/ __dirname + '/' + async /**/); // eslint-disable-line no-path-concat
require(/**/ __dirname + '/' + async + 35.5 /**/); // eslint-disable-line no-path-concat

require(/**/ [async, 'js'].join('.') /**/);
// TODO require({ async: "js" }.join("."));

require(/**/ async[0] /**/);
require(/**/ async[i] /**/);
require(/**/ process.env.LATER_COV ? './later-cov' : './later' /**/);
path.resolve(/**/ '123' /**/);
path.resolve(/**/ '123', '456' /**/);
