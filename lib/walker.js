/* eslint-disable require-atomic-updates */

import { ALIAS_AS_RELATIVE, ALIAS_AS_RESOLVABLE,
  STORE_BLOB, STORE_CONTENT, STORE_LINKS, STORE_STAT,
  isDotJS, isDotJSON, isDotNODE, isPackageJson, normalizePath
} from '../prelude/common.js';

import { follow, natives } from './follow.js';
import { log, wasReported } from './log.js';
import assert from 'assert';
import detector from './detector.js';
import fs from 'fs-extra';
import globby from 'globby';
import path from 'path';

const win32 = process.platform === 'win32';

function unlikelyJavascript (file) {
  return [ '.css', '.html', '.json' ].includes(path.extname(file));
}

function isPublic (config) {
  if (config.private) return false;
  let { license, licenses } = config;
  if (licenses) {
    license = licenses;
  }
  if (license) {
    license = license.type || license;
  }
  if (Array.isArray(license)) {
    license = license.map((c) => String(c.type || c)).join(',');
  }
  if (!license) return false;
  if (/^\(/.test(license)) license = license.slice(1);
  if (/\)$/.test(license)) license = license.slice(0, -1);
  license = license.toLowerCase();
  licenses = Array.prototype.concat(
    license.split(' or '), license.split(' and '),
    license.split('/'), license.split(',')
  );
  let result = false;
  const foss = [ 'isc', 'mit', 'apache-2.0', 'apache 2.0',
    'public domain', 'bsd', 'bsd-2-clause', 'bsd-3-clause', 'wtfpl',
    'cc-by-3.0', 'x11', 'artistic-2.0', 'gplv3', 'mpl', 'mplv2.0',
    'unlicense', 'apache license 2.0', 'zlib', 'mpl-2.0', 'nasa-1.3',
    'apache license, version 2.0', 'lgpl-2.1+', 'cc0-1.0' ];
  for (const c of licenses) {
    result = foss.indexOf(c) >= 0;
    if (result) break;
  }
  return result;
}

function upon (p, base) {
  if (typeof p !== 'string') {
    throw wasReported(
      'Config items must be strings. See examples'
    );
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
    p = '!' + p;
  }
  return p;
}

function collect (ps) {
  return globby.sync(
    ps, { dot: true }
  );
}

function expandFiles (efs, base) {
  if (!Array.isArray(efs)) {
    efs = [ efs ];
  }
  efs = collect(
    efs.map((p) => upon(p, base))
  );
  return efs;
}

class Walker {
  appendRecord (task) {
    const { file } = task;
    if (this.records[file]) return;
    this.records[file] = { file };
  }

  append (task) {
    task.file = normalizePath(task.file);
    this.appendRecord(task);
    this.tasks.push(task);

    const what = {
      [STORE_BLOB]: 'Bytecode of',
      [STORE_CONTENT]: 'Content of',
      [STORE_LINKS]: 'Directory',
      [STORE_STAT]: 'Stat info of'
    }[task.store];
    if (task.reason) {
      log.debug(what + ' %1 is added to queue. It was required from %2',
        [ '%1: ' + task.file, '%2: ' + task.reason ]);
    } else {
      log.debug(what + ' %1 is added to queue', [ '%1: ' + task.file ]);
    }
  }

  async appendFilesFromConfig (marker) {
    const { config, configPath, base } = marker;
    const pkgConfig = config.pkg;

    if (pkgConfig) {
      let { scripts } = pkgConfig;

      if (scripts) {
        scripts = expandFiles(scripts, base);
        for (const script of scripts) {
          const stat = await fs.stat(script);
          if (stat.isFile()) {
            if (!isDotJS(script) && !isDotJSON(script) & !isDotNODE(script)) {
              log.warn('Non-javascript file is specified in \'scripts\'.', [
                'Pkg will probably fail to parse. Specify *.js in glob.',
                script ]);
            }

            this.append({
              file: script,
              marker,
              store: STORE_BLOB,
              reason: configPath
            });
          }
        }
      }

      let { assets } = pkgConfig;

      if (assets) {
        assets = expandFiles(assets, base);
        for (const asset of assets) {
          const stat = await fs.stat(asset);
          if (stat.isFile()) {
            this.append({
              file: asset,
              marker,
              store: STORE_CONTENT,
              reason: configPath
            });
          }
        }
      }
    } else {
      let { files } = config;

      if (files) {
        files = expandFiles(files, base);
        for (const file of files) {
          const stat = await fs.stat(file);
          if (stat.isFile()) {
            // 1) remove sources of top-level(!) package 'files' i.e. ship as BLOB
            // 2) non-source (non-js) files of top-level package are shipped as CONTENT
            // 3) parsing some js 'files' of non-top-level packages fails, hence all CONTENT
            if (marker.toplevel) {
              this.append({
                file,
                marker,
                store: isDotJS(file) ? STORE_BLOB : STORE_CONTENT,
                reason: configPath
              });
            } else {
              this.append({
                file,
                marker,
                store: STORE_CONTENT,
                reason: configPath
              });
            }
          }
        }
      }
    }
  }

