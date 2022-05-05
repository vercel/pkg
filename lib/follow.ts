import { sync, SyncOpts } from 'resolve';
import fs from 'fs';
import path from 'path';
import { toNormalizedRealPath } from './common';

import type { PackageJson } from './types';

const PROOF = 'a-proof-that-main-is-captured.js';

function parentDirectoriesContain(parent: string, directory: string) {
  let currentParent = parent;

  while (true) {
    if (currentParent === directory) {
      return true;
    }

    const newParent = path.dirname(currentParent);

    if (newParent === currentParent) {
      return false;
    }

    currentParent = newParent;
  }
}

interface FollowOptions extends Pick<SyncOpts, 'basedir' | 'extensions'> {
  ignoreFile?: string;
  catchReadFile?: (file: string) => void;
  catchPackageFilter?: (config: PackageJson, base: string, dir: string) => void;
}

export function follow(x: string, opts: FollowOptions) {
  // TODO async version
  return new Promise<string>((resolve) => {
    resolve(
      sync(x, {
        basedir: opts.basedir,
        extensions: opts.extensions,
        isFile: (file) => {
          if (
            opts.ignoreFile &&
            path.join(path.dirname(opts.ignoreFile), PROOF) === file
          ) {
            return true;
          }

          let stat;

          try {
            stat = fs.statSync(file);
          } catch (e) {
            const ex = e as NodeJS.ErrnoException;

            if (ex && (ex.code === 'ENOENT' || ex.code === 'ENOTDIR'))
              return false;

            throw ex;
          }

          return stat.isFile() || stat.isFIFO();
        },
        isDirectory: (directory) => {
          if (
            opts.ignoreFile &&
            parentDirectoriesContain(opts.ignoreFile, directory)
          ) {
            return false;
          }

          let stat;

          try {
            stat = fs.statSync(directory);
          } catch (e) {
            const ex = e as NodeJS.ErrnoException;

            if (ex && (ex.code === 'ENOENT' || ex.code === 'ENOTDIR')) {
              return false;
            }

            throw ex;
          }

          return stat.isDirectory();
        },
        readFileSync: (file) => {
          if (opts.ignoreFile && opts.ignoreFile === file) {
            return Buffer.from(`{"main":"${PROOF}"}`);
          }

          if (opts.catchReadFile) {
            opts.catchReadFile(file);
          }

          return fs.readFileSync(file);
        },
        packageFilter: (config, base, dir) => {
          if (opts.catchPackageFilter) {
            opts.catchPackageFilter(config, base, dir);
          }

          return config;
        },

        /** function to synchronously resolve a potential symlink to its real path */
        // realpathSync?: (file: string) => string;
        realpathSync: (file) => {
          const file2 = toNormalizedRealPath(file);
          return file2;
        },
      })
    );
  });
}
