#!/usr/bin/env node

/* eslint-disable complexity */

'use strict';

// note: you can set the env variable USE_PREINSTALLED_MODULES to prevent reconstruction
//       of the npm cache folder.
const UPM = process.env.USE_PREINSTALLED_MODULES || false; // USE_PREINSTALLED_MODULES

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const globby = require('globby');
const utils = require('../utils.js');

assert(!module.parent);
assert(__dirname === process.cwd());

const hostVersion = process.version.match(/^v(\d+)/)[1];
const host = 'node' + hostVersion;
const target = process.argv[2] || host;
const windows = process.platform === 'win32';
const npm = { 0: 2, 4: 2, 6: 3, 7: 4, 8: 5, 9: 5, 10: 5, 12: 6, 14: 6, 16: 7 }[
  hostVersion
];
assert(npm !== undefined);

function applyMetaToRight(right, meta) {
  right = meta.take === 'stderr' ? right.stderr : right.stdout;
  if (meta.take === 'last-line') right = right.split('\n').slice(-2).join('\n');
  if (right.slice(-2) === '\r\n') right = right.slice(0, -2);
  if (right.slice(-1) === '\n') right = right.slice(0, -1);
  return right;
}

let stamp = {};

const checklist = fs.readFileSync('checklist.js', 'utf-8');
let table = checklist.split('const table = ')[1].split(';')[0];
table = JSON.parse(table);
let changes = checklist.split('const changes = ')[1].split(';')[0];
changes = JSON.parse(changes);

function save() {
  const t = utils.stringify(table, undefined, 2);
  let c = utils.stringify(changes, undefined, 2);
  if (c === '[]') c = '[\n]';
  fs.writeFileSync(
    'checklist.js',
    '/* eslint-disable no-unused-vars */\n' +
      '/* eslint-disable quotes */\n' +
      '\n' +
      "'use strict';\n" +
      '\n' +
      'const table = ' +
      t +
      ';\n' +
      'const changes = ' +
      c +
      ';\n'
  );
}

function stamp2string(s) {
  // platform, arch, modules
  return s.p + '/' + s.a + '/m' + s.m.toString();
}

function update(p, r, v, note) {
  if (!table[p]) table[p] = {};
  const row = table[p];
  const ss = stamp2string(stamp);
  const o = row[ss];
  const rv = r + (v ? ',' + v : '');
  const rn = r + (note ? ',' + note : '');
  row[ss] = rv + (note ? ',' + note : '');
  const o2 = o ? o.split(',')[0] : undefined;
  if (!o && r !== 'ok') {
    changes.push(p + ',' + ss + ': new ' + rn);
  } else if (o2 !== undefined && o2 !== r) {
    changes.push(p + ',' + ss + ': ' + o + ' -> ' + rn);
  }
  save();
}

if (!UPM) {
  console.log('Cleaning cache...');

  if (windows) {
    utils.vacuum.sync(path.join(process.env.APPDATA, 'npm-cache'));
    utils.mkdirp.sync(path.join(process.env.APPDATA, 'npm-cache'));
  } else {
    if (npm >= 5) {
      utils.exec.sync('npm cache clean --force');
    } else {
      utils.exec.sync('npm cache clean');
    }
  }

  utils.mkdirp.sync('_isolator');
}

(function () {
  console.log('Getting stamp...');

  const input = path.resolve('stamp.js');
  const lucky = path.basename(input).slice(0, -3);
  const output = path.resolve('_isolator', lucky + '.exe');

  utils.pkg.sync(['--target', target, '--output', output, input]);

  stamp = utils.spawn.sync(output);

  stamp = JSON.parse(stamp);
  utils.vacuum.sync(output);
  console.log('Stamp is ' + JSON.stringify(stamp));
  utils.pause(2);
})();

// note to developpers:
// you can set the  env variable FILTER to something like "better-sqlite3/*.js"
// to restrict this test to this single test case
const inputs = globby
  .sync([
    process.env.FILTER || './*/*.js',
    '!./*/*.config.js',
    '!./*/*.meta.js',
    '!./*/gulpfile.js',
    '!./*/*fixture*',
  ])
  .map(function (result) {
    return path.resolve(result);
  });

