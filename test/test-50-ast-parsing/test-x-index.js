'use strict';

const fs = require('fs');
const detector = require('../../lib-es5/detector.js');
const body = fs.readFileSync('./test-y-data.txt', 'utf8');

detector.detect(body, function (node, trying) {
  let p;
  p = detector.visitorSuccessful(node, true);
  if (p) {
    if (trying) {
      console.log('try { ' + p + '; } catch (_) {}');
    } else {
      console.log(p + ';');
    }
    return false;
  }
  // TODO maybe NONLITERAL and USESCWD?
  return true;
});
