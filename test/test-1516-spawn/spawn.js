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
  const isWindows = process.platform === 'win32';

  let args = [];
  let filename = 'test.sh';
  if (isWindows) {
    filename = 'cmd.exe';
    args = ['/c', 'test.bat'];
  }

  const dir = join(__dirname, 'files');
  const files = readdirSync(dir);
  for (const file of ['test.sh', 'test.bat']) {
    if (!files.includes(file)) {
      throw new Error('Missing file in snapshot');
    }
  }

  const path = join(isWindows ? '' : dir, filename);
  spawnSync(path, args, { stdio: 'inherit', detached: false });
  await spawn(path, args, { stdio: 'inherit', detached: false });

  execFileSync(path, args, { stdio: 'inherit', detached: false });
  await execFile(path, args, { stdio: 'inherit', detached: false });

  if (isWindows) {
    await spawn(join(dir, 'test.bat'), [], { stdio: 'inherit', shell: true });
  }
}

test().catch(console.error);
