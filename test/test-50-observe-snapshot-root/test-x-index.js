#!/usr/bin/env node

'use strict';

var fs = require('fs');
if (fs.statSync('/snapshot').isDirectory()) {
  console.log('ok');
}
