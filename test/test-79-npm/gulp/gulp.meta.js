'use strict';

module.exports = function () {
  return {
    packages: ['gulp-concat'],
    deployFiles: ['gulp-concat-01.txt', 'gulp-concat-02.txt', 'gulpfile.js'],
    take: 'last-line',
  };
};
