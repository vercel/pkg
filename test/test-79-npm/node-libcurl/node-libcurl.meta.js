'use strict';

// in win32 must manually
// "git clone curl-for-windows"
// in debian there is a bug
// in /usr/include/curl/curlbuild.h

module.exports = function () {
  return {
    allow: false,
    note: 'hard to meet various requirements',
  };
};
