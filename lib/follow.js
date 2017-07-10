import { sync } from 'resolve';

export default function follow (x, opts) {
  return new Promise((resolve) => {
    resolve(sync(x, opts));
    // TODO own implementation with foreign tests
    // TODO async follow
/*
    resolve_(x, opts, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
*/
  });
}
