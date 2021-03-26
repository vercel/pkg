'use strict';

var Negotiator = require('negotiator');
var availableMediaTypes = ['text/html', 'text/plain', 'application/json'];
var request = { headers: {} };
var negotiator = new Negotiator(request);

var mt1 = negotiator.mediaTypes();
var mt2 = negotiator.mediaTypes(availableMediaTypes);
var mt3 = negotiator.mediaType(availableMediaTypes);

if (mt1.join('+') !== '*/*') return;
if (mt2.join('+') !== 'text/html+text/plain+application/json') return;
if (mt3 !== 'text/html') return;

console.log('ok');
