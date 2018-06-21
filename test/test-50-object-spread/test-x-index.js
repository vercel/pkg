'use strict';

var s = { o: 'o', k: 'k' };
var { o, ...other } = s;
var fn = ({ x, ...y }) => x(y.value);

fn({ x: console.log, value: o + other.k });
