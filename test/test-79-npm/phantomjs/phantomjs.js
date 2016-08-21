// в скомпилированном состоянии не сможет
// найти екзешник, поэтому формальная проверка

let phantomjs = require('phantomjs');
if (phantomjs.version) {
  console.log('ok');
}
