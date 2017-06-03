#!/usr/bin/env node

/* eslint-disable complexity */

'use strict';

const UPM = false; // USE_PREINSTALLED_MODULES

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const globby = require('globby');
const utils = require('../utils.js');

assert(!module.parent);
assert(__dirname === process.cwd());

const host = 'node' + process.version[1];
const target = process.argv[2] || host;
const windows = process.platform === 'win32';
const npm = { 0: 2, 4: 2, 6: 3, 7: 4, 8: 5 }[
  process.version.match(/^(node|v)?(\d+)/)[2] | 0];
assert(npm !== undefined);

function applyMetaToRight (right, meta) {
  right = (meta.take === 'stderr' ? right.stderr : right.stdout);
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

function save () {
  const t = utils.stringify(table, undefined, 2);
  let c = utils.stringify(changes, undefined, 2);
  if (c === '[]') c = '[\n]';
  fs.writeFileSync('checklist.js',
    '/* eslint-disable no-unused-vars */\n' +
    '/* eslint-disable quotes */\n' +
    '\n' +
    '\'use strict\';\n' +
    '\n' +
    'const table = ' + t + ';\n' +
    'const changes = ' + c + ';\n'
  );
}

function stamp2string (s) {
  // platform, arch, modules
  return s.p + '/' + s.a + '/m' + s.m.toString();
}

function update (p, r, v, note) {
  if (!table[p]) table[p] = {};
  const row = table[p];
  const ss = stamp2string(stamp);
  const o = row[ss];
  const rv = r + (v ? (',' + v) : '');
  const rn = r + (note ? (',' + note) : '');
  row[ss] = rv + (note ? (',' + note) : '');
  const o2 = o ? o.split(',')[0] : undefined;
  if ((!o) && (r !== 'ok')) {
    changes.push(p + ',' + ss + ': new ' + rn);
  } else
  if ((o2 !== undefined) && (o2 !== r)) {
    changes.push(p + ',' + ss + ': ' + o + ' -> ' + rn);
  }
  save();
}

if (!UPM) {
  console.log('Cleaning cache...');

  if (windows) {
    utils.vacuum.sync(path.join(
      process.env.APPDATA, 'npm-cache'
    ));
    utils.mkdirp.sync(path.join(
      process.env.APPDATA, 'npm-cache'
    ));
  } else {
    if (npm >= 5) {
      utils.exec.sync(
        'npm cache clean --force'
      );
    } else {
      utils.exec.sync(
        'npm cache clean'
      );
    }
  }

  utils.mkdirp.sync('_isolator');
}

(function () {
  console.log('Getting stamp...');

  const input = path.resolve('stamp.js');
  const lucky = path.basename(input).slice(0, -3);
  const output = path.join('_isolator', lucky + '.exe');

  utils.pkg.sync([
    '--target', target,
    '--output', output, input
  ]);

  stamp = utils.spawn.sync(
    output
  );

  stamp = JSON.parse(stamp);
  utils.vacuum.sync(output);
  console.log('Stamp is ' + JSON.stringify(stamp));
  console.log('Waiting...');
  utils.pause(5);
}());

const dickies = globby.sync([
  './*/*.js',
  '!./*/*.config.js',
  '!./*/*.meta.js',
  '!./*/gulpfile.js',
  '!./*/*fixture*'
]);

dickies.some(function (dicky) {
  const input = path.resolve(dicky);

  const foldy = path.dirname(input);
  const foldyName = path.basename(foldy);

  const packy = path.basename(input).slice(0, -3);
  const packyName = packy.split('@')[0];
  const packyWildcard = packy.split('@')[1];

  let wordy = packy;
  if (packyName !== foldyName) {
    wordy = foldyName + '/' + wordy;
  }

  const output = path.join('_isolator', packy + '.exe');

  console.log();
  console.log('*********************************************************');
  console.log('*********************************************************');
  console.log('*********************************************************');

  console.log('Testing ' + wordy + '...');

  let metajs = path.join(foldy, packy + '.meta.js');
  metajs = fs.existsSync(metajs) ? require(metajs) : undefined;

  let meta;

  if (metajs) {
    meta = metajs(stamp);
  } else {
    meta = {};
  }

  const ci = meta.ci;

  if (ci === 'skip' && process.env.CI) {
    console.log(wordy + ' is skipped in CI!');
    return;
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
    console.log(wordy + ' not allowed here!');
    if (note) console.log('Note:', note);
    return;
  }

  let version = '';

  if (!UPM) {
    const build = meta.build;
    const earth = packy.replace('-shy', '');
    const moons = meta.moons || [];
    let planets = moons.concat([ earth ]);
    assert(planets.length > 0);
    planets = planets.join(' ');
    console.log('Installing ' + planets + '...');
    let successful = false;
    let counter = 10;
    while ((!successful) && (counter > 0)) {
      successful = true;
      let command = 'npm install ' + planets;
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

    const packyVersion = JSON.parse(fs.readFileSync(
      path.join(foldy, 'node_modules', earth.split('@')[0], 'package.json'), 'utf8'
    )).version;

    console.log('Version of ' + packy + ' is ' + packyVersion);
    version = packyVersion;

    if (packyWildcard) {
      assert.equal(packyWildcard.split('.').length, 3);
      assert.equal(packyVersion, packyWildcard);
    }
  }

  let right;

  console.log('Running non-compiled ' + wordy + '...');

  try {
    right = utils.spawn.sync(
      'node', [ input ],
      { cwd: path.dirname(input),
        stdio: 'pipe' }
    );
  } catch (___) {
    right = {
      stdout: '',
      stderr: ___.toString()
    };
  }

  right = applyMetaToRight(right, meta);

  console.log('Result is \'' + right + '\'');

  if (right !== 'ok') {
    update(wordy, 'bad-test', version, note);
  } else {
    console.log('Compiling ' + wordy + '...');

    let config = path.join(foldy, packy + '.config.js');
    config = fs.existsSync(config) ? [ '--config', config ] : [];

    utils.pkg.sync([
      '--target', target,
      '--output', output, input
    ].concat(config));

    console.log('Copying addons...');

    const addons = globby.sync(
      path.join(foldy, 'node_modules', '**', '*.node')
    );

    addons.some(function (addon) {
      fs.writeFileSync(
        path.join(path.dirname(output), path.basename(addon)),
        fs.readFileSync(addon)
      );
    });

    console.log('Running compiled ' + wordy + '...');

    try {
      right = utils.spawn.sync(
        './' + path.basename(output), [],
        { cwd: path.dirname(output),
          stdio: 'pipe' }
      );
    } catch (___) {
      right = {
        stdout: '',
        stderr: ___.toString()
      };
    }

    right = applyMetaToRight(right, meta);
    console.log('Result is \'' + right + '\'');

    if (right !== 'ok') {
      update(wordy, 'error', version, note);
    } else {
      update(wordy, 'ok', version);
    }
  }

  const rubbishes = globby.sync(
    path.join(path.dirname(output), '**', '*')
  );

  rubbishes.some(function (rubbish) {
    utils.vacuum.sync(rubbish);
  });

  if (!UPM) {
    console.log('Cleanup...');
    utils.vacuum.sync(path.join(foldy, 'node_modules'));
  }
});

console.log(
  '\nChanges:\n' +
  changes.join('\n') +
  '\n'
);
