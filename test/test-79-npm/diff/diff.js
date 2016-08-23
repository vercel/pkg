'use strict';

let jsdiff = require('diff');
let one = 'beep boop';
let other = 'beep boob blah';
let diff = jsdiff.diffChars(one, other);
let join = '';

diff.forEach(function (part) {
  let color = 'grey';
  if (part.added) color = 'green';
  if (part.removed) color = 'red';
  join += color + ':[' + part.value + ']';
});

if (join === 'grey:[beep boo]red:[p]green:[b blah]') {
  console.log('ok');
}
