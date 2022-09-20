'use strict';

let s =
  'function EventEmitter () {\n' +
  '  this.listeners = [];\n' +
  '}\n' +
  'EventEmitter.prototype.on = function (name, listener) {\n' +
  '  this.listeners.push(listener);\n' +
  '};\n' +
  'EventEmitter.prototype.emit = function (name, data) {\n' +
  '  this.listeners.some((listener) => {\n' +
  '    listener(data);\n' +
  '  });\n' +
  '};\n' +
  'const ee = new EventEmitter();\n';

for (let i = 0; i < 140; i += 1) {
  s += "ee.on('message', (data) => {\n  console.log(data);\n});\n";
}

s += "ee.emit('message', 'hooray');\n";

s = "'use strict';\n\n" + s;

require('fs').writeFileSync('test-x-index.js', s);
