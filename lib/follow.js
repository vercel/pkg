import { core, sync } from 'resolve';
import assert from 'assert';
import fs from 'fs';
import path from 'path';

Object.keys(core).forEach((key) => {
  // 'resolve' hardcodes the list to host's one, but i need
  // to be able to allow 'worker_threads' (target 12) on host 8
  assert(typeof core[key] === 'boolean');
  core[key] = true;
});

export const natives = core;

const PROOF = 'a-proof-that-main-is-captured.js';

function parentDirectoriesContain (parent, directory) {
  while (true) {
    if (parent === directory) return true;
    const newParent = path.dirname(parent);
    if (newParent === parent) return false;
    parent = newParent;
  }
}

export function follow (x, opts) {
  // TODO async version
  return new Promise((resolve) => {
    resolve(sync(x, {
      basedir: opts.basedir,
      extensions: opts.extensions,
      isFile: (file) => {
        if (opts.ignoreFile && path.join(path.dirname(opts.ignoreFile), PROOF) === file) return true;
        let stat;

        try {
          stat = fs.statSync(file);
        } catch (e) {
          if (e && (e.code === 'ENOENT' || e.code === 'ENOTDIR')) return false;
          throw e;
        }

        return stat.isFile() || stat.isFIFO();
      },
      isDirectory: (directory) => {
        if (opts.ignoreFile && parentDirectoriesContain(opts.ignoreFile, directory)) return false;
        let stat;

        try {
          stat = fs.statSync(directory);
        } catch (e) {
          if (e && (e.code === 'ENOENT' || e.code === 'ENOTDIR')) return false;
          throw e;
        }

        return stat.isDirectory();
      },
      readFileSync: (file) => {
        if (opts.ignoreFile && opts.ignoreFile === file) return Buffer.from(`{"main":"${PROOF}"}`);
        if (opts.readFile) opts.readFile(file);
        return fs.readFileSync(file);
      },
      packageFilter: (config, base) => {
        if (opts.packageFilter) opts.packageFilter(config, base);
        return config;
      }
    }));
  });
}
