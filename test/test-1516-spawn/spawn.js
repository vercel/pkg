'use strict';

const { join } = require('path');
const { readdirSync } = require('fs');
const {
  spawn: _spawn,
  spawnSync,
  execFile: _execFile,
  execFileSync,
} = require('child_process');

function spawn(path, args, opts) {
  return new Promise((resolve, reject) => {
    _spawn(path, args, opts)
      .on('error', console.error)
      .on('exit', (code) => {
        if (code === 0) {
          return resolve();
        }

        reject(new Error(`${path} exited with code ${code}`));
      });
  });
}

function execFile(path, args, opts) {
  return new Promise((resolve, reject) => {
    _execFile(path, args, opts, (err) => {
      if (err) {
        return reject(err);
      }

      resolve();
    });
  });
}

async function test() {
  let filename = 'test.sh';
  if (process.platform === 'win32') {
    filename = 'test.bat';
  }

  const dir = join(__dirname, 'files');
  const files = readdirSync(dir);
  console.log(files.join(', '));

  for (const file of ['test.sh', 'test.bat']) {
    if (!files.includes(file)) {
      throw new Error('Missing file in snapshot');
    }
  }

  const path = join(dir, filename);
  spawnSync(path, [], { stdio: 'inherit', detached: false });
  await spawn(path, [], { stdio: 'inherit', detached: false });

  execFileSync(path, [], { stdio: 'inherit', detached: false });
  await execFile(path, [], { stdio: 'inherit', detached: false });
}

test().catch(console.error);
