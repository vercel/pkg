# Developers

This file is used to help new developers understanding how pkg works at low level.

## Setup

```bash
git clone https://github.com/vercel/pkg.git
cd pkg
# install deps and build project (see `prepare` script)
yarn install
# link pkg globally
yarn link
# link pkg inside your app
cd ../my-test-app
yarn link pkg
```

With this setup you will be able to test your customized version of pkg inside your application.

## How it works

Pkg uses [pkg-fetch](https://github.com/vercel/pkg) to fetch or build required nodejs binaries based on the requested node version, arch and os.

By defauilt it will look for nodejs binaries inside cache folder: `~/.pkg-cache/v<major>.<minor>/`. If you want you can use `PKG_IGNORE_TAG` and `PKG_CACHE_PATH` to customize the destination folder.

If binaries are not in cache it will check in it's github releases to fetch the binaries required (the tag of the release depends on pkg-fetch version `v<major>.<minor>`), the available nodejs versions depends on the available [patches](https://github.com/vercel/pkg-fetch/tree/master/patches).

Patches are needed to patch Node.js executable with a proxy around fs. This proxy adds the ability to look into something called a snapshot file system, which is where your project is stored. Also, it doesn’t store your source JavaScript directly. It runs your JavaScript through the V8 compiler and produces a V8 snapshot, which has two nice consequences:

1. Your code will start marginally faster, because all the work of parsing the JavaScript source and so forth is already done; and 
2. Your code doesn’t live in the clear in the binary, which may be advantageous if you want to hide it.

Pkg traverses the source code for your application and its dependencies looking for things like require()s to prune code that isn’t used. This is good if you want to optimize for small binaries with little effort. But often this process goes wrong, specially when something like TypeScript produces JavaScript that throws off pkg’s heuristics. In that case you have to intervene and list the files that should be included by hand in `pakckage.json` `pkg` settings (assets/scripts).

## Project structure

```
pkg
├── dictionary
├── examples
├── lib
├── prelude
└── test
```

### dictionary

Contains patches needed for specific nodejs modules. Example:

```js
'use strict';

module.exports = {
  pkg: {
    scripts: ['lib/middleware/*.js'],
    assets: [
      'lib/public/**/*', 
    ],
    patches: { // monkey patch the code to fix some require errors
      'lib/bunyan.js': ["mv = require('mv' + '');", "mv = require('mv');"],
      'graceful-fs.js': [
        { do: 'prepend' },
        'if ((function() {\n' +
          "  var version = require('./package.json').version;\n" +
          "  var major = parseInt(version.split('.')[0]);\n" +
          '  if (major < 4) {\n' +
          "    module.exports = require('fs');\n" +
          '    return true;\n' +
          '  }\n' +
          '})()) return;\n',
      ],
    },
    deployFiles: [['prebuilds', 'prebuilds', 'directory']],
  },
};
```

- `scripts`: List of globs, will be added to `pkg` `scripts` settings
- `assets`: List of globs, will be added to `pkg` `assets` settings
- `patches`: Monkey patches, the key is the file to patch the value are the array of patches to apply. The array is processed by function `stepPatch` of [lib/walker.js](/lib/walker.js):

```js
stepPatch(record) {
    const patch = this.patches[record.file];
    if (!patch) return;

    let body = record.body.toString('utf8');

    for (let i = 0; i < patch.length; i += 2) {
      if (typeof patch[i] === 'object') {
        if (patch[i].do === 'erase') {
          body = patch[i + 1];
        } else if (patch[i].do === 'prepend') {
          body = patch[i + 1] + body;
        } else if (patch[i].do === 'append') {
          body += patch[i + 1];
        }
      } else if (typeof patch[i] === 'string') {
        const esc = patch[i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regexp = new RegExp(esc, 'g');
        body = body.replace(regexp, patch[i + 1]);
      }
    }

    record.body = body;
  }
```

- `deployFiles`: List of files like node native addons and else that needs to be placed on pkg root folder

### examples

List of examples

### prelude

Contains files that are used for...

### lib

#### walker

Traverses the source code for your application and its dependencies looking for things like require()s

### test

CI tests
