import { ALIAS_AS_RELATIVE, ALIAS_AS_RESOLVABLE,
  STORE_BLOB, STORE_CONTENT, STORE_LINKS, STORE_STAT,
  isDotJS, isDotJSON, isDotNODE, isPackageJson, normalizePath
} from '../prelude/common.js';

import { log, wasReported } from './log.js';
import assert from 'assert';
import detector from './detector.js';
import follow from './follow.js';
import fs from 'fs-extra';
import globby from 'globby';
import natives from './natives.js';
import path from 'path';

function shortFromAlias (alias) {
  // alias = fs-promise or @types/node
  if (alias[0] === '@') {
    return alias.match(/^([^\\\/]+[\\\/][^\\\/]+)/)[0];
  } else {
    return alias.match(/^[^\\\/]+/)[0];
  }
}

function isPermissive (config) {
  if (config.private) return false;
  let { license, licenses } = config;
  if (!license && licenses) license = licenses[0];
  if (typeof license === 'object') license = license.type;
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
    'cc-by-3.0', 'x11', 'artistic-2.0', 'gplv3', 'mpl', 'mplv2.0' ];
  for (const c of licenses) {
    result = foss.indexOf(c) >= 0;
    if (result) break;
  }
  return result;
}

function upon (p, base) {
  if (typeof p !== 'string') {
    throw wasReported(
      'Config items must be strings. See examples.'
    );
  }
  let negate = false;
  if (p[0] === '!') {
    p = p.slice(1);
    negate = true;
  }
  if (!path.isAbsolute(p)) {
    p = path.join(base, p);
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
  efs = efs.concat(
    efs.map(ef =>
      // npm/node_modules/fstream-npm/fstream-npm.js
      // Packer.prototype.readRules
      ef.replace(/\/+$/, '') + '/**'
    )
  );
  efs = collect(
    efs.map(p => upon(p, base))
  );
  return efs;
}

class Walker {
  appendSub (r, key) {
    this.recordsMap[key] = r;
    this.records.push(r);
    if (r.reason) {
      log.debug('File %1 added to queue. It was required from %2', [ r.file, r.reason ]);
    } else {
      log.debug('File %1 added to queue', [ r.file ]);
    }
  }

  append (r) {
    r.file = normalizePath(r.file);
    const key = JSON.stringify([
      r.file, r.store.toString()
    ]);
    const prev = this.recordsMap[key];
    if (!prev) return this.appendSub(r, key);
    if (r.store === STORE_CONTENT) {
      if (r.treatAsBLOB && !prev.treatAsBLOB) {
        prev.discard = true;
        this.appendSub(r, key);
      }
    } else
    if (r.store === STORE_LINKS) {
      assert(prev.body, 'walker: expected body for STORE_LINKS');
      assert(r.body.length === 1, 'walker: expected body length 1');
      prev.body.push(r.body[0]);
    }
  }

  async appendFilesFromConfig (marker) {
    const { config, base } = marker;
    const pkgConfig = config.pkg;

    if (pkgConfig) {
      let { scripts } = pkgConfig;

      if (scripts) {
        scripts = expandFiles(scripts, base);
        for (const script of scripts) {
          const stat = await fs.stat(script);
          if (stat.isFile()) {
            this.append({
              file: script,
              marker: marker,
              store: STORE_BLOB
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
              marker: marker,
              store: STORE_CONTENT
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
            // 3) parsing all js 'files' of non-top-level packages fails, hence CONTENT
            if (marker.toplevel) {
              this.append({
                file: file,
                marker: marker,
                store: isDotJS(file) ? STORE_BLOB : STORE_CONTENT
              });
            } else {
              this.append({
                file: file,
                marker: marker,
                store: STORE_CONTENT
              });
            }
          }
        }
      }
    }
  }

  async stepActivate (record, derivatives) {
    const { marker } = record;
    if (!marker) assert(false);
    if (marker.activated) return;
    const { config } = marker;
    if (!config) assert(false);

    const { name } = config;
    if (name) {
      const d = this.dictionaries[name];
      if (d) {
        if (typeof config.dependencies === 'object' &&
            typeof d.dependencies === 'object') {
          Object.assign(config.dependencies, d.dependencies);
          delete d.dependencies;
        }
        Object.assign(config, d);
        marker.dictionary = true;
      }
    }

    const pkgConfig = config.pkg;
    if (pkgConfig) {
      const { patches } = pkgConfig;
      if (patches) {
        for (const key in patches) {
          const p = path.join(marker.base, key);
          this.patches[p] = patches[key];
        }
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
            aliasType: ALIAS_AS_RESOLVABLE
          });
        }
      }
    }

    await this.appendFilesFromConfig(marker);
    marker.permissive = isPermissive(config);
    marker.activated = true;
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

  stepDetect (record, derivatives) {
    const body = record.body;

    try {
      detector.detect(body, (node, trying) => {
        const { dictionary } = record.marker;
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
          const debug = dictionary || d.mayExclude || trying;
          const level = debug ? 'debug' : 'warn';
          log[level](`Cannot resolve '${d.alias}'`, [ record.file,
            'Use a string literal as argument for \'require\', or leave it',
            'as is and specify the resolved file name in \'scripts\' option.' ]);
          return false;
        }
        d = detector.visitor_MALFORMED(node);
        if (d) {
          // there is no 'mustExclude'
          const debug = dictionary || trying;
          const level = debug ? 'debug' : 'warn'; // there is no 'mayExclude'
          log[level](`Malformed requirement '${d.alias}'`, [ record.file ]);
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

  async stepDerivatives_ALIAS_AS_RELATIVE (record, derivative) { // eslint-disable-line camelcase
    const file = path.join(
      path.dirname(record.file),
      derivative.alias
    );

    let stat;
    try {
      stat = await fs.stat(file);
    } catch (error) {
      log.error('Cannot stat, ' + error.code, [ file,
        'The file was required from \'' + record.file + '\'' ]);
      throw wasReported(error);
    }

    if (stat.isFile()) {
      this.append({
        file: file,
        marker: record.marker,
        store: STORE_CONTENT,
        reason: record.file
      });
    }
  }

  async stepDerivatives_ALIAS_AS_RESOLVABLE (record, derivative) { // eslint-disable-line camelcase
    const catcher = {};
    let stage = 0;
    let newPackage;
    let newMarker;

    catcher.readFileSync = file => {
      // only first occurence from loadNodeModulesSync
      if (stage === 2) return;
      assert(stage === 0);
      assert(isPackageJson(file), 'walker: ' +
        file + ' must be package.json');
      newPackage = file;
      newMarker = undefined;
      stage = 1;
      return fs.readFileSync(file);
    };

    catcher.packageFilter = (config, base) => {
      assert(stage === 1);
      newMarker = { config, base };
      stage = 2;
      return config;
    };

    let newFile1, failure;

    try {
      newFile1 = await follow(derivative.alias, {
        basedir: path.dirname(record.file),
        // default is extensions: ['.js'], but
        // it is not enough because 'typos.json'
        // is not taken in require('./typos')
        // in 'normalize-package-data/lib/fixer.js'
        extensions: [ '.js', '.json', '.node' ],
        readFileSync: catcher.readFileSync,
        packageFilter: catcher.packageFilter
      });
    } catch (error) {
      failure = error;
    }

    // was taken from resolve/lib/sync.js
    const isNear = /^(?:\.\.?(?:\/|$)|\/|([A-Za-z]:)?[\\\/])/;
    let mainNotFound = false;

    if (!isNear.test(derivative.alias)) {
      const short = shortFromAlias(derivative.alias);
      // 'npm' !== 'npm/bin/npm-cli.js'
      if (short !== derivative.alias) {
        try {
          await follow(short, {
            basedir: path.dirname(record.file),
            extensions: [ '.js', '.json', '.node' ],
            readFileSync: catcher.readFileSync,
            packageFilter: catcher.packageFilter
          });
        } catch (error) {
          // the purpose is to fire 'packageFilter'
          // in cases like require('npm/bin/npm-cli.js')
          // because otherwise it will not be fired
          // (only loadAsFileSync is executed)
        }
      }
      // 'babel-runtime' === 'babel-runtime'
      if (short === derivative.alias) {
        // 1) not near 2) pure package name as alias
        // 3) failure to obtain 'main' entry file
        // 4) on the other hand newPackage is ok
        // this means we deal with babel-runtime-like
        // main-less package. hence no warnings
        mainNotFound = failure && newPackage;
      }
    }

    assert((newPackage && newMarker) ||
           (!newPackage && !newMarker), 'Probably, package.json is malformed');

    if (newPackage) {
      this.append({
        file: newPackage,
        marker: newMarker,
        store: STORE_CONTENT,
        reason: record.file
      });
    }

    if (failure) {
      let { message } = failure;
      if (mainNotFound && newMarker.config) {
        const { name } = newMarker.config.name;
        message = `Package.json.main entry not found in ${name}`;
      }
      const { dictionary } = record.marker;
      const debug = dictionary || derivative.mayExclude || mainNotFound;
      const level = debug ? 'debug' : 'warn';
      log[level](message, [ record.file ]);
      return;
    }

    this.append({
      file: newFile1,
      marker: newMarker || record.marker,
      store: STORE_BLOB,
      reason: record.file
    });
  }

  async stepDerivatives (record, derivatives) {
    for (const derivative of derivatives) {
      if (natives[derivative.alias]) continue;

      if (derivative.aliasType === ALIAS_AS_RELATIVE) {
        await this.stepDerivatives_ALIAS_AS_RELATIVE(record, derivative);
      } else
      if (derivative.aliasType === ALIAS_AS_RESOLVABLE) {
        await this.stepDerivatives_ALIAS_AS_RESOLVABLE(record, derivative);
      } else {
        assert(false, 'walker: unknown aliasType ' + derivative.aliasType);
      }
    }
  }

  async step_STORE_ANY (record) { // eslint-disable-line camelcase
    assert(typeof record.body === 'undefined',
      'walker: unexpected body ' + record.file);

    if (isDotNODE(record.file)) {
      record.discard = true;
      log.warn('Cannot include native addon into executable.', [ record.file,
        'The addon file must be distributed with executable.' ]);
      return;
    }

    const derivatives1 = [];
    await this.stepActivate(record, derivatives1);
    await this.stepDerivatives(record, derivatives1);

    if (record.store === STORE_BLOB) {
      if (isDotJSON(record.file)) {
        this.append({
          file: record.file,
          marker: record.marker,
          store: STORE_CONTENT
        });
        record.discard = true;
        return;
      }

      if (record.marker.permissive ||
          record.marker.dictionary) { // ejs 0.8.8 has no license field
        this.append({
          file: record.file,
          marker: record.marker,
          store: STORE_CONTENT,
          treatAsBLOB: true
        });
        record.discard = true;
        return;
      }
    }

    this.append({
      file: record.file,
      marker: record.marker,
      store: STORE_STAT
    });

    await this.stepRead(record);
    this.stepPatch(record);

    if (record.treatAsBLOB ||
        record.store === STORE_BLOB) {
      this.stepStrip(record);
      const derivatives2 = [];
      this.stepDetect(record, derivatives2);
      await this.stepDerivatives(record, derivatives2);
    }
  }

  step_STORE_LINKS (record) { // eslint-disable-line camelcase
    assert(typeof record.body !== 'undefined',
      'walker: expected body ' + record.file);

    this.append({
      file: record.file,
      marker: record.marker,
      store: STORE_STAT
    });
  }

  async step_STORE_STAT (record) { // eslint-disable-line camelcase
    assert(typeof record.body === 'undefined',
      'walker: unexpected body ' + record.file);

    let body;
    try {
      body = await fs.stat(record.file);
    } catch (error) {
      log.error('Cannot stat, ' + error.code, record.file);
      throw wasReported(error);
    }

    if (path.dirname(record.file) !== record.file) { // root directory
      this.append({
        file: path.dirname(record.file),
        marker: record.marker,
        store: STORE_LINKS,
        body: [ path.basename(record.file) ]
      });
    }

    record.body = body;
  }

  async step (record) {
    if (record.store === STORE_BLOB) {
      await this.step_STORE_ANY(record);
    } else
    if (record.store === STORE_CONTENT) {
      await this.step_STORE_ANY(record);
    } else
    if (record.store === STORE_LINKS) {
      this.step_STORE_LINKS(record);
    } else
    if (record.store === STORE_STAT) {
      await this.step_STORE_STAT(record);
    } else {
      assert(false, 'walker: unknown store ' + record.store);
    }
  }

  async readDictionaries () {
    const dd = path.join(__dirname, '../dictionary');
    const files = await fs.readdir(dd);

    for (const file of files) {
      if (/\.js$/.test(file)) {
        const name = file.slice(0, -3);
        const config = require(path.join(dd, file));
        this.dictionaries[name] = config;
      }
    }
  }

  async start (opts) {
    const { marker, input } = opts;
    marker.toplevel = true;

    this.records = [];
    this.recordsMap = {};
    this.dictionaries = {};
    this.patches = {};

    await this.readDictionaries();

    this.append({
      file: input,
      marker: marker,
      store: STORE_BLOB,
      entrypoint: true
    });

    const records = this.records;
    for (let i = 0; i < records.length; i += 1) {
      // NO MULTIPLE WORKERS! THIS WILL LEAD TO NON-DETERMINISTIC
      // ORDER. one-by-one fifo is the only way to iterate records
      await this.step(records[i]);
    }

    return this.records;
  }
}

export default async function (opts) {
  const w = new Walker();
  return await w.start(opts);
}
