**Disclaimer: `pkg` was created for use within containers and is not intended for use in serverless environments. For those using Vercel, this means that there is no requirement to use `pkg` in your projects as the benefits it provides are not applicable to the platform.**

![](https://res.cloudinary.com/zeit-inc/image/upload/v1509936789/repositories/pkg/pkg-repo-banner-new.png)

[![Build Status](https://travis-ci.org/vercel/pkg.svg?branch=master)](https://travis-ci.org/vercel/pkg)
[![Coverage Status](https://coveralls.io/repos/github/vercel/pkg/badge.svg?branch=master)](https://coveralls.io/github/vercel/pkg?branch=master)
[![Dependency Status](https://david-dm.org/vercel/pkg/status.svg)](https://david-dm.org/vercel/pkg)
[![devDependency Status](https://david-dm.org/vercel/pkg/dev-status.svg)](https://david-dm.org/vercel/pkg?type=dev)

This command line interface enables you to package your Node.js project into an executable that can be run even on devices without Node.js installed.

## Use Cases

* Make a commercial version of your application without sources
* Make a demo/evaluation/trial version of your app without sources
* Instantly make executables for other platforms (cross-compilation)
* Make some kind of self-extracting archive or installer
* No need to install Node.js and npm to run the packaged application
* No need to download hundreds of files via `npm install` to deploy
your application. Deploy it as a single file
* Put your assets inside the executable to make it even more portable
* Test your app against new Node.js version without installing it

## Usage

```sh
npm install -g pkg
```

After installing it, run `pkg --help` without arguments to see list of options.

The entrypoint of your project is a mandatory CLI argument. It may be:

* Path to entry file. Suppose it is `/path/app.js`, then
packaged app will work the same way as `node /path/app.js`
* Path to `package.json`. `Pkg` will follow `bin` property of
the specified `package.json` and use it as entry file.
* Path to directory. `Pkg` will look for `package.json` in
the specified directory. See above.

### Targets

`pkg` can generate executables for several target machines at a
time. You can specify a comma-separated list of targets via `--targets`
option. A canonical target consists of 3 elements, separated by
dashes, for example `node6-macos-x64` or `node4-linux-armv6`:

* **nodeRange** node${n} or latest
* **platform** freebsd, linux, alpine, macos, win
* **arch** x64, x86, armv6, armv7

You may omit any element (and specify just `node6` for example).
The omitted elements will be taken from current platform or
system-wide Node.js installation (its version and arch).
There is also an alias `host`, that means that all 3 elements
are taken from current platform/Node.js. By default targets are
`linux,macos,win` for current Node.js version and arch.

### Config

During packaging process `pkg` parses your sources, detects
calls to `require`, traverses the dependencies of your project
and includes them into executable. In most cases you
don't need to specify anything manually. However your code
may have `require(variable)` calls (so called non-literal
argument to `require`) or use non-javascript files (for
example views, css, images etc).
```js
  require('./build/' + cmd + '.js')
  path.join(__dirname, 'views/' + viewName)
```
Such cases are not handled by `pkg`. So you must specify the
files - scripts and assets - manually in `pkg` property of
your `package.json` file.
```json
  "pkg": {
    "scripts": "build/**/*.js",
    "assets": "views/**/*"
  }
```
You may also specify arrays of globs:
```
    "assets": [ "assets/**/*", "images/**/*" ]
```
Just be sure to call `pkg package.json` or `pkg .` to make use
of `scripts` and `assets` entries.

### Scripts

`scripts` is a [glob](https://github.com/sindresorhus/globby)
or list of globs. Files specified as `scripts` will be compiled
using `v8::ScriptCompiler` and placed into executable without
sources. They must conform to the JS standards of those Node.js versions
you target (see [Targets](#targets)), i.e. be already transpiled.

### Assets

`assets` is a [glob](https://github.com/sindresorhus/globby)
or list of globs. Files specified as `assets` will be packaged
into executable as raw content without modifications. Javascript
files may also be specified as `assets`. Their sources will
not be stripped as it improves execution performance of the
files and simplifies debugging.

See also
[Detecting assets in source code](#detecting-assets-in-source-code) and
[Snapshot filesystem](#snapshot-filesystem).

### Options

Node.js application can be called with runtime options
(belonging to Node.js or V8). To list them type `node --help` or
`node --v8-options`. You can "bake" these runtime options into
packaged application. The app will always run with the options
turned on. Just remove `--` from option name.
```sh
pkg app.js --options expose-gc
pkg app.js --options max_old_space_size=4096
```

### Output

You may specify `--output` if you create only one executable
or `--out-path` to place executables for multiple targets.

### Debug

Pass `--debug` to `pkg` to get a log of packaging process.
If you have issues with some particular file (seems not packaged
into executable), it may be useful to look through the log.

### Build

`pkg` has so called "base binaries" - they are actually same
`node` executables but with some patches applied. They are
used as a base for every executable `pkg` creates. `pkg`
downloads precompiled base binaries before packaging your
application. If you prefer to compile base binaries from
source instead of downloading them, you may pass `--build`
option to `pkg`. First ensure your computer meets the
requirements to compile original Node.js:
[BUILDING.md](https://github.com/nodejs/node/blob/master/BUILDING.md)

### Environment

| Var            | Description                                                                             |
| -------------- | --------------------------------------------------------------------------------------- |
| PKG_CACHE_PATH | Used to specify a custom path for node binaries cache folder. Default is `~/.pkg-cache` |
| PKG_IGNORE_TAG | Allows to ignore additional folder created on `PKG_CACHE_PATH` matching pkg-fetch version |
| MAKE_JOB_COUNT | Allow configuring number of processes used for compiling |

Examples

```bash
# 1 - Using export
export PKG_CACHE_PATH=/my/cache
pkg app.js

# 2 - Passing it before the script
PKG_CACHE_PATH=/my/cache pkg app.js
```

## Usage of packaged app

Command line call to packaged app `./app a b` is equivalent
to `node app.js a b`

## Snapshot filesystem

During packaging process `pkg` collects project files and places
them into executable. It is called a snapshot. At run time the
packaged application has access to snapshot filesystem where all
that files reside.

Packaged files have `/snapshot/` prefix in their paths (or
`C:\snapshot\` in Windows). If you used `pkg /path/app.js` command line,
then `__filename` value will be likely `/snapshot/path/app.js`
at run time. `__dirname` will be `/snapshot/path` as well. Here is
the comparison table of path-related values:

value                          | with `node`         | packaged                   | comments
-------------------------------|---------------------|----------------------------|-----------
__filename                     | /project/app.js     | /snapshot/project/app.js   |
__dirname                      | /project            | /snapshot/project          |
process.cwd()                  | /project            | /deploy                    | suppose the app is called ...
process.execPath               | /usr/bin/nodejs     | /deploy/app-x64            | `app-x64` and run in `/deploy`
process.argv[0]                | /usr/bin/nodejs     | /deploy/app-x64            |
process.argv[1]                | /project/app.js     | /snapshot/project/app.js   |
process.pkg.entrypoint         | undefined           | /snapshot/project/app.js   |
process.pkg.defaultEntrypoint  | undefined           | /snapshot/project/app.js   |
require.main.filename          | /project/app.js     | /snapshot/project/app.js   |

Hence, in order to make use of a file collected at packaging
time (`require` a javascript file or serve an asset) you should
take `__filename`, `__dirname`, `process.pkg.defaultEntrypoint`
or `require.main.filename` as a base for your path calculations.
For javascript files you can just `require` or `require.resolve`
because they use current `__dirname` by default. For assets use
`path.join(__dirname, '../path/to/asset')`. Learn more about
`path.join` in
[Detecting assets in source code](#detecting-assets-in-source-code).

On the other hand, in order to access real file system at run time
(pick up a user's external javascript plugin, json configuration or
even get a list of user's directory) you should take `process.cwd()`
or `path.dirname(process.execPath)`.

## Detecting assets in source code

When `pkg` encounters `path.join(__dirname, '../path/to/asset')`,
it automatically packages the file specified as an asset. See
[Assets](#assets). Pay attention that `path.join` must have two
arguments and the last one must be a string literal.

This way you may even avoid creating `pkg` config for your project.

## Native addons

Native addons (`.node` files) use is supported. When `pkg` encounters
a `.node` file in a `require` call, it will package this like an asset.
In some cases (like with the `bindings` package), the module path is generated
dynamicaly and `pkg` won't be able to detect it. In this case, you should
add the `.node` file directly in the `assets` field in `package.json`.

The way Node.js requires native addon is different from a classic JS
file. It needs to have a file on disk to load it, but `pkg` only generates
one file. To circumvent this, `pkg` will create a temporary file on the
disk. These files will stay on the disk after the process has exited
and will be used again on the next process launch.

When a package, that contains a native module, is being installed,
the native module is compiled against current system-wide Node.js
version. Then, when you compile your project with `pkg`, pay attention
to `--target` option. You should specify the same Node.js version
as your system-wide Node.js to make compiled executable compatible
with `.node` files.

## API

`const { exec } = require('pkg')`

`exec(args)` takes an array of command line arguments and returns
a promise. For example:

```js
await exec([ 'app.js', '--target', 'host', '--output', 'app.exe' ])
// do something with app.exe, run, test, upload, deploy, etc
```

## Troubleshooting

### Error: ENOENT: no such file or directory, uv_chdir

This error can be caused by deleting the directory the application is
run from. Or, generally, deleting `process.cwd()` directory when the
application is running.
