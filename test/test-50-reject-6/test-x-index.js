/* eslint-disable require-await */

'use strict';

async function multiply (a, b = 1) {
  return a * b;
}

multiply(5).then((result) => {
  console.log(result);
});
