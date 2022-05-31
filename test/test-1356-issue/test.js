#!/usr/bin/env node

'use strict';

const readline = require('readline');
const { spawn } = require('child_process');

const spawnSelf = function (args = []) {
  return new Promise((resolve, reject) => {
    try {
      let worker;
      if (args) {
        // child_process.fork(modulePath, args)
        worker = spawn(process.execPath, args, {
          env: {
            IS_CHILD: 'true',
          },
        });
      } else {
        // child_process.fork(modulePath, options])
        worker = spawn(process.execPath, {
          env: {
            IS_CHILD: 'true',
          },
        });
      }
      let stderr = '';
      worker.on('error', reject);
      worker.on('exit', (code) => {
        if (stderr) {
          return reject(new Error(stderr.trim()));
        }
        return resolve(`Exit code ${code}`);
      });
      const lineParser = readline.createInterface({ input: worker.stdout });
      const stderrParser = readline.createInterface({ input: worker.stderr });
      stderrParser.on('line', (line) => {
        stderr += `${line.toString().trim()}\n`;
      });
      lineParser.on('line', (line) => {
        console.log(line);
      });
    } catch (error) {
      return reject(error);
    }
  });
};

const test = async function () {
  if (process.env.IS_CHILD) {
    console.log('CHILD SPAWNED SUCCESS');
    process.exit(0);
  }

  // https://nodejs.org/dist/latest-v16.x/docs/api/child_process.html#child_processforkmodulepath-args-options
  await spawnSelf(['arg1', 'arg2']); // args
  await spawnSelf([]); // empty arg
  await spawnSelf(null); // no arg
};
test().catch(console.error);
