const list = Object.keys(process.binding('natives'));
export default list.reduce(function (a, b) {
  a[b] = true;
  return a;
}, {});
