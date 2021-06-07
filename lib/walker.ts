/* eslint-disable require-atomic-updates */

import assert from 'assert';
import fs from 'fs-extra';
import globby from 'globby';
import path from 'path';
import chalk from 'chalk';

import {
  ALIAS_AS_RELATIVE,
  ALIAS_AS_RESOLVABLE,
  STORE_BLOB,
  STORE_CONTENT,
  STORE_LINKS,
  STORE_STAT,
  isDotJS,
  isDotJSON,
  isDotNODE,
  isPackageJson,
  normalizePath,
  toNormalizedRealPath,
} from './common';

import { follow, natives } from './follow';
import { log, wasReported } from './log';
import * as detector from './detector';
import {
  ConfigDictionary,
  FileRecord,
  FileRecords,
  Patches,
  PackageJson,
  SymLinks,
} from './types';

export interface Marker {
  hasDictionary?: boolean;
  activated?: boolean;
  toplevel?: boolean;
  public?: boolean;
  hasDeployFiles?: boolean;
  config?: PackageJson;
  configPath: string;
  base: string;
}

interface Task {
  file: string;
  data?: unknown;
  reason?: string;
  marker?: Marker;
  store: number;
}

interface Derivative {
  alias: string;
  mayExclude?: boolean;
  mustExclude?: boolean;
  aliasType: number;
  fromDependencies?: boolean;
}

// Note: as a developer, you can set the PKG_STRICT_VER variable.
//       this will turn on some assertion in the walker code below
//       to assert that each file content/state that we appending
//       to the virtual file system applies to  a real file,
//       not a symlink.
//       By default assertion are disabled as they can have a
//       performance hit.
const strictVerify = Boolean(process.env.PKG_STRICT_VER);

const win32 = process.platform === 'win32';

function unlikelyJavascript(file: string) {
  return ['.css', '.html', '.json'].includes(path.extname(file));
}

function isPublic(config: PackageJson) {
  if (config.private) {
    return false;
  }

  const { licenses } = config;
  let { license } = config;

  if (licenses) {
    license = licenses;
  }

  if (license && !Array.isArray(license)) {
    license = typeof license === 'string' ? license : license.type;
  }

  if (Array.isArray(license)) {
    license = license.map((c) => String(c.type || c)).join(',');
  }

  if (!license) {
    return false;
  }

  if (/^\(/.test(license)) {
    license = license.slice(1);
  }

  if (/\)$/.test(license)) {
    license = license.slice(0, -1);
  }

  license = license.toLowerCase();
  const allLicenses = Array.prototype.concat(
    license.split(' or '),
    license.split(' and '),
    license.split('/'),
    license.split(',')
  );
  let result = false;
  const foss = [
    'isc',
    'mit',
    'apache-2.0',
    'apache 2.0',
    'public domain',
    'bsd',
    'bsd-2-clause',
    'bsd-3-clause',
    'wtfpl',
    'cc-by-3.0',
    'x11',
    'artistic-2.0',
    'gplv3',
    'mpl',
    'mplv2.0',
    'unlicense',
    'apache license 2.0',
    'zlib',
    'mpl-2.0',
    'nasa-1.3',
    'apache license, version 2.0',
    'lgpl-2.1+',
    'cc0-1.0',
  ];

  for (const c of allLicenses) {
    result = foss.indexOf(c) >= 0;

    if (result) {
      break;
    }
  }

  return result;
}

function upon(p: string, base: string) {
  if (typeof p !== 'string') {
    throw wasReported('Config items must be strings. See examples');
  }

  let negate = false;

  if (p[0] === '!') {
    p = p.slice(1);
    negate = true;
  }

  p = path.join(base, p);

  if (win32) {
    p = p.replace(/\\/g, '/');
  }

  if (negate) {
    p = `!${p}`;
  }

  return p;
}

function collect(ps: string[]) {
  return globby.sync(ps, { dot: true });
}

function expandFiles(efs: string | string[], base: string) {
  if (!Array.isArray(efs)) {
    efs = [efs];
  }

  efs = collect(efs.map((p) => upon(p, base)));

  return efs;
}

