import { core, sync } from 'resolve';
import assert from 'assert';
import fs from 'fs';

Object.keys(core).forEach((key) => {
  // 'resolve' hardcodes the list to host's one, but i need
  // to be able to allow 'worker_threads' (target 12) on host 8
  assert(typeof core[key] === 'boolean');
  core[key] = true;
});

export const natives = core;

export function follow (x, opts) {
  // TODO async version
  return new Promise((resolve) => {
    resolve(sync(x, {
      basedir: opts.basedir,
      extensions: opts.extensions,
      readFileSync: (file) => {
        if (opts.ignoreFile && opts.ignoreFile === file) return Buffer.from('{}');
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
