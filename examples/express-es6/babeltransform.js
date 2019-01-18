var babelTransform = require('@babel/core').transformSync;

const babelOptions = require('./.babelrc.js');

module.exports = function(filename, content) {
  let opts = Object.assign({}, {filename}, babelOptions);
  return babelTransform(content, opts).code;
}
