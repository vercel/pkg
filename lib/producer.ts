import { createBrotliCompress, createGzip } from 'zlib';
import Multistream from 'multistream';
import assert from 'assert';
import { execFileSync } from 'child_process';
import fs from 'fs-extra';
import intoStream from 'into-stream';
import path from 'path';
import streamMeter from 'stream-meter';
import { Readable } from 'stream';

import { STORE_BLOB, STORE_CONTENT, isDotNODE, snapshotify } from './common';
import { log, wasReported } from './log';
import { fabricateTwice } from './fabricator';
import { platform, SymLinks, Target } from './types';
import { Stripe } from './packer';
import { CompressType } from './compress_type';

interface NotFound {
  notFound: true;
}

interface Placeholder {
  position: number;
  size: number;
  padder: string;
}

type PlaceholderTypes =
  | 'BAKERY'
  | 'PAYLOAD_POSITION'
  | 'PAYLOAD_SIZE'
  | 'PRELUDE_POSITION'
  | 'PRELUDE_SIZE';
type PlaceholderMap = Record<PlaceholderTypes, Placeholder | NotFound>;

function discoverPlaceholder(
  binaryBuffer: Buffer,
  searchString: string,
  padder: string
): Placeholder | NotFound {
  const placeholder = Buffer.from(searchString);
  const position = binaryBuffer.indexOf(placeholder);

  if (position === -1) {
    return { notFound: true };
  }

  return { position, size: placeholder.length, padder };
}

function injectPlaceholder(
  fd: number,
  placeholder: Placeholder | NotFound,
  value: string | number | Buffer,
  cb: (
    err: NodeJS.ErrnoException | null,
    written: number,
    buffer: Buffer
  ) => void
) {
  if ('notFound' in placeholder) {
    assert(false, 'Placeholder for not found');
  }

  const { position, size, padder } = placeholder;
  let stringValue: Buffer = Buffer.from('');

  if (typeof value === 'number') {
    stringValue = Buffer.from(value.toString());
  } else if (typeof value === 'string') {
    stringValue = Buffer.from(value);
  } else {
    stringValue = value;
  }

  const padding = Buffer.from(padder.repeat(size - stringValue.length));

  stringValue = Buffer.concat([stringValue, padding]);
  fs.write(fd, stringValue, 0, stringValue.length, position, cb);
}

function discoverPlaceholders(binaryBuffer: Buffer) {
  return {
    BAKERY: discoverPlaceholder(
      binaryBuffer,
      `\0${'// BAKERY '.repeat(20)}`,
      '\0'
    ),
    PAYLOAD_POSITION: discoverPlaceholder(
      binaryBuffer,
      '// PAYLOAD_POSITION //',
      ' '
    ),
    PAYLOAD_SIZE: discoverPlaceholder(binaryBuffer, '// PAYLOAD_SIZE //', ' '),
    PRELUDE_POSITION: discoverPlaceholder(
      binaryBuffer,
      '// PRELUDE_POSITION //',
      ' '
    ),
    PRELUDE_SIZE: discoverPlaceholder(binaryBuffer, '// PRELUDE_SIZE //', ' '),
  };
}

function injectPlaceholders(
  fd: number,
  placeholders: PlaceholderMap,
  values: Record<PlaceholderTypes, number | string | Buffer>,
  cb: (error?: Error | null) => void
) {
  injectPlaceholder(fd, placeholders.BAKERY, values.BAKERY, (error) => {
    if (error) {
      return cb(error);
    }

    injectPlaceholder(
      fd,
      placeholders.PAYLOAD_POSITION,
      values.PAYLOAD_POSITION,
      (error2) => {
        if (error2) {
          return cb(error2);
        }

        injectPlaceholder(
          fd,
          placeholders.PAYLOAD_SIZE,
          values.PAYLOAD_SIZE,
          (error3) => {
            if (error3) {
              return cb(error3);
            }

            injectPlaceholder(
              fd,
              placeholders.PRELUDE_POSITION,
              values.PRELUDE_POSITION,
              (error4) => {
                if (error4) {
                  return cb(error4);
                }

                injectPlaceholder(
                  fd,
                  placeholders.PRELUDE_SIZE,
                  values.PRELUDE_SIZE,
                  cb
                );
              }
            );
          }
        );
      }
    );
  });
}

function makeBakeryValueFromBakes(bakes: string[]) {
  const parts = [];

  if (bakes.length) {
    for (let i = 0; i < bakes.length; i += 1) {
      parts.push(Buffer.from(bakes[i]));
      parts.push(Buffer.alloc(1));
    }

    parts.push(Buffer.alloc(1));
  }

  return Buffer.concat(parts);
}

function replaceDollarWise(s: string, sf: string, st: string) {
  return s.replace(sf, () => st);
}

function makePreludeBufferFromPrelude(prelude: string) {
  return Buffer.from(
    `(function(process, require, console, EXECPATH_FD, PAYLOAD_POSITION, PAYLOAD_SIZE) { ${prelude}\n})` // dont remove \n
  );
}