async function stepRead(record: FileRecord) {
  if (strictVerify) {
    assert(record.file === toNormalizedRealPath(record.file));
  }

  let body;

  try {
    body = await fs.readFile(record.file);
  } catch (error) {
    log.error(`Cannot read file, ${error.code}`, record.file);
    throw wasReported(error);
  }

  record.body = body;
}

function stepStrip(record: FileRecord) {
  let body = (record.body || '').toString('utf8');

  if (/^\ufeff/.test(body)) {
    body = body.replace(/^\ufeff/, '');
  }

  if (/^#!/.test(body)) {
    body = body.replace(/^#![^\n]*\n/, '\n');
  }

  record.body = body;
}

function stepDetect(
  record: FileRecord,
  marker: Marker,
  derivatives: Derivative[]
) {
  let { body = '' } = record;

  if (body instanceof Buffer) {
    body = body.toString();
  }

  try {
    detector.detect(body, (node, trying) => {
      const { toplevel } = marker;
      let d = (detector.visitorSuccessful(node) as unknown) as Derivative;

      if (d) {
        if (d.mustExclude) {
          return false;
        }

        d.mayExclude = d.mayExclude || trying;
        derivatives.push(d);

        return false;
      }

      d = (detector.visitorNonLiteral(node) as unknown) as Derivative;

      if (d) {
        if (typeof d === 'object' && d.mustExclude) {
          return false;
        }

        const debug = !toplevel || d.mayExclude || trying;
        const level = debug ? 'debug' : 'warn';
        log[level](`Cannot resolve '${d.alias}'`, [
          record.file,
          'Dynamic require may fail at run time, because the requested file',
          'is unknown at compilation time and not included into executable.',
          "Use a string literal as an argument for 'require', or leave it",
          "as is and specify the resolved file name in 'scripts' option.",
        ]);
        return false;
      }

      d = (detector.visitorMalformed(node) as unknown) as Derivative;

      if (d) {
        // there is no 'mustExclude'
        const debug = !toplevel || trying;
        const level = debug ? 'debug' : 'warn'; // there is no 'mayExclude'
        log[level](`Malformed requirement for '${d.alias}'`, [record.file]);
        return false;
      }

      d = (detector.visitorUseSCWD(node) as unknown) as Derivative;

      if (d) {
        // there is no 'mustExclude'
        const level = 'debug'; // there is no 'mayExclude'
        log[level](`Path.resolve(${d.alias}) is ambiguous`, [
          record.file,
          "It resolves relatively to 'process.cwd' by default, however",
          "you may want to use 'path.dirname(require.main.filename)'",
        ]);

        return false;
      }

      return true; // can i go inside?
    });
  } catch (error) {
    log.error(error.message, record.file);
    throw wasReported(error);
  }
}

function findCommonJunctionPoint(file: string, realFile: string) {
  // find common denominator => where the link changes
  while (toNormalizedRealPath(path.dirname(file)) === path.dirname(realFile)) {
    file = path.dirname(file);
    realFile = path.dirname(realFile);
  }

  return { file, realFile };
}

export interface WalkerParams {
  publicToplevel?: boolean;
  publicPackages?: string[];
}

class Walker {
  private params: WalkerParams;

  private symLinks: SymLinks;

  private patches: Patches;

  private tasks: Task[];

  private records: FileRecords;

  private dictionary: ConfigDictionary;

  constructor() {
    this.tasks = [];
    this.records = {};
    this.dictionary = {};
    this.patches = {};
    this.params = {};
    this.symLinks = {};
  }

  appendRecord({ file, store }: Task) {
    if (this.records[file]) {
      return;
    }

    if (
      store === STORE_BLOB ||
      store === STORE_CONTENT ||
      store === STORE_LINKS
    ) {
      // make sure we have a real file
      if (strictVerify) {
        assert(file === toNormalizedRealPath(file));
      }
    }

    this.records[file] = { file };
  }

  private append(task: Task) {
    if (strictVerify) {
      assert(typeof task.file === 'string');
      assert(task.file === normalizePath(task.file));
    }

    this.appendRecord(task);
    this.tasks.push(task);

    const what = {
      [STORE_BLOB]: 'Bytecode of',
      [STORE_CONTENT]: 'Content of',
      [STORE_LINKS]: 'Directory',
      [STORE_STAT]: 'Stat info of',
    }[task.store];

    if (task.reason) {
      log.debug(
        `${what} ${task.file} is added to queue. It was required from ${task.reason}`
      );
    } else {
      log.debug(`${what} ${task.file} is added to queue.`);
    }
  }

  appendSymlink(file: string, realFile: string) {
    const a = findCommonJunctionPoint(file, realFile);
    file = a.file;
    realFile = a.realFile;

    if (!this.symLinks[file]) {
      const dn = path.dirname(file);
      this.appendFileInFolder({
        file: dn,
        store: STORE_LINKS,
        data: path.basename(file),
      });

      log.debug(`adding symlink ${file}  => ${path.relative(file, realFile)}`);
      this.symLinks[file] = realFile;

      this.appendStat({
        file: realFile,
        store: STORE_STAT,
      });
      this.appendStat({
        file: dn,
        store: STORE_STAT,
      });
      this.appendStat({
        file,
        store: STORE_STAT,
      });
    }
  }

  appendStat(task: Task) {
    assert(task.store === STORE_STAT);
    this.append(task);
  }

  appendFileInFolder(task: Task) {
    if (strictVerify) {
      assert(task.store === STORE_LINKS);
      assert(typeof task.file === 'string');
    }
    const realFile = toNormalizedRealPath(task.file);
    if (realFile === task.file) {
      this.append(task);
      return;
    }
    this.append({ ...task, file: realFile });
    this.appendStat({
      file: task.file,
      store: STORE_STAT,
    });
    this.appendStat({
      file: path.dirname(task.file),
      store: STORE_STAT,
    });
  }

  appendBlobOrContent(task: Task) {
    if (strictVerify) {
      assert(task.file === normalizePath(task.file));
    }

    assert(task.store === STORE_BLOB || task.store === STORE_CONTENT);
    assert(typeof task.file === 'string');
    const realFile = toNormalizedRealPath(task.file);

    if (realFile === task.file) {
      this.append(task);
      return;
    }

    this.append({ ...task, file: realFile });
    this.appendSymlink(task.file, realFile);
    this.appendStat({
      file: task.file,
      store: STORE_STAT,
    });
  }

  async appendFilesFromConfig(marker: Marker) {
    const { config, configPath, base } = marker;
    const pkgConfig = config?.pkg;

    if (pkgConfig) {
      let { scripts } = pkgConfig;

      if (scripts) {
        scripts = expandFiles(scripts, base);

        for (const script of scripts) {
          const stat = await fs.stat(script);

          if (stat.isFile()) {
            if (!isDotJS(script) && !isDotJSON(script) && !isDotNODE(script)) {
              log.warn("Non-javascript file is specified in 'scripts'.", [
                'Pkg will probably fail to parse. Specify *.js in glob.',
                script,
              ]);
            }

            this.appendBlobOrContent({
              file: normalizePath(script),
              marker,
              store: STORE_BLOB,
              reason: configPath,
            });
          }
        }
      }

      let { assets } = pkgConfig;

      if (assets) {
        assets = expandFiles(assets, base);

        for (const asset of assets) {
          log.debug(' Adding asset : .... ', asset);
          const stat = await fs.stat(asset);

          if (stat.isFile()) {
            this.appendBlobOrContent({
              file: normalizePath(asset),
              marker,
              store: STORE_CONTENT,
              reason: configPath,
            });
          }
        }
      }
    } else if (config) {
      let { files } = config;

      if (files) {
        files = expandFiles(files, base);

        for (let file of files) {
          file = normalizePath(file);
          const stat = await fs.stat(file);

          if (stat.isFile()) {
            // 1) remove sources of top-level(!) package 'files' i.e. ship as BLOB
            // 2) non-source (non-js) files of top-level package are shipped as CONTENT
            // 3) parsing some js 'files' of non-top-level packages fails, hence all CONTENT
            if (marker.toplevel) {
              this.appendBlobOrContent({
                file,
                marker,
                store: isDotJS(file) ? STORE_BLOB : STORE_CONTENT,
                reason: configPath,
              });
            } else {
              this.appendBlobOrContent({
                file,
                marker,
                store: STORE_CONTENT,
                reason: configPath,
              });
            }
          }
        }
      }
    }
  }

  async stepActivate(marker: Marker, derivatives: Derivative[]) {
    if (!marker) {
      assert(false);
    }

    if (marker.activated) {
      return;
    }

    const { config, base } = marker;

    if (!config) {
      assert(false);
    }

    const { name } = config;

    if (name) {
      const d = this.dictionary[name];

      if (d) {
        if (
          typeof config.dependencies === 'object' &&
          typeof d.dependencies === 'object'
        ) {
          Object.assign(config.dependencies, d.dependencies);
          delete d.dependencies;
        }

        Object.assign(config, d);
        marker.hasDictionary = true;
      }
    }

    const { dependencies } = config;

    if (typeof dependencies === 'object') {
      for (const dependency in dependencies) {
        // it may be `undefined` - overridden
        // in dictionary (see publicsuffixlist)
        if (dependencies[dependency]) {
          derivatives.push({
            alias: dependency,
            aliasType: ALIAS_AS_RESOLVABLE,
            fromDependencies: true,
          });

          derivatives.push({
            alias: `${dependency}/package.json`,
            aliasType: ALIAS_AS_RESOLVABLE,
            fromDependencies: true,
          });
        }
      }
    }

    const pkgConfig = config.pkg;

    if (pkgConfig) {
      const { patches } = pkgConfig;

      if (patches) {
        for (const key in patches) {
          if (patches[key]) {
            const p = path.join(base, key);
            this.patches[p] = patches[key];
          }
        }
      }

      const { deployFiles } = pkgConfig;

      if (deployFiles) {
        marker.hasDeployFiles = true;

        for (const deployFile of deployFiles) {
          const type = deployFile[2] || 'file';
          log.warn(`Cannot include ${type} %1 into executable.`, [
            `The ${type} must be distributed with executable as %2.`,
            `%1: ${path.relative(
              process.cwd(),
              path.join(base, deployFile[0])
            )}`,
            `%2: path-to-executable/${deployFile[1]}`,
          ]);
        }
      }

      if (pkgConfig.log) {
        pkgConfig.log(log, { packagePath: base });
      }
    }

    await this.appendFilesFromConfig(marker);
    marker.public = isPublic(config);

    if (!marker.public && marker.toplevel) {
      marker.public = this.params.publicToplevel;
    }

    if (!marker.public && !marker.toplevel && this.params.publicPackages) {
      marker.public =
        this.params.publicPackages[0] === '*' ||
        (!!name && this.params.publicPackages.indexOf(name) !== -1);
    }

    marker.activated = true;
    // assert no further work with config
    delete marker.config;
  }

  hasPatch(record: FileRecord) {
    const patch = this.patches[record.file];

    if (!patch) {
      return;
    }

    return true;
  }

  stepPatch(record: FileRecord) {
    const patch = this.patches[record.file];

    if (!patch) {
      return;
    }

    let body = (record.body || '').toString('utf8');

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
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
        // function escapeRegExp
        const esc = patch[i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regexp = new RegExp(esc, 'g');
        body = body.replace(regexp, patch[i + 1]);
      }
    }

    record.body = body;
  }

  async stepDerivatives_ALIAS_AS_RELATIVE(
    record: FileRecord,
    marker: Marker,
    derivative: Derivative
  ) {
    const file = normalizePath(
      path.join(path.dirname(record.file), derivative.alias)
    );

    let stat;

    try {
      stat = await fs.stat(file);
    } catch (error) {
      const { toplevel } = marker;
      const debug = !toplevel && error.code === 'ENOENT';
      const level = debug ? 'debug' : 'warn';
      log[level](`Cannot stat, ${error.code}`, [
        file,
        `The file was required from '${record.file}'`,
      ]);
    }

    if (stat && stat.isFile()) {
      this.appendBlobOrContent({
        file,
        marker,
        store: STORE_CONTENT,
        reason: record.file,
      });
    }
  }

  async stepDerivatives_ALIAS_AS_RESOLVABLE(
    record: FileRecord,
    marker: Marker,
    derivative: Derivative
  ) {
    // eslint-disable-line camelcase
    const newPackages: { packageJson: string; marker?: Marker }[] = [];

    const catchReadFile = (file: string) => {
      assert(isPackageJson(file), `walker: ${file} must be package.json`);
      newPackages.push({ packageJson: file });
    };

    const catchPackageFilter = (config: PackageJson, base: string) => {
      const newPackage = newPackages[newPackages.length - 1];
      newPackage.marker = { config, configPath: newPackage.packageJson, base };
    };

    let newFile = '';
    let failure;

    const basedir = path.dirname(record.file);
    try {
      newFile = await follow(derivative.alias, {
        basedir,
        // default is extensions: ['.js'], but
        // it is not enough because 'typos.json'
        // is not taken in require('./typos')
        // in 'normalize-package-data/lib/fixer.js'
        extensions: ['.js', '.json', '.node'],
        readFile: catchReadFile,
        packageFilter: catchPackageFilter,
      });
    } catch (error) {
      failure = error;
    }

    if (failure) {
      const { toplevel } = marker;
      const mainNotFound =
        newPackages.length > 0 && !newPackages[0].marker?.config?.main;
      const debug =
        !toplevel ||
        derivative.mayExclude ||
        (mainNotFound && derivative.fromDependencies);
      const level = debug ? 'debug' : 'warn';

      if (mainNotFound) {
        const message = "Entry 'main' not found in %1";
        log[level](message, [
          `%1: ${newPackages[0].packageJson}`,
          `%2: ${record.file}`,
        ]);
      } else {
        log[level](`${chalk.yellow(failure.message)}  in ${record.file}`);
      }

      return;
    }

    let newPackageForNewRecords;

    for (const newPackage of newPackages) {
      let newFile2;

      try {
        newFile2 = await follow(derivative.alias, {
          basedir: path.dirname(record.file),
          extensions: ['.js', '.json', '.node'],
          ignoreFile: newPackage.packageJson,
        });
        if (strictVerify) {
          assert(newFile2 === normalizePath(newFile2));
        }
      } catch (_) {
        // not setting is enough
      }

      if (newFile2 !== newFile) {
        newPackageForNewRecords = newPackage;
        break;
      }
    }

    if (newPackageForNewRecords) {
      if (strictVerify) {
        assert(
          newPackageForNewRecords.packageJson ===
            normalizePath(newPackageForNewRecords.packageJson)
        );
      }
      this.appendBlobOrContent({
        file: newPackageForNewRecords.packageJson,
        marker: newPackageForNewRecords.marker,
        store: STORE_CONTENT,
        reason: record.file,
      });
    }

    this.appendBlobOrContent({
      file: newFile,
      marker: newPackageForNewRecords ? newPackageForNewRecords.marker : marker,
      store: STORE_BLOB,
      reason: record.file,
    });
  }

  async stepDerivatives(
    record: FileRecord,
    marker: Marker,
    derivatives: Derivative[]
  ) {
    for (const derivative of derivatives) {
      if (natives[derivative.alias]) continue;

      switch (derivative.aliasType) {
        case ALIAS_AS_RELATIVE:
          await this.stepDerivatives_ALIAS_AS_RELATIVE(
            record,
            marker,
            derivative
          );
          break;
        case ALIAS_AS_RESOLVABLE:
          await this.stepDerivatives_ALIAS_AS_RESOLVABLE(
            record,
            marker,
            derivative
          );
          break;
        default:
          assert(false, `walker: unknown aliasType ${derivative.aliasType}`);
      }
    }
  }

  async step_STORE_ANY(record: FileRecord, marker: Marker, store: number) {
    // eslint-disable-line camelcase
    if (strictVerify) {
      assert(record.file === toNormalizedRealPath(record.file));
    }
    if (record[store] !== undefined) return;
    record[store] = false; // default is discard

    this.appendStat({
      file: record.file,
      store: STORE_STAT,
    });

    const derivatives1: Derivative[] = [];
    await this.stepActivate(marker, derivatives1);
    await this.stepDerivatives(record, marker, derivatives1);

    if (store === STORE_BLOB) {
      if (unlikelyJavascript(record.file) || isDotNODE(record.file)) {
        this.appendBlobOrContent({
          file: record.file,
          marker,
          store: STORE_CONTENT,
        });
        return; // discard
      }

      if (marker.public || marker.hasDictionary) {
        this.appendBlobOrContent({
          file: record.file,
          marker,
          store: STORE_CONTENT,
        });
      }
    }

    if (store === STORE_BLOB || this.hasPatch(record)) {
      if (!record.body) {
        await stepRead(record);
        this.stepPatch(record);

        if (store === STORE_BLOB) {
          stepStrip(record);
        }
      }

      if (store === STORE_BLOB) {
        const derivatives2: Derivative[] = [];
        stepDetect(record, marker, derivatives2);
        await this.stepDerivatives(record, marker, derivatives2);
      }
    }

    record[store] = true;
  }

  step_STORE_LINKS(record: FileRecord, data: unknown) {
    if (strictVerify) {
      assert(
        record.file === toNormalizedRealPath(record.file),
        ' expecting real file !!!'
      );
    }

    if (record[STORE_LINKS]) {
      record[STORE_LINKS].push(data);
      return;
    }

    record[STORE_LINKS] = [data];

    if (record[STORE_STAT]) {
      return;
    }
    this.appendStat({
      file: record.file,
      store: STORE_STAT,
    });
  }

  async step_STORE_STAT(record: FileRecord) {
    if (record[STORE_STAT]) return;

    const realPath = toNormalizedRealPath(record.file);
    if (realPath !== record.file) {
      this.appendStat({
        file: realPath,
        store: STORE_STAT,
      });
    }

    try {
      const valueStat = await fs.stat(record.file);

      const value = {
        mode: valueStat.mode,
        size: valueStat.isFile() ? valueStat.size : 0,
        isFileValue: valueStat.isFile(),
        isDirectoryValue: valueStat.isDirectory(),
        isSocketValue: valueStat.isSocket(),
        isSymbolicLinkValue: valueStat.isSymbolicLink(),
      };
      record[STORE_STAT] = value;
    } catch (error) {
      log.error(`Cannot stat, ${error.code}`, record.file);
      throw wasReported(error);
    }

    if (path.dirname(record.file) !== record.file) {
      // root directory
      this.appendFileInFolder({
        file: path.dirname(record.file),
        store: STORE_LINKS,
        data: path.basename(record.file),
      });
    }
  }

  async step(task: Task) {
    const { file, store, data } = task;
    const record = this.records[file];

    switch (store) {
      case STORE_BLOB:
      case STORE_CONTENT:
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        await this.step_STORE_ANY(record, task.marker!, store);
        break;
      case STORE_LINKS:
        this.step_STORE_LINKS(record, data);
        break;
      case STORE_STAT:
        await this.step_STORE_STAT(record);
        break;
      default:
        assert(false, `walker: unknown store ${store}`);
    }
  }

  async readDictionary(marker: Marker) {
    const dd = path.join(__dirname, '../dictionary');
    const files = await fs.readdir(dd);

    for (const file of files) {
      if (/\.js$/.test(file)) {
        const name = file.slice(0, -3);
        // eslint-disable-next-line import/no-dynamic-require, global-require, @typescript-eslint/no-var-requires
        const config = require(path.join(dd, file));
        this.dictionary[name] = config;
      }
    }

    const pkgConfig = marker.config?.pkg;

    if (pkgConfig) {
      const { dictionary } = pkgConfig;

      if (dictionary) {
        for (const name in dictionary) {
          if (dictionary[name]) {
            this.dictionary[name] = { pkg: dictionary[name] };
          }
        }
      }
    }
  }

  async start(
    marker: Marker,
    entrypoint: string,
    addition: string | undefined,
    params: WalkerParams
  ) {
    this.params = params;
    this.symLinks = {};

    await this.readDictionary(marker);

    entrypoint = normalizePath(entrypoint);

    this.appendBlobOrContent({
      file: entrypoint,
      marker,
      store: STORE_BLOB,
    });

    if (addition) {
      addition = normalizePath(addition);
      this.appendBlobOrContent({
        file: addition,
        marker,
        store: STORE_CONTENT,
      });
    }

    const { tasks } = this;

    for (let i = 0; i < tasks.length; i += 1) {
      // NO MULTIPLE WORKERS! THIS WILL LEAD TO NON-DETERMINISTIC
      // ORDER. one-by-one fifo is the only way to iterate tasks
      await this.step(tasks[i]);
    }

    return {
      symLinks: this.symLinks,
      records: this.records,
      entrypoint: normalizePath(entrypoint),
    };
  }
}

export default async function walker(...args: Parameters<Walker['start']>) {
  const w = new Walker();
  return w.start(...args);
}
