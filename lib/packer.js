const bootstrapText = fs.readFileSync(
  require.resolve('../prelude/bootstrap.js'), 'utf8'
).replace('%PKG_VERSION%', pkgVersion);

const commonText = fs.readFileSync(
  require.resolve('../prelude/common.js'), 'utf8'
);

function itemsToText (items) {
  const len = items.length;
  return len.toString() +
    (len % 10 === 1 ? ' item' : ' items');
}
