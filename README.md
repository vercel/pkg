# pkg

[![Build Status](https://travis-ci.com/zeit/pkg.svg?token=CPbpm6MRBVbWVmDFaLxs&branch=master)](https://travis-ci.com/zeit/pkg)

Package your Node.js project into an executable

## Use cases

* Make a commercial version of your application without sources
* Make a demo/evaluation/trial version of your app without sources
* Instantly make executables for other platforms (cross-compilation)
* Make some kind of self-extracting archive or installer
* No need to install Node.js and npm to deploy the packaged application
* No need to download hundreds of files via `npm install` to deploy
your application. Deploy it as a single independent file
* Put your assets inside the executable to make it even more portable
* Test your app against new Node.js version without installing it

## Install

```
npm install -g pkg
```

## CLI usage

Run `pkg --help` without arguments to see list of options.

The entrypoint of your project is a mandatory CLI argument.
It may be:

* Path to entry file. Suppose it is `/path/app.js`, then
packaged app will work the same way as `node /path/app.js`
* Path to `package.json`. `Pkg` will follow `bin` property of
the specified `package.json` and use it as entry file.
* Path to directory. `Pkg` will look for `package.json` in
the specified directory. See above.

### Targets

The final executables can generated for several target machines
at a time. You can specify the list of targets via `--targets`
option. A canonical target consists of 3 elements, separated by
dashes, for example `node6-macos-x64` or `node4-linux-armv6`:

* **nodeRange** node${n} or latest
* **platform** freebsd, linux, macos, win
* **arch** x64, x86, armv6, armv7

You may omit any element (and specify just `node6` for example).
The omitted elements will be taken from current platform or
system-wide `node` installation (it's version and arch).
There is also an alias `host`, that means that all 3 elements
are taken from current platform/node. By default targets are
`linux,macos,win` for current node version and arch.

### Config

During packaging process `pkg` parses your sources, detects
calls to `require`, traverses the dependencies of your project
and includes them into final executable. In most cases you
don't need to specify anything manually. However your code
may have `require(variable)` calls (so called non-literal
argument to `require`) or use non-javascript files (for
example views, css, images etc).
```
  require('./build/' + cmd + '.js')
  path.join(__dirname, 'views', viewName)
```
Such cases are not handled by `pkg`. So you must specify the
files - scripts and assets - manually in a config. It is
recommended to use package.json's `pkg` property.
```
  "pkg": {
    "scripts": "build/**/*.js",
    "assets": "views/**/*"
  }
```


### Scripts

`scripts` is a [glob](https://github.com/sindresorhus/globby)
or list of globs. Files specified as `scripts` will be compiled
using `v8::ScriptCompiler` and placed into executable without
sources. They must conform JS standards of those `node` versions
you target (see [Targets](#targets)), i.e. be already transpiled.

### Assets

`assets` is a [glob](https://github.com/sindresorhus/globby)
or list of globs. Files specified as `assets` will be packaged
into executable as raw content without modifications. Javascript
files may be specified as `assets` as well. Their sources will
not be stripped. It improves performance of execution of those
files and simplifies debugging.

See also [Virtual filesystem](#virtual-filesystem).

### Options

### Output

### Debug

### Build

## Usage of packaged app

Command line call to packaged app `./app a b` is equivalent
to `node app.js a b`.

## Virtual filesystem

During packaging process `pkg` collects project files and places
them into final executable. At run time the packaged application has
internal virtual filesystem where all that files reside.

Packaged VFS files have `/thebox/` prefix in their paths (or
`C:\thebox\` in Windows). If you used `pkg /path/app.js` command line,
then `__filename` value will be likely `/thebox/path/app.js`
at run-time. `__dirname` will be `/thebox/path` as well. Here is
the comparison table of path-related values:

value                          | in node             | packaged
-------------------------------|---------------------|--------------------------
__filename                     | /project/app.js     | /thebox/project/app.js
__dirname                      | /project            | /thebox/project
process.cwd()                  | /project            | /deploy
process.execPath               | /usr/bin/nodejs     | /deploy/app-x64
process.argv[0]                | /usr/bin/nodejs     | /deploy/app-x64
process.argv[1]                | /project/app.js     | /deploy/app-x64
process.pkg.entrypoint         | undefined           | /thebox/project/app.js
process.pkg.defaultEntrypoint  | undefined           | /thebox/project/app.js
require.main.filename          | /project/app.js     | /thebox/project/app.js
