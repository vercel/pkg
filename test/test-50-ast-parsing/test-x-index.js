#!/usr/bin/env node

'use strict';

let fs = require('fs');
let detector = require('../../lib/detector.js');
let body = fs.readFileSync('./test-y-data.txt', 'utf8');

detector.detect(
  body,
  function (node, trying) {
    let p;
    p = detector.visitor_SUCCESSFUL(node, true);
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
  }
);
