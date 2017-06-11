import { STORE_BLOB, STORE_CONTENT, snapshotify } from '../prelude/common.js';
import assert from 'assert';
import bufferStream from 'simple-bufferstream';
import { fabricate } from './fabricator.js';
import fs from 'fs';
import multistream from 'multistream';
import streamMeter from 'stream-meter';
import { wasReported } from './log.js';

function makeBakeryBoxFromOptions (options) {
  const parts = [];
  if (options.length) {
    for (let i = 0; i < options.length; i += 1) {
      parts.push(Buffer.from(options[i]));
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

export default function ({ backpack, options, target, slash }) {
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
    let recentStripe;

    multistream((cb) => {
      if (count === 0) {
        return cb(undefined, next(
          fs.createReadStream(target.binaryPath)
        ));
      } else
      if (count === 1) {
        payloadPlace += meter.bytes;
        return cb(undefined, next(
          bufferStream(makeBakeryBoxFromOptions(options))
        ));
      } else
      if (count === 2) {
        payloadPlace += meter.bytes;
        return cb(undefined, next(
          bufferStream(makePayloadHeader(0))
        ));
      } else
      if (count === 3) {
        if (recentStripe) {
          let { snap, store } = recentStripe;
          snap = snapshotify(snap, slash);
          vfs[snap][store] = [ payloadSize, meter.bytes ];
          payloadSize += meter.bytes;
        }

        if (stripes.length) {
          const stripe = stripes.shift();
          recentStripe = stripe;

          if (stripe.buffer) {
            if (stripe.store === STORE_BLOB) {
              const snap = snapshotify(stripe.snap, slash);
              return fabricate(options, target.fabricator, snap, stripe.buffer, (error, buffer) => {
                if (error) return cb(error);
                cb(undefined, pipeToNewMeter(bufferStream(buffer)));
              });
            } else {
              return cb(undefined, pipeToNewMeter(bufferStream(stripe.buffer)));
            }
          } else
          if (stripe.file) {
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
