'use strict';

const title = 'some-custom-title';
const assert = require('assert');

if (process.argv.indexOf('child') !== -1) {
  child();
} else {
  parent();
}

function parent() {
  const cp = require('child_process');
  cp.fork(__filename, ['child'], {
    execArgv: ['--title', title],
  }).on('exit', (code) => {
    process.exit(typeof code === 'number' ? code : 1);
  });
  setTimeout(process.exit, 5000, 1);
}

function child() {
  assert(
    process.env.NODE_OPTIONS.includes('--max-old-space-size=777'),
    'main.js should have set NODE_OPTIONS=--max-old-space-size=777 and it should trickle down here.\n' +
      `process.env.NODE_OPTIONS: ${JSON.stringify(process.env.NODE_OPTIONS)}`
  );
  assert(
    process.title === title,
    `process.title should be set by the parent through execArgv when forking (got ${process.title})`
  );
}
