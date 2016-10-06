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

You can specify the list of targets the binaries will be
generated for via `--targets` option. A canonical target
consists of 3 elements, separated by dashes, for example
`node6-macos-x64` or `node4-linux-armv6`:

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
example views, css, images etc). These cases are hard for
`pkg` to handle correctly. So, you must specify the files -
scripts and assets - manually in a config.

It is highly recommended to use package.json's `pkg` property.

## Usage of packaged app

Command line call to packaged app `./app a b` is equivalent
to `node app.js a b`