function findPackageJson(nodeFile: string) {
  let dir = nodeFile;

  while (dir !== '/') {
    dir = path.dirname(dir);

    if (fs.existsSync(path.join(dir, 'package.json'))) {
      break;
    }
  }

  if (dir === '/') {
    throw new Error(`package.json not found for "${nodeFile}"`);
  }

  return dir;
}

function nativePrebuildInstall(target: Target, nodeFile: string) {
  const prebuildInstall = path.join(
    __dirname,
    '../node_modules/.bin/prebuild-install'
  );
  const dir = findPackageJson(nodeFile);
  // parse the target node version from the binaryPath
  const nodeVersion = path.basename(target.binaryPath).split('-')[1];

  if (!/^v[0-9]+\.[0-9]+\.[0-9]+$/.test(nodeVersion)) {
    throw new Error(`Couldn't find node version, instead got: ${nodeVersion}`);
  }

  const nativeFile = `${nodeFile}.${target.platform}.${nodeVersion}`;

  if (fs.existsSync(nativeFile)) {
    return nativeFile;
  }

  // prebuild-install will overwrite the target .node file, so take a backup
  if (!fs.existsSync(`${nodeFile}.bak`)) {
    fs.copyFileSync(nodeFile, `${nodeFile}.bak`);
  }

  // run prebuild
  execFileSync(
    prebuildInstall,
    [
      '--target',
      nodeVersion,
      '--platform',
      platform[target.platform],
      '--arch',
      target.arch,
    ],
    { cwd: dir }
  );

  // move the prebuild to a new name with a platform/version extension
  fs.copyFileSync(nodeFile, nativeFile);

  // put the backed up file back
  fs.moveSync(`${nodeFile}.bak`, nodeFile, { overwrite: true });

  return nativeFile;
}

interface ProducerOptions {
  backpack: { entrypoint: string; stripes: Stripe[]; prelude: string };
  bakes: string[];
  slash: string;
  target: Target;
  symLinks: SymLinks;
  doCompress: CompressType;
  nativeBuild: boolean;
  mockNode: boolean;
}

/**
 * instead of creating a vfs dicionnary with actual path as key
 * we use a compression mechanism that can reduce significantly
 * the memory footprint of the vfs in the code.
 *
 * without vfs compression:
 *
 * vfs = {
 *   "/folder1/folder2/file1.js": {};
 *   "/folder1/folder2/folder3/file2.js": {};
 *   "/folder1/folder2/folder3/file3.js": {};
 * }
 *
 * with compression :
 *
 * fileDictionary = {
 *    "folder1": "1",
 *    "folder2": "2",
 *    "file1": "3",
 *    "folder3": "4",
 *    "file2": "5",
 *    "file3": "6",
 * }
 * vfs = {
 *   "/1/2/3": {};
 *   "/1/2/4/5": {};
 *   "/1/2/4/6": {};
 * }
 *
 * note: the key is computed in base36 for further compression.
 */
const fileDictionary: { [key: string]: string } = {};
let counter = 0;
function getOrCreateHash(fileOrFolderName: string) {
  let existingKey = fileDictionary[fileOrFolderName];
  if (!existingKey) {
    const newkey = counter;
    counter += 1;
    existingKey = newkey.toString(36);
    fileDictionary[fileOrFolderName] = existingKey;
  }
  return existingKey;
}
const separator = '/';

function makeKey(
  doCompression: CompressType,
  fullpath: string,
  slash: string
): string {
  if (doCompression === CompressType.None) return fullpath;
  return fullpath.split(slash).map(getOrCreateHash).join(separator);
}