  async stepActivate (marker, derivatives) {
    if (!marker) assert(false);
    if (marker.activated) return;
    const { config, base } = marker;
    if (!config) assert(false);

    const { name } = config;
    if (name) {
      const d = this.dictionary[name];
      if (d) {
        if (typeof config.dependencies === 'object' &&
            typeof d.dependencies === 'object') {
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
            fromDependencies: true
          });

          derivatives.push({
            alias: dependency + '/package.json',
            aliasType: ALIAS_AS_RESOLVABLE,
            fromDependencies: true
          });
        }
      }
    }

    const pkgConfig = config.pkg;
    if (pkgConfig) {
      const { patches } = pkgConfig;
      if (patches) {
        for (const key in patches) {
          const p = path.join(base, key);
          this.patches[p] = patches[key];
        }
      }

      const { deployFiles } = pkgConfig;
      if (deployFiles) {
        marker.hasDeployFiles = true;
        for (const deployFile of deployFiles) {
          const type = deployFile[2] || 'file';
          log.warn(`Cannot include ${type} %1 into executable.`, [
            `The ${type} must be distributed with executable as %2.`,
            '%1: ' + path.relative(process.cwd(), path.join(base, deployFile[0])),
            '%2: path-to-executable/' + deployFile[1] ]);
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
      marker.public = (this.params.publicPackages[0] === '*') ||
        (this.params.publicPackages.indexOf(name) !== -1);
    }

    marker.activated = true;
    // assert no further work with config
    delete marker.config;
  }

  async stepRead (record) {
    let body;

    try {
      body = await fs.readFile(record.file);
    } catch (error) {
      log.error('Cannot read file, ' + error.code, record.file);
      throw wasReported(error);
    }

    record.body = body;
  }

  hasPatch (record) {
    const patch = this.patches[record.file];
    if (!patch) return;
    return true;
  }

  stepPatch (record) {
    const patch = this.patches[record.file];
    if (!patch) return;

    let body = record.body.toString('utf8');

    for (let i = 0; i < patch.length; i += 2) {
      if (typeof patch[i] === 'object') {
        if (patch[i].do === 'erase') {
          body = patch[i + 1];
        } else
        if (patch[i].do === 'prepend') {
          body = patch[i + 1] + body;
        } else
        if (patch[i].do === 'append') {
          body += patch[i + 1];
        }
      } else
      if (typeof patch[i] === 'string') {
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
        // function escapeRegExp
        const esc = patch[i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regexp = new RegExp(esc, 'g');
        body = body.replace(regexp, patch[i + 1]);
      }
    }

    record.body = body;
  }

  stepStrip (record) {
    let body = record.body.toString('utf8');

    if (/^\ufeff/.test(body)) {
      body = body.replace(/^\ufeff/, '');
    }
    if (/^#!/.test(body)) {
      body = body.replace(/^#![^\n]*\n/, '\n');
    }

    record.body = body;
  }

  stepDetect (record, marker, derivatives) {
    const body = record.body;

    try {
      detector.detect(body, (node, trying) => {
        const { toplevel } = marker;
        let d = detector.visitor_SUCCESSFUL(node);
        if (d) {
          if (d.mustExclude) return false;
          d.mayExclude = d.mayExclude || trying;
          derivatives.push(d);
          return false;
        }
        d = detector.visitor_NONLITERAL(node);
        if (d) {
          if (d.mustExclude) return false;
          const debug = !toplevel || d.mayExclude || trying;
          const level = debug ? 'debug' : 'warn';
          log[level](`Cannot resolve '${d.alias}'`, [ record.file,
            'Dynamic require may fail at run time, because the requested file',
            'is unknown at compilation time and not included into executable.',
            'Use a string literal as an argument for \'require\', or leave it',
            'as is and specify the resolved file name in \'scripts\' option.' ]);
          return false;
        }
        d = detector.visitor_MALFORMED(node);
        if (d) {
          // there is no 'mustExclude'
          const debug = !toplevel || trying;
          const level = debug ? 'debug' : 'warn'; // there is no 'mayExclude'
          log[level](`Malformed requirement for '${d.alias}'`, [ record.file ]);
          return false;
        }
        d = detector.visitor_USESCWD(node);
        if (d) {
          // there is no 'mustExclude'
          const level = 'debug'; // there is no 'mayExclude'
          log[level](`Path.resolve(${d.alias}) is ambiguous`, [ record.file,
            'It resolves relatively to \'process.cwd\' by default, however',
            'you may want to use \'path.dirname(require.main.filename)\'' ]);
          return false;
        }
        return true; // can i go inside?
      });
    } catch (error) {
      log.error(error.message, record.file);
      throw wasReported(error);
    }
  }

  async stepDerivatives_ALIAS_AS_RELATIVE (record, marker, derivative) { // eslint-disable-line camelcase
    const file = path.join(
      path.dirname(record.file),
      derivative.alias
    );

    let stat;

    try {
      stat = await fs.stat(file);
    } catch (error) {
      const { toplevel } = marker;
      const debug = !toplevel && error.code === 'ENOENT';
      const level = debug ? 'debug' : 'warn';
      log[level]('Cannot stat, ' + error.code, [ file,
        'The file was required from \'' + record.file + '\'' ]);
    }

    if (stat && stat.isFile()) {
      this.append({
        file,
        marker,
        store: STORE_CONTENT,
        reason: record.file
      });
    }
  }

  async stepDerivatives_ALIAS_AS_RESOLVABLE (record, marker, derivative) { // eslint-disable-line camelcase
    const newPackages = [];

    const catchReadFile = (file) => {
      assert(isPackageJson(file), 'walker: ' +
        file + ' must be package.json');
      newPackages.push({ packageJson: file });
    };

    const catchPackageFilter = (config, base) => {
      const newPackage = newPackages[newPackages.length - 1];
      newPackage.marker = { config, configPath: newPackage.packageJson, base };
    };

    let newFile, failure;

    try {
      newFile = await follow(derivative.alias, {
        basedir: path.dirname(record.file),
        // default is extensions: ['.js'], but
        // it is not enough because 'typos.json'
        // is not taken in require('./typos')
        // in 'normalize-package-data/lib/fixer.js'
        extensions: [ '.js', '.json', '.node' ],
        readFile: catchReadFile,
        packageFilter: catchPackageFilter
      });
    } catch (error) {
      failure = error;
    }

    if (failure) {
      const { toplevel } = marker;
      const mainNotFound = newPackages.length > 0 && !newPackages[0].marker.config.main;
      const debug = !toplevel || derivative.mayExclude ||
        (mainNotFound && derivative.fromDependencies);
      const level = debug ? 'debug' : 'warn';
      if (mainNotFound) {
        const message = 'Entry \'main\' not found in %1';
        log[level](message, [ '%1: ' + newPackages[0].packageJson, '%2: ' + record.file ]);
      } else {
        log[level](failure.message, [ '%1: ' + record.file ]);
      }
      return;
    }

    let newPackageForNewRecords;

    for (const newPackage of newPackages) {
      let newFile2;

      try {
        newFile2 = await follow(derivative.alias, {
          basedir: path.dirname(record.file),
          extensions: [ '.js', '.json', '.node' ],
          ignoreFile: newPackage.packageJson
        });
      } catch (_) {
        // not setting is enough
      }

      if (newFile2 !== newFile) {
        newPackageForNewRecords = newPackage;
        break;
      }
    }

    if (newPackageForNewRecords) {
      this.append({
        file: newPackageForNewRecords.packageJson,
        marker: newPackageForNewRecords.marker,
        store: STORE_CONTENT,
        reason: record.file
      });
    }

    this.append({
      file: newFile,
      marker: newPackageForNewRecords ? newPackageForNewRecords.marker : marker,
      store: STORE_BLOB,
      reason: record.file
    });
  }

  async stepDerivatives (record, marker, derivatives) {
    for (const derivative of derivatives) {
      if (natives[derivative.alias]) continue;

      if (derivative.aliasType === ALIAS_AS_RELATIVE) {
        await this.stepDerivatives_ALIAS_AS_RELATIVE(record, marker, derivative);
      } else
      if (derivative.aliasType === ALIAS_AS_RESOLVABLE) {
        await this.stepDerivatives_ALIAS_AS_RESOLVABLE(record, marker, derivative);
      } else {
        assert(false, 'walker: unknown aliasType ' + derivative.aliasType);
      }
    }
  }

  async step_STORE_ANY (record, marker, store) { // eslint-disable-line camelcase
    if (record[store] !== undefined) return;
    record[store] = false; // default is discard

    this.append({
      file: record.file,
      store: STORE_STAT
    });

    if (isDotNODE(record.file)) {
      // provide explicit deployFiles to override
      // native addon deployment place. see 'sharp'
      if (!marker.hasDeployFiles) {
        log.warn('Cannot include addon %1 into executable.', [
          'The addon must be distributed with executable as %2.',
          '%1: ' + record.file,
          '%2: path-to-executable/' + path.basename(record.file) ]);
      }
      return; // discard
    }

    const derivatives1 = [];
    await this.stepActivate(marker, derivatives1);
    await this.stepDerivatives(record, marker, derivatives1);

    if (store === STORE_BLOB) {
      if (unlikelyJavascript(record.file)) {
        this.append({
          file: record.file,
          marker,
          store: STORE_CONTENT
        });
        return; // discard
      }

      if (marker.public ||
          marker.hasDictionary) {
        this.append({
          file: record.file,
          marker,
          store: STORE_CONTENT
        });
      }
    }

    if (store === STORE_BLOB ||
        this.hasPatch(record)) {
      if (!record.body) {
        await this.stepRead(record);
        this.stepPatch(record);
        if (store === STORE_BLOB) {
          this.stepStrip(record);
        }
      }

      if (store === STORE_BLOB) {
        const derivatives2 = [];
        this.stepDetect(record, marker, derivatives2);
        await this.stepDerivatives(record, marker, derivatives2);
      }
    }

    record[store] = true;
  }

  step_STORE_LINKS (record, data) { // eslint-disable-line camelcase
    if (record[STORE_LINKS]) {
      record[STORE_LINKS].push(data);
      return;
    }

    record[STORE_LINKS] = [ data ];

    this.append({
      file: record.file,
      store: STORE_STAT
    });
  }

  async step_STORE_STAT (record) { // eslint-disable-line camelcase
    if (record[STORE_STAT]) return;

    try {
      record[STORE_STAT] = await fs.stat(record.file);
    } catch (error) {
      log.error('Cannot stat, ' + error.code, record.file);
      throw wasReported(error);
    }

    if (path.dirname(record.file) !== record.file) { // root directory
      this.append({
        file: path.dirname(record.file),
        store: STORE_LINKS,
        data: path.basename(record.file)
      });
    }
  }

  async step (task) {
    const { file, store, data } = task;
    const record = this.records[file];
    if (store === STORE_BLOB ||
        store === STORE_CONTENT) {
      await this.step_STORE_ANY(record, task.marker, store);
    } else
    if (store === STORE_LINKS) {
      this.step_STORE_LINKS(record, data);
    } else
    if (store === STORE_STAT) {
      await this.step_STORE_STAT(record);
    } else {
      assert(false, 'walker: unknown store ' + store);
    }
  }

  async readDictionary (marker) {
    const dd = path.join(__dirname, '../dictionary');
    const files = await fs.readdir(dd);

    for (const file of files) {
      if (/\.js$/.test(file)) {
        const name = file.slice(0, -3);
        const config = require(path.join(dd, file));
        this.dictionary[name] = config;
      }
    }

    const pkgConfig = marker.config.pkg;
    if (pkgConfig) {
      const { dictionary } = pkgConfig;
      if (dictionary) {
        for (const name in dictionary) {
          this.dictionary[name] = { pkg: dictionary[name] };
        }
      }
    }
  }

  async start (marker, entrypoint, addition, params) {
    this.tasks = [];
    this.records = {};
    this.dictionary = {};
    this.patches = {};
    this.params = params;

    await this.readDictionary(marker);

    this.append({
      file: entrypoint,
      marker,
      store: STORE_BLOB
    });

    if (addition) {
      this.append({
        file: addition,
        marker,
        store: STORE_CONTENT
      });
    }

    const tasks = this.tasks;
    for (let i = 0; i < tasks.length; i += 1) {
      // NO MULTIPLE WORKERS! THIS WILL LEAD TO NON-DETERMINISTIC
      // ORDER. one-by-one fifo is the only way to iterate tasks
      await this.step(tasks[i]);
    }

    return {
      records: this.records,
      entrypoint: normalizePath(entrypoint)
    };
  }
}

export default async function (...args) {
  const w = new Walker();
  return await w.start(...args);
}
