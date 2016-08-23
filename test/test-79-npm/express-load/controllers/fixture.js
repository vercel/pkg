'use strict';

module.exports.index = function (req, res, next) {
  res.send('Hello world!');
  if (next) return next();
};
