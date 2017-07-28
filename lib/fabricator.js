import { log } from './log.js';
import { spawn } from 'child_process';

const script = `
  var vm = require('vm');
  var module = require('module');
  var stdin = new Buffer(0);
  process.stdin.on('data', function (data) {
    stdin = Buffer.concat([ stdin, data ]);
    if (stdin.length >= 4) {
      var sizeOfSnap = stdin.readInt32LE(0);
      if (stdin.length >= 4 + sizeOfSnap + 4) {
        var sizeOfBody = stdin.readInt32LE(4 + sizeOfSnap);
        if (stdin.length >= 4 + sizeOfSnap + 4 + sizeOfBody) {
          var snap = stdin.toString('utf8', 4, 4 + sizeOfSnap);
          var body = new Buffer(sizeOfBody);
          var startOfBody = 4 + sizeOfSnap + 4;
          stdin.copy(body, 0, startOfBody, startOfBody + sizeOfBody);
          stdin = new Buffer(0);
          var code = module.wrap(body);
          var s = new vm.Script(code, {
            filename: snap,
            produceCachedData: true,
            sourceless: true
          });
          if (!s.cachedDataProduced) {
            console.error('Pkg: Cached data not produced.');
            process.exit(2);
          }
          var h = new Buffer(4);
          var b = s.cachedData;
          h.writeInt32LE(b.length, 0);
          process.stdout.write(h);
          process.stdout.write(b);
        }
      }
    }
  });
  process.stdin.resume();
`;

const children = {};

export function fabricate (bakes, fabricator, snap, body, cb) {
  const cmd = fabricator.binaryPath;
  const key = JSON.stringify([ cmd, bakes ]);
  let child = children[key];

  if (!child) {
    const stderr = log.debugMode ? process.stdout : 'ignore';
    child = children[key] = spawn(
      cmd, [ '--pkg-fallback' ].concat(bakes).concat('-e', script),
      { stdio: [ 'pipe', 'pipe', stderr ] }
    );
  }

  function kill () {
    delete children[key];
    child.kill();
  }

  let stdout = Buffer.alloc(0);

  function onError (error) {
    removeListeners();
    kill();
    cb(new Error(`Failed to make bytecode ${fabricator.nodeRange}-${fabricator.arch} for file ${snap} error (${error.message})`));
  }

  function onClose (code) {
    removeListeners();
    kill();
    if (code !== 0) {
      return cb(new Error(`Failed to make bytecode ${fabricator.nodeRange}-${fabricator.arch} for file ${snap}`));
    } else {
      return cb(new Error(`${cmd} closed unexpectedly`));
    }
  }

  function onData (data) {
    stdout = Buffer.concat([ stdout, data ]);
    if (stdout.length >= 4) {
      const sizeOfBlob = stdout.readInt32LE(0);
      if (stdout.length >= 4 + sizeOfBlob) {
        const blob = Buffer.alloc(sizeOfBlob);
        stdout.copy(blob, 0, 4, 4 + sizeOfBlob);
        removeListeners();
        return cb(undefined, blob);
      }
    }
  }

  child.on('error', onError);
  child.on('close', onClose);
  child.stdin.on('error', onError);
  child.stdout.on('error', onError);
  child.stdout.on('data', onData);
  function removeListeners () {
    child.removeListener('error', onError);
    child.removeListener('close', onClose);
    child.stdin.removeListener('error', onError);
    child.stdout.removeListener('error', onError);
    child.stdout.removeListener('data', onData);
  }

  const h = Buffer.alloc(4);
  let b = Buffer.from(snap);
  h.writeInt32LE(b.length, 0);
  child.stdin.write(h);
  child.stdin.write(b);
  b = body;
  h.writeInt32LE(b.length, 0);
  child.stdin.write(h);
  child.stdin.write(b);
}

export function fabricateTwice (bakes, fabricator, snap, body, cb) {
  fabricate(bakes, fabricator, snap, body, (error, buffer) => {
    // node0 can not produce second time, even if first time produced fine,
    // probably because of 'filename' cache. also, there are wierd cases
    // when node4 can not compile as well, for example file 'lib/js-yaml/dumper.js'
    // of package js-yaml@3.9.0 does not get bytecode second time on node4-win-x64
    if (error) return fabricate(bakes, fabricator, snap, body, cb);
    cb(undefined, buffer);
  });
}

export function shutdown () {
  for (const key in children) {
    const child = children[key];
    child.kill();
  }
}
