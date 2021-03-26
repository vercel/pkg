'use strict';

class AsyncIterator {
  constructor() {
    this.limit = 5;
    this.current = 0;
  }

  next() {
    this.current += 1;
    let done = this.current > this.limit;
    return Promise.resolve({
      value: done ? undefined : this.current,
      done,
    });
  }

  [Symbol.asyncIterator]() {
    return this;
  }
}

// The function does have an await (in the for-await-of loop), ESLint just doesn't seem to detect it
/* eslint-disable require-await */
async function t() {
  /* eslint-enable require-await */
  let it = new AsyncIterator();
  for await (let x of it) {
    console.log(x);
  }
}

t();
