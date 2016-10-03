/* eslint-disable no-useless-concat */

'use strict';

var theA = './test-y-resolve-A.js';
var theB = './test-y-' + 'resolve-B.js';

require(theA).toString();
require(theB).toString();
