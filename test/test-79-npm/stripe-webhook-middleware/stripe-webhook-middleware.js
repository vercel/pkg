'use strict';

var StripeWebhook = require('stripe-webhook-middleware');
var req = { headers: {}, body: { id: 'hello' } };
var res = {
  status: function () {
    return this;
  },
  end: function () {
    console.log('ok');
  },
};

var middleware = new StripeWebhook().middleware;
middleware(req, res, function () {});
