'use strict';

var stripe = require('stripe');
if (stripe.DEFAULT_HOST === 'api.stripe.com') {
  console.log('ok');
}