let times = {};
const ci = process.env.CI;

if (ci) {
  console.log('Getting latest times...');

  const foldyNames = inputs.map(function (input) {
    const foldy = path.dirname(input);
    const foldyName = path.basename(foldy);
    return foldyName;
  });

  times = JSON.parse(utils.exec.sync('node times.js ' + foldyNames.join()));
}

inputs.some(function (input) {
  const foldy = path.dirname(input);
  const foldyName = path.basename(foldy);

  const packy = path.basename(input).slice(0, -3);
  const packyName = packy.split('@')[0];
  const packyWildcard = packy.split('@')[1];

  let wordy = packy;
  if (packyName !== foldyName) {
    wordy = foldyName + '/' + wordy;
  }

  const output = path.resolve('_isolator', packy + '.exe');

  console.log();
  console.log('*********************************************************');
  console.log('*********************************************************');
  console.log('*********************************************************');

  console.log('Testing ' + wordy + '...');

  if (ci) {
    const latestTime = times[foldyName];
    if (latestTime) {
      const diff = Date.now() - latestTime;
      const days = (diff / 1000 / 60 / 60 / 24) | 0;
      if (days >= 360) {
        // no need to pollute changes with this
        // update(wordy, 'nop', '', 'abandoned');
        console.log('Last published ' + days + ' days ago!');
        return;
      }
    }
  }

  const flags = { ci };
  let metajs = path.join(foldy, packy + '.meta.js');
  metajs = fs.existsSync(metajs) ? require(metajs) : undefined;

  let meta;

  if (metajs) {
    meta = metajs(stamp, flags) || {};
  } else {
    meta = {};
  }

  let allow;

  if (typeof meta.allow !== 'undefined') {
    allow = meta.allow;
  } else {
    allow = true;
  }

  const note = meta.note;

  if (!allow) {
    update(wordy, 'nop', '', note);
    console.log('Not allowed here!');
    if (note) console.log('Note:', note);
    return;
  }

  let version = '';

  if (!UPM) {
    const build = meta.build;
    const packages = [packy].concat(meta.packages || []);
    console.log('Installing ' + packages + '...');
    let successful = false;
    let counter = 10;
    while (!successful && counter > 0) {
      successful = true;
      let command = 'npm install ' + packages.join(' ');
      if (npm >= 5) command += ' --no-save';
      if (build) command += ' --build-from-source=' + build;
      command += ' --unsafe-perm';
      try {
        utils.exec.sync(command, { cwd: foldy });
      } catch (__) {
        assert(__);
        utils.vacuum.sync(path.join(foldy, 'node_modules'));
        successful = false;
        counter -= 1;
      }
    }

    let packyVersion;

    try {
      packyVersion = JSON.parse(
        fs.readFileSync(
          path.join(foldy, 'node_modules', packy.split('@')[0], 'package.json'),
          'utf8'
        )
      ).version;
    } catch (___) {
      update(wordy, 'bad-npm-i', '', note);
      console.log(wordy + ' failed to install here!');
      if (note) console.log('Note:', note);
      return;
    }

    console.log('Version of ' + packy + ' is ' + packyVersion);
    version = packyVersion;

    if (packyWildcard) {
      assert.strictEqual(packyWildcard.split('.').length, 3);
      assert.strictEqual(packyVersion, packyWildcard);
    }
  }

  let right;

  console.log('Running non-compiled ' + wordy + '...');

  try {
    right = utils.spawn.sync('node', [input], {
      cwd: path.dirname(input),
      stdio: 'pipe',
    });
  } catch (___) {
    right = {
      stdout: '',
      stderr: ___.toString(),
    };
  }

  right = applyMetaToRight(right, meta);

  console.log("Result is '" + right + "'");

  if (right !== 'ok') {
    update(wordy, 'bad-test', version, note);
  } else {
    console.log('Compiling ' + wordy + '...');
    const config = path.join(foldy, packy + '.config.json');

    if (fs.existsSync(config)) {
      const bin = JSON.parse(fs.readFileSync(config)).bin;
      assert.strictEqual(path.join(foldy, bin), input);
      input = config;
    }

    utils.pkg.sync(['--target', target, '--output', output, input]);

    console.log('Copying addons...');

    const deployFiles = [];

    if (!meta.deployFiles && !meta.deployFilesFrom) {
      globby
        .sync(path.join(foldy, 'node_modules', '**', '*.node'))
        .some(function (deployFrom) {
          deployFiles.push([
            deployFrom,
            path.join(path.dirname(output), path.basename(deployFrom)),
          ]);
        });
    }

    const deployFilesRelative = [];

    if (meta.deployFiles) {
      meta.deployFiles.some(function (deployFile) {
        deployFilesRelative.push(deployFile);
      });
    }

    if (meta.deployFilesFrom) {
      meta.deployFilesFrom.some(function (dictName) {
        const dict = require('../../dictionary/' + dictName);
        dict.pkg.deployFiles.some(function (deployFile) {
          const deployFrom = 'node_modules/' + dictName + '/' + deployFile[0];
          const deployTo = deployFile[1];
          deployFilesRelative.push([deployFrom, deployTo]);
        });
      });
    }

    deployFilesRelative.some(function (deployFile) {
      let deployFrom;
      let deployTo;

      if (Array.isArray(deployFile)) {
        deployFrom = deployFile[0];
        deployTo = deployFile[1];
      } else {
        deployFrom = deployFile;
        deployTo = deployFile;
      }

      // whole directory supported, glob not
      assert(deployFrom.indexOf('*') < 0);
      assert(deployTo.indexOf('*') < 0);

      deployFrom = path.join(foldy, deployFrom);
      deployTo = path.join(path.dirname(output), deployTo);

      if (fs.existsSync(deployFrom)) {
        const statFrom = fs.statSync(deployFrom);
        if (statFrom.isFile()) {
          deployFiles.push([deployFrom, deployTo]);
        } else {
          globby
            .sync(path.join(deployFrom, '**', '*'))
            .some(function (deployFrom2) {
              const r = path.relative(deployFrom, deployFrom2);
              const deployTo2 = path.join(deployTo, r);
              if (fs.existsSync(deployFrom2)) {
                const statFrom2 = fs.statSync(deployFrom2);
                if (statFrom2.isFile()) {
                  deployFiles.push([deployFrom2, deployTo2]);
                }
              }
            });
        }
      }
    });

    deployFiles.some(function (deployFile) {
      const deployFrom = deployFile[0];
      const deployTo = deployFile[1];
      const statFrom = fs.statSync(deployFrom);
      utils.mkdirp.sync(path.dirname(deployTo));
      fs.writeFileSync(deployTo, fs.readFileSync(deployFrom));
      fs.chmodSync(deployTo, statFrom.mode.toString(8).slice(-3));
    });

    console.log('Running compiled ' + wordy + '...');

    try {
      right = utils.spawn.sync('./' + path.basename(output), [], {
        cwd: path.dirname(output),
        stdio: 'pipe',
      });
    } catch (___) {
      right = {
        stdout: '',
        stderr: ___.toString(),
      };
    }

    right = applyMetaToRight(right, meta);
    console.log("Result is '" + right + "'");

    if (right !== 'ok') {
      update(wordy, 'error', version, note);
    } else {
      update(wordy, 'ok', version);
    }
  }

  const rubbishes = globby.sync(path.join(path.dirname(output), '**', '*'));

  rubbishes.some(function (rubbish) {
    utils.vacuum.sync(rubbish);
  });

  if (!UPM) {
    console.log('Cleanup...');
    utils.vacuum.sync(path.join(foldy, 'node_modules'));
  }
});

console.log('\nChanges:\n' + changes.join('\n') + '\n');
