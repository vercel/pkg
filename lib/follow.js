import fs from 'fs';
import { sync } from 'resolve';

export default function follow (x, opts) {
  // TODO async version
  return new Promise((resolve) => {
    resolve(sync(x, {
      basedir: opts.basedir,
      extensions: opts.extensions,
      readFileSync: (file) => {
        opts.readFile(file);
        return fs.readFileSync(file);
      },
      packageFilter: (config, base) => {
        opts.packageFilter(config, base);
        return config;
      }
    }));
  });
}
