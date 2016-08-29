const b = process.binding('natives');
const list = Object.keys(b).concat([
  'system' // esprima/bin/esvalidate.js
]);
export default list.reduce((p, c) => {
  p[c] = true;
  return p;
}, {});
