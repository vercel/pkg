'use strict';

let StripeWebhook = require('stripe-webhook-middleware');
let req = { headers: { }, body: { id: 'hello' } };
let res = { status: function () {
  return this;
}, end: function () {
  console.log('ok');
} };

let middleware = (new StripeWebhook()).middleware;
middleware(req, res, function () {});
