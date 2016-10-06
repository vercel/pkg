'use strict';

console.log(JSON.stringify({
  '__filename': __filename,
  '__dirname': __dirname,
  'process.cwd()': process.cwd(),
  'process.execPath': process.execPath,
  'process.argv[0]': process.argv[0],
  'process.argv[1]': process.argv[1],
  'process.pkg.entrypoint': process.pkg
    ? process.pkg.entrypoint : 'undefined',
  'process.pkg.defaultEntrypoint': process.pkg
    ? process.pkg.defaultEntrypoint : 'undefined',
  'require.main.filename': require.main.filename
}));
