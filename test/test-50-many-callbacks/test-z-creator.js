'use strict';

let s = "console.log('test');\n";

for (let i = 0; i < 100; i += 1) {
  s = 'setTimeout(function () {\n' + s + '}, 0);\n';
}

s = "'use strict';\n\n" + s;

require('fs').writeFileSync('test-x-index.js', s);
