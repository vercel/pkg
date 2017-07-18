/* eslint-disable no-useless-concat */

'use strict';

var thePJ = './package' + '.json';
console.log(require(thePJ).data);
