import spawn from './spawn.js';

const prepend = '(function(process, require, console) {\n';
const append = '\n})'; // dont remove \n

const sentinel = (function () {
  const b = new Buffer(12);
  b.writeInt32LE(0x26e0c928, 0);
  b.writeInt32LE(0x41f32b66, 4);
  b.writeInt32LE(0x3ea13ccf, 8);
  return b;
}());

function padding (sz) {
  return new Buffer({
    0: 0, 1: 3, 2: 2, 3: 1
  }[sz % 4]);
}

function buffer4 (v) {
  const b = new Buffer(4);
  b.writeInt32LE(v, 0);
  return b;
}

export default async function ({ stripe, target }) {

  stripe = stripe.slice(0);
  stripe.unshift(prepend);
  stripe.push(append);
  const extra = new Buffer(stripe.join(''));

  const cachedData = await spawn(
    target.fabricator.binaryPath,
    [ '--runtime', '-e', 'console.log(42)' ],
    { stdio: [ 'pipe', 'inherit', 'inherit' ] }
  );

}
