#!/usr/bin/env node

'use strict';

let s = 'console.log(\'test\');\n';

for (let i = 0; i < 100; i += 1) {
  s = 'setTimeout(function () {\n' + s + '}, 0);\n';
}

s = '#!/usr/bin/env node\n' +
    '/* eslint-disable indent */\n' +
    '\'use strict\';\n' + s;

require('fs').writeFileSync(
  'test-x-index.js', s
);
