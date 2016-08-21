/* eslint-disable camelcase */
/* eslint-disable no-useless-concat */

let the_A = './test-y-resolve-A.js';
let the_B = './test-y-' + 'resolve-B.js';

require(the_A).toString();
require(the_B).toString();
