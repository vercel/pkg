let colors = require('colors');

if (typeof colors.green === 'function') {
  let gopd = Object.getOwnPropertyDescriptor;
  let grass = gopd(String.prototype, 'green');
  if (grass && (typeof grass.get === 'function')) {
    console.log('ok');
  }
}
