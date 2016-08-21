let Epoll = require('epoll').Epoll;
if (Epoll.EPOLLPRI) {
  console.log('ok');
}
