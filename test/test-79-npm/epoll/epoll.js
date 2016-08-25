'use strict';

var Epoll = require('epoll').Epoll;
if (Epoll.EPOLLPRI) {
  console.log('ok');
}
