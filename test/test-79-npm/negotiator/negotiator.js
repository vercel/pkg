let Negotiator = require('negotiator');
let availableMediaTypes = [ 'text/html', 'text/plain', 'application/json' ];
let request = { headers: { } };
let negotiator = new Negotiator(request);

let mt1 = negotiator.mediaTypes();
let mt2 = negotiator.mediaTypes(availableMediaTypes);
let mt3 = negotiator.mediaType(availableMediaTypes);

if (mt1.join('+') !== '*/*') return;
if (mt2.join('+') !== 'text/html+text/plain+application/json') return;
if (mt3 !== 'text/html') return;

console.log('ok');
