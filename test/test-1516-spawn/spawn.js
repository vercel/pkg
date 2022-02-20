'use strict';

const { join } = require('path');
const { readdirSync } = require('fs');
const { spawn: _spawn } = require('child_process');

function spawn(path) {
  return new Promise((resolve, reject) => {
    _spawn(path, [], { stdio: 'inherit', detached: false }).on(
      'exit',
      (code) => {
        if (code === 0) {
          return resolve();
        }

        reject(new Error(`${path} exited with code ${code}`));
      }
    );
  });
}

async function test() {
  let filename = 'test.sh';
  if (process.platform === 'win32') {
    filename = 'test.bat';
  }

  const files = readdirSync(join(__dirname, 'files'));
  for (const file of ['test.sh', 'test.bat']) {
    if (!files.includes(file)) {
      throw new Error('Missing file in snapshot');
    }
  }

  await spawn(join(__dirname, 'files', filename));
}

test().catch(console.error);
