'use strict';

function p () {
  return new Promise((resolve) => {
    resolve(42);
  });
}

async function main () {
  const result = await p();
  console.log(result);
}

main().catch((error) => {
  console.log(error);
});
