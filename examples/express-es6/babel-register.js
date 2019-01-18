const babelConfig = require('./.babelrc.js');

require('@babel/register')(babelConfig);

require('./index');
