let extender = require('extender');

let e = extender.define({
  multiply: function (str, times) {
    let ret = str;
    for (let i = 1; i < times; i += 1) {
      ret += str;
    }
    return ret;
  }
});

let v = e('hello').multiply(2).value();

if (v === 'hellohello') {
  console.log('ok');
}
