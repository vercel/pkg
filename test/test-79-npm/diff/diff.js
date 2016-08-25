'use strict';

var jsdiff = require('diff');
var one = 'beep boop';
var other = 'beep boob blah';
var diff = jsdiff.diffChars(one, other);
var join = '';

diff.forEach(function (part) {
  var color = 'grey';
  if (part.added) color = 'green';
  if (part.removed) color = 'red';
  join += color + ':[' + part.value + ']';
});

if (join === 'grey:[beep boo]red:[p]green:[b blah]') {
  console.log('ok');
}
