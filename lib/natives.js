let natives = Object.keys(process.binding('natives'));
natives = natives.concat('file', 'system'); // CommonJS
natives = natives.reduce(function (a, b) {
  a[b] = true;
  return a;
}, {});

module.exports = natives;
