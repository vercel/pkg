'use strict';

var s = { o: 'o', k: 'k' };
var { o, ...other } = s;
console.log(o + other.k);
