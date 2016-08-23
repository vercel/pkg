#!/usr/bin/env node

/* eslint-disable no-process-env */

'use strict';

let UPM = false; // USE_PREINSTALLED_MODULES

let fs = require('fs');
let path = require('path');
let assert = require('assert');
let globby = require('globby');
let utils = require('../../utils.js');
let enclose = require('../../').exec;

assert(!module.parent);
assert(__dirname === process.cwd());

let flags = process.argv.slice(2);
let windows = process.platform === 'win32';

function applyMetaToRight (right, meta) {
  right = (meta.take === 'stderr' ? right.stderr : right.stdout);
  if (meta.take === 'last-line') right = right.split('\n').slice(-2).join('\n');
  if (right.slice(-2) === '\r\n') right = right.slice(0, -2);
  if (right.slice(-1) === '\n') right = right.slice(0, -1);
  return right;
}

let stamp = {};

let checklist = fs.readFileSync('checklist.js', 'utf-8');
let table = checklist.split('var table = ')[1].split(';')[0];
table = JSON.parse(table);
let changes = checklist.split('var changes = ')[1].split(';')[0];
changes = JSON.parse(changes);

function save () {
  let t = utils.stringify(table, null, 2);
  let c = utils.stringify(changes, null, 2);
  if (c === '[]') c = '[\n]';
  fs.writeFileSync('checklist.js',
    '/* eslint-disable no-unused-vars */\n' +
    '"use strict";\n' +
    'var table = ' + t + ';\n' +
    'var changes = ' + c + ';\n'
  );
}

function stamp2string (s) {
  // platform, arch, modules
  return s.p + '/' + s.a + '/m' + s.m.toString();
}

function update (p, n) {
  if (!table[p]) table[p] = {};
  let row = table[p];
  let ss = stamp2string(stamp);
  let o = row[ss];
  row[ss] = n;
  let nr = n.split(',')[0];
  let or = o ? o.split(',')[0] : '';
  if ((!o) && (nr !== 'ok')) {
    changes.push(p + ',' + ss + ': new ' + n);
  } else
  if ((or !== nr) && (nr !== 'ok')) {
    changes.push(p + ',' + ss + ': ' + o + ' -> ' + n);
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
    utils.exec.sync(
      'npm cache clean'
    );
  }

  utils.mkdirp.sync('z-isolator');

}

(function () {

  console.log('Getting stamp...');

  let input = path.resolve('stamp.js');
  let lucky = path.basename(input).slice(0, -3);
  let output = path.join('z-isolator', lucky + '.exe');

  enclose.sync(flags.concat([
    '--output', output, input
  ]));

  stamp = utils.spawn.sync(
    output
  );

  stamp = JSON.parse(stamp);
  utils.vacuum.sync(output);
  console.log('Stamp is ' + JSON.stringify(stamp));
  console.log('Waiting...');
  utils.pause(5);

}());

let dickies = globby.sync([
  './*/*.js',
  '!./*/*.config.js',
  '!./*/*.meta.js',
  '!./*/gulpfile.js',
  '!./*/*fixture*'
]);

dickies.some(function (dicky) {

  let input = path.resolve(dicky);

  let foldy = path.dirname(input);
  let foldyName = path.basename(foldy);

  let packy = path.basename(input).slice(0, -3);
  let packyName = packy.split('@')[0];
  let packyWildcard = packy.split('@')[1];

  let wordy = packy;
  if (packyName !== foldyName) {
    wordy = foldyName + '/' + wordy;
  }

  let output = path.join('z-isolator', packy + '.exe');

  console.log();
  console.log('*********************************************************');
  console.log('*********************************************************');
  console.log('*********************************************************');

  console.log('Testing ' + wordy + '...');

  let metajs = path.join(foldy, packy + '.meta.js');
  metajs = fs.existsSync(metajs) ? require(metajs) : null;

  let meta;

  if (metajs) {
    meta = metajs(stamp);
  } else {
    meta = {};
  }

  let allow;

  if (typeof meta.allow !== 'undefined') {
    allow = meta.allow;
  } else {
    allow = true;
  }

  if (!allow) {

    update(wordy, 'nop');
    console.log(wordy + ' not allowed here!');
    return;

  }

  let version = '';

  if (!UPM) {

    let build = meta.build;
    let earth = packy.replace('-shy', '');
    let moons = meta.moons || [];
    let planets = moons.concat([ earth ]);
    assert(planets.length > 0);
    planets.some(function (planet) {
      console.log('Installing ' + planet + '...');
      let successful = false, counter = 10;
      while ((!successful) && (counter > 0)) {
        successful = true;
        try {
          let command = 'npm install ' + planet;
          if (build) command += ' --build-from-source=' + build;
          command += ' --unsafe-perm';
          utils.exec.sync(command, { cwd: foldy });
        } catch (__) {
          assert(__);
          utils.vacuum.sync(path.join(foldy, 'node_modules'));
          successful = false;
          counter -= 1;
        }
      }
    });

    let packyVersion = JSON.parse(fs.readFileSync(
      path.join(foldy, 'node_modules', earth.split('@')[0], 'package.json'), 'utf8'
    )).version;

    console.log('Version of ' + packy + ' is ' + packyVersion);
    version = ',' + packyVersion;

    if (packyWildcard) {
      assert.equal(packyWildcard.split('.').length, 3);
      assert.equal(packyVersion, packyWildcard);
    }

  }

  let right;

  console.log('Running non-enclosed ' + wordy + '...');

  try {
    right = utils.spawn.sync(
      'node', [ input ],
      { cwd: path.dirname(input),
        stdio: 'super-pipe' }
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
    update(wordy, 'error' + version);
  } else {

    console.log('Compiling ' + wordy + '...');

    let config = path.join(foldy, packy + '.config.js');
    config = fs.existsSync(config) ? [ '--config', config ] : [];

    enclose.sync(flags.concat([
      '--output', output, input
    ]).concat(config));

    console.log('Copying addons...');

    let addons = globby.sync(
      path.join(foldy, 'node_modules', '**', '*.node')
    );

    addons.some(function (addon) {
      fs.writeFileSync(
        path.join(path.dirname(output), path.basename(addon)),
        fs.readFileSync(addon)
      );
    });

    console.log('Running enclosed ' + wordy + '...');

    try {
      right = utils.spawn.sync(
        './' + path.basename(output), [],
        { cwd: path.dirname(output),
          stdio: 'super-pipe' }
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
      update(wordy, 'error' + version);
    } else {
      update(wordy, 'ok' + version);
    }

  }

  let rubbishes = globby.sync(
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
