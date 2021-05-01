'use strict';

const fs = require('fs');
const { nodesets } = require('node-opcua-nodesets');
const a = fs.readFileSync(nodesets.adi);
console.log(a.length);
