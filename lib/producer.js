import { STORE_BLOB, STORE_CONTENT, snapshotify } from '../prelude/common.js';
import { log, wasReported } from './log.js';
import assert from 'assert';
import bufferStream from 'simple-bufferstream';
import { fabricateTwice } from './fabricator.js';
import fs from 'fs';
import multistream from 'multistream';
import streamMeter from 'stream-meter';

function makeBakeryBoxFromBakes (bakes) {
  const parts = [];
  if (bakes.length) {
    for (let i = 0; i < bakes.length; i += 1) {
      parts.push(Buffer.from(bakes[i]));
      parts.push(Buffer.alloc(1));
    }
    parts.push(Buffer.alloc(1));
  }
  const buffer = Buffer.concat(parts);

  const header = Buffer.alloc(16);
  header.writeInt32LE(0x4818c4df, 0);
  header.writeInt32LE(0x7ac30670, 4);
  header.writeInt32LE(0x56558a76, 8);
  header.writeInt32LE(buffer.length, 12);
  return Buffer.concat([ header, buffer ]);
}

function makePreludeBoxFromPrelude (prelude) {
  const buffer = Buffer.from(
    '(function(process, require, console, EXECPATH_FD, PAYLOAD_POSITION, PAYLOAD_SIZE) { ' +
      prelude +
    '\n})' // dont remove \n
  );

  const header = Buffer.alloc(16);
  header.writeInt32LE(0x26e0c928, 0);
  header.writeInt32LE(0x41f32b66, 4);
  header.writeInt32LE(0x3ea13ccf, 8);
  header.writeInt32LE(buffer.length, 12);
  return Buffer.concat([ header, buffer ]);
}

function makePayloadHeader (payloadSize) {
  const header = Buffer.alloc(16);
  header.writeInt32LE(0x75148eba, 0);
  header.writeInt32LE(0x6fbda9b4, 4);
  header.writeInt32LE(0x2e20c08d, 8);
  header.writeInt32LE(payloadSize, 12);
  return header;
}

export default function ({ backpack, bakes, slash, target }) {
  return new Promise((resolve, reject) => {
    if (!Buffer.alloc) {
      throw wasReported('Your node.js does not have Buffer.alloc. Please upgrade!');
    }

    let { prelude, entrypoint, stripes } = backpack;
    entrypoint = snapshotify(entrypoint, slash);
    stripes = stripes.slice();

    const vfs = {};
    for (const stripe of stripes) {
      let { snap } = stripe;
      snap = snapshotify(snap, slash);
      if (!vfs[snap]) vfs[snap] = {};
    }

    let meter;
    let count = 0;

    function pipeToNewMeter (s) {
      meter = streamMeter();
      return s.pipe(meter);
    }

    function next (s) {
      count += 1;
      return pipeToNewMeter(s);
    }

    let payloadPlace = 0;
    let payloadSize = 0;
    let prevStripe;

    multistream((cb) => {
      if (count === 0) {
        return cb(undefined, next(
          fs.createReadStream(target.binaryPath)
        ));
      } else
      if (count === 1) {
        payloadPlace += meter.bytes;
        return cb(undefined, next(
          bufferStream(makeBakeryBoxFromBakes(bakes))
        ));
      } else
      if (count === 2) {
        payloadPlace += meter.bytes;
        return cb(undefined, next(
          bufferStream(makePayloadHeader(0))
        ));
      } else
      if (count === 3) {
        if (prevStripe && !prevStripe.skip) {
          let { snap, store } = prevStripe;
          snap = snapshotify(snap, slash);
          vfs[snap][store] = [ payloadSize, meter.bytes ];
          payloadSize += meter.bytes;
        }

        if (stripes.length) {
          // clone to prevent 'skip' propagate
          // to other targets, since same stripe
          // is used for several targets
          const stripe = Object.assign({}, stripes.shift());
          prevStripe = stripe;

          if (stripe.buffer) {
            if (stripe.store === STORE_BLOB) {
              const snap = snapshotify(stripe.snap, slash);
              return fabricateTwice(bakes, target.fabricator, snap, stripe.buffer, (error, buffer) => {
                if (error) {
                  log.warn(error.message);
                  stripe.skip = true;
                  return cb(undefined, bufferStream(Buffer.alloc(0)));
                }

                cb(undefined, pipeToNewMeter(bufferStream(buffer)));
              });
            } else {
              return cb(undefined, pipeToNewMeter(bufferStream(stripe.buffer)));
            }
          } else
          if (stripe.file) {
            if (stripe.file === target.output) {
              return cb(wasReported(
                'Trying to take executable into executable', stripe.file
              ));
            }

            assert.equal(stripe.store, STORE_CONTENT); // others must be buffers from walker
            return cb(undefined, pipeToNewMeter(fs.createReadStream(stripe.file)));
          } else {
            assert(false, 'producer: bad stripe');
          }
        } else {
          return cb(undefined, next(
            bufferStream(makePreludeBoxFromPrelude(
              prelude.replace('%VIRTUAL_FILESYSTEM%', JSON.stringify(vfs))
                     .replace('%DEFAULT_ENTRYPOINT%', JSON.stringify(entrypoint))
            ))
          ));
        }
      } else {
        return cb();
      }
    }).on('error', (error) => {
      reject(error);
    }).pipe(
      fs.createWriteStream(target.output)
    ).on('error', (error) => {
      reject(error);
    }).on('close', () => {
      fs.open(target.output, 'r+', (error, fd) => {
        if (error) return reject(error);
        const buffer = makePayloadHeader(payloadSize);
        fs.write(fd, buffer, 0, buffer.length, payloadPlace, (error2) => {
          if (error2) return reject(error2);
          fs.close(fd, (error3) => {
            if (error3) return reject(error3);
            resolve();
          });
        });
      });
    });
  });
}