export default function producer({
  backpack,
  bakes,
  slash,
  target,
  symLinks,
  doCompress,
  nativeBuild,
  mockNode,
}: ProducerOptions) {
  return new Promise<void>((resolve, reject) => {
    if (!Buffer.alloc) {
      throw wasReported(
        'Your node.js does not have Buffer.alloc. Please upgrade!'
      );
    }

    const { prelude } = backpack;
    let { entrypoint, stripes } = backpack;
    entrypoint = snapshotify(entrypoint, slash);
    stripes = stripes.slice();

    const vfs: Record<string, Record<string, [number, number]>> = {};

    for (const stripe of stripes) {
      let { snap } = stripe;
      snap = snapshotify(snap, slash);
      const vfsKey = makeKey(doCompress, snap, slash);
      if (!vfs[vfsKey]) vfs[vfsKey] = {};
    }

    const snapshotSymLinks: SymLinks = {};

    for (const [key, value] of Object.entries(symLinks)) {
      const k = snapshotify(key, slash);
      const v = snapshotify(value, slash);
      const vfsKey = makeKey(doCompress, k, slash);
      snapshotSymLinks[vfsKey] = makeKey(doCompress, v, slash);
    }

    let meter: streamMeter.StreamMeter;
    let count = 0;

    function pipeToNewMeter(s: Readable) {
      meter = streamMeter();
      return s.pipe(meter);
    }
    function pipeMayCompressToNewMeter(s: Readable): streamMeter.StreamMeter {
      if (doCompress === CompressType.GZip) {
        return pipeToNewMeter(s.pipe(createGzip()));
      }
      if (doCompress === CompressType.Brotli) {
        return pipeToNewMeter(s.pipe(createBrotliCompress()));
      }
      return pipeToNewMeter(s);
    }

    function next(s: Readable) {
      count += 1;
      return pipeToNewMeter(s);
    }

    const binaryBuffer = fs.readFileSync(target.binaryPath);
    const placeholders = discoverPlaceholders(binaryBuffer);

    let track = 0;
    let prevStripe: Stripe;

    let payloadPosition: number;
    let payloadSize: number;
    let preludePosition: number;
    let preludeSize: number;

    new Multistream((cb) => {
      if (count === 0) {
        return cb(null, next(intoStream(binaryBuffer)));
      }

      if (count === 1) {
        payloadPosition = meter.bytes;
        return cb(null, next(intoStream(Buffer.alloc(0))));
      }

      if (count === 2) {
        if (prevStripe && !prevStripe.skip) {
          const { store } = prevStripe;
          let { snap } = prevStripe;
          snap = snapshotify(snap, slash);
          const vfsKey = makeKey(doCompress, snap, slash);
          vfs[vfsKey][store] = [track, meter.bytes];
          track += meter.bytes;
        }

        if (stripes.length) {
          // clone to prevent 'skip' propagate
          // to other targets, since same stripe
          // is used for several targets
          const stripe = { ...(stripes.shift() as Stripe) };
          prevStripe = stripe;

          if (stripe.buffer) {
            if (stripe.store === STORE_BLOB) {
              const snap = snapshotify(stripe.snap, slash);
              return fabricateTwice(
                bakes,
                target.fabricator,
                snap,
                stripe.buffer,
                (error, buffer) => {
                  if (error) {
                    log.warn(error.message);
                    stripe.skip = true;
                    return cb(null, intoStream(Buffer.alloc(0)));
                  }

                  cb(
                    null,
                    pipeMayCompressToNewMeter(
                      intoStream(buffer || Buffer.from(''))
                    )
                  );
                }
              );
            }
            return cb(
              null,
              pipeMayCompressToNewMeter(intoStream(stripe.buffer))
            );
          }

          if (stripe.file) {
            if (stripe.file === target.output) {
              return cb(
                wasReported(
                  'Trying to take executable into executable',
                  stripe.file
                ),
                null
              );
            }

            assert.strictEqual(stripe.store, STORE_CONTENT); // others must be buffers from walker

            if (isDotNODE(stripe.file) && nativeBuild) {
              try {
                const platformFile = nativePrebuildInstall(target, stripe.file);

                if (fs.existsSync(platformFile)) {
                  return cb(
                    null,
                    pipeMayCompressToNewMeter(fs.createReadStream(platformFile))
                  );
                }
              } catch (err) {
                log.debug(
                  `prebuild-install failed[${stripe.file}]:`,
                  (err as Error).message
                );
              }
            }
            return cb(
              null,
              pipeMayCompressToNewMeter(fs.createReadStream(stripe.file))
            );
          }

          assert(false, 'producer: bad stripe');
        } else {
          payloadSize = track;
          preludePosition = payloadPosition + payloadSize;
          return cb(
            null,
            next(
              intoStream(
                makePreludeBufferFromPrelude(
                  replaceDollarWise(
                    replaceDollarWise(
                      replaceDollarWise(
                        replaceDollarWise(
                          replaceDollarWise(
                            replaceDollarWise(
                              prelude,
                              '%VIRTUAL_FILESYSTEM%',
                              JSON.stringify(vfs)
                            ),
                            '%DEFAULT_ENTRYPOINT%',
                            JSON.stringify(entrypoint)
                          ),
                          '%SYMLINKS%',
                          JSON.stringify(snapshotSymLinks)
                        ),
                        '%DICT%',
                        JSON.stringify(fileDictionary)
                      ),
                      '%DOCOMPRESS%',
                      JSON.stringify(doCompress)
                    ),
                    '%MOCK_NODE%',
                    JSON.stringify(mockNode)
                  )
                )
              )
            )
          );
        }
      } else {
        return cb(null, null);
      }
    })
      .on('error', (error) => {
        reject(error);
      })
      .pipe(fs.createWriteStream(target.output))
      .on('error', (error) => {
        reject(error);
      })
      .on('close', () => {
        preludeSize = meter.bytes;
        fs.open(target.output, 'r+', (error, fd) => {
          if (error) return reject(error);
          injectPlaceholders(
            fd,
            placeholders,
            {
              BAKERY: makeBakeryValueFromBakes(bakes),
              PAYLOAD_POSITION: payloadPosition,
              PAYLOAD_SIZE: payloadSize,
              PRELUDE_POSITION: preludePosition,
              PRELUDE_SIZE: preludeSize,
            },
            (error2) => {
              if (error2) return reject(error2);
              fs.close(fd, (error3) => {
                if (error3) return reject(error3);
                resolve();
              });
            }
          );
        });
      });
  });
}
