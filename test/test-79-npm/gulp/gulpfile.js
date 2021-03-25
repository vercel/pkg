/* eslint-disable no-underscore-dangle */

'use strict';

var gulp = require('gulp');
var concat = require('gulp-concat');

gulp.task('default', function () {
  gulp
    .src('gulp-concat-*.txt')
    .pipe(concat('gulp-concat-out.txt', { newLine: '' }))
    .on('data', function (c) {
      if (c._contents.toString() === '123456') {
        (console._log_ || console.log)('ok');
      }
    });
});
