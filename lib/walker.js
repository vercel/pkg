import { ALIAS_AS_RELATIVE, ALIAS_AS_RESOLVABLE,
  STORE_CODE, STORE_CONTENT, STORE_LINKS, STORE_STAT,
  isDotJS, isDotNODE, isPackageJson, normalizePath
} from '../runtime/common.js';

import assert from 'assert';
import detector from './detector.js';
import follow from './follow.js';
import fs from 'fs-promise';
import globby from 'globby';
import minimatch from 'minimatch';
import natives from './natives.js';
import path from 'path';
import reporter from './reporter.js';

function isPermissive (config) {
  if (config.private) return false;
  let { license } = config;
  if (typeof license === 'object') license = license.type;
  if (!license) return false;
  if (/^\(/.test(license)) license = license.slice(1);
  if (/\)$/.test(license)) license = license.slice(0, -1);
  license = license.toLowerCase();
  const licenses = Array.prototype.concat(
    license.split(' or '), license.split(' and '),
    license.split('/'), license.split(',')
  );
  let result = false;
  const foss = [ 'isc', 'mit', 'apache-2.0', 'apache 2.0',
    'public domain', 'bsd', 'bsd-2-clause', 'bsd-3-clause', 'wtfpl',
    'cc-by-3.0', 'x11', 'artistic-2.0', 'gplv3', 'mplv2.0' ];
  licenses.some(c => {
    result = foss.indexOf(c) >= 0;
    return result;
  });
  return result;
}

function Walker () {
}

Walker.prototype.stackSub = function (r, key) {
  this.recordsMap[key] = r;
  this.records.push(r);
};

Walker.prototype.stack = function (r) {
  r.file = normalizePath(r.file);
  const key = JSON.stringify([
    r.file, r.store.toString()
  ]);
  const prev = this.recordsMap[key];
  if (!prev) return this.stackSub(r, key);
  if (r.store === STORE_CONTENT) {
    if (r.treatAsCODE && !prev.treatAsCODE) {
      prev.discard = true;
      this.stackSub(r, key);
    }
  } else
  if (r.store === STORE_LINKS) {
    assert(prev.body, 'walker: expected body for STORE_LINKS');
    assert(r.body.length === 1, 'walker: expected body length 1');
    prev.body.push(r.body[0]);
  }
};

const upon = function (p, base) {
  if (typeof p !== 'string') {
    throw new Error(
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
};

const collect = function (ps) {
  return globby.sync(
    ps, { dot: true }
  );
};

Walker.prototype.activateConfig = async function (tuple) {

  const { config, base } = tuple;
  const { pkgConfig } = config;

  if (pkgConfig) {

    let scripts = pkgConfig.scripts;

    if (scripts) {
      if (!Array.isArray(scripts)) {
        scripts = [ scripts ];
      }
      scripts = collect(
        scripts.map(p => upon(p, base))
      );
      for (const script of scripts) {
        const stat = await fs.stat(script);
        if (stat.isFile()) {
          this.stack({
            file: script,
            tuple: tuple,
            store: STORE_CODE
          });
        }
      }
    }

    let assets = pkgConfig.assets;

    if (assets) {
      if (!Array.isArray(assets)) {
        assets = [ assets ];
      }
      assets = collect(
        assets.map(p => upon(p, base))
      );
      for (const asset of assets) {
        const stat = await fs.stat(asset);
        if (stat.isFile()) {
          this.stack({
            file: asset,
            tuple: tuple,
            store: STORE_CONTENT
          });
        }
      }
    }

  } else {

    let files = config.files;

    if (files) {
      files = files.map(file =>
        // npm/node_modules/fstream-npm/fstream-npm.js
        // Packer.prototype.readRules
        file.replace(/\/+$/, '') + '/**'
      );
      files = collect(
        files.map(p => upon(p, base))
      );
      for (const file of files) {
        const stat = await fs.stat(file);
        // TODO decide by extension. why not?
        if (stat.isFile()) {
          this.stack({
            file: file,
            tuple: tuple,
            store: STORE_CONTENT
          });
        }
      }
    }

  }

};

Walker.prototype.stepRead = async function (record) {

  let body;
  try {
    body = await fs.readFile(record.file);
  } catch (error) {
    reporter.report(record.file, 'error', [
      'Cannot read file, ' + error.code
    ], error);
    throw error;
  }

  record.body = body;

};

Walker.prototype.stepPatch = function (record) {

  if (isPackageJson(record.file)) return; // package.json has no tuple
  const { tuple } = record;
  if (!tuple) assert(false);
  const { config } = tuple;
  if (!config) assert(false);
  const { pkgConfig } = config;
  if (!pkgConfig) return;
  const { patches } = pkgConfig;
  if (!patches) return;

  const relation = path.relative(
    record.tuple.base, record.file
  ).replace(/\\/g, '/');

  for (const key in patches) {
    if (minimatch(relation, key)) {

      const patch = patches[key];
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
  }

};

Walker.prototype.stepStrip = function (record) {

  let body = record.body.toString('utf8');

  if (/^\ufeff/.test(body)) {
    body = body.replace(/^\ufeff/, '');
  }
  if (/^#!/.test(body)) {
    body = body.replace(/^#![^\n]*\n/, '\n');
  }

  record.body = body;

};

Walker.prototype.stepDetect = function (record) {

  const body = record.body;

  const derivatives = [];
  try {
    detector.detect(body, (node, trying) => {
      let p, level;
      p = detector.visitor_SUCCESSFUL(node);
      if (p) {
        if (p.dontEnclose) return false;
        p.canIgnore = p.canIgnore || trying;
        derivatives.push(p);
        return false;
      }
      p = detector.visitor_NONLITERAL(node);
      if (p) {
        if (p.dontEnclose) return false;
        if (record.tuple.dictionary) return false;
        level = ((p.canIgnore || trying) ? 'info' : 'warning');
        reporter.report(record.file, level, [
          'Cannot resolve \'' + p.alias + '\'',
          'Use a string literal as argument for \'require\', or leave it',
          'as is and specify the resolved file name in \'scripts\' option.'
        ]);
        return false;
      }
      p = detector.visitor_MALFORMED(node);
      if (p) {
        // there is no "dontEnclose"
        if (record.tuple.dictionary) return false;
        level = (trying ? 'info' : 'warning'); // there is no "canIgnore"
        reporter.report(record.file, level, [
          'Malformed requirement: ' + p.alias
        ]);
        return false;
      }
      p = detector.visitor_USESCWD(node);
      if (p) {
        // there is no "dontEnclose"
        if (record.tuple.dictionary) return false;
        level = 'info'; // there is no "canIgnore"
        reporter.report(record.file, level, [
          'Path.resolve(' + p.alias + ') is ambiguous',
          'It resolves relatively to \'process.cwd\' by default, however',
          'you may need to use \'path.dirname(require.main.filename)\''
        ]);
        return false;
      }
      return true; // can i go inside?
    });
  } catch (error) {
    reporter.report(record.file, 'error', error.message, error);
    throw error;
  }

  return derivatives;

};

Walker.prototype.stepDerivatives_ALIAS_AS_RELATIVE = async function (record, derivative) { // eslint-disable-line camelcase

  const file = path.join(
    path.dirname(record.file),
    derivative.alias
  );

  let stat;
  try {
    stat = await fs.stat(file);
  } catch (error) {
    reporter.report(file, 'error', [
      'Cannot stat, ' + error.code,
      'The file was required from \'' + record.file + '\''
    ], error);
    throw error;
  }

  if (stat.isFile()) {
    this.stack({
      file: file,
      tuple: record.tuple,
      store: STORE_CONTENT
    });
  }

};

Walker.prototype.stepDerivatives_ALIAS_AS_RESOLVABLE = async function (record, derivative) { // eslint-disable-line camelcase

  const catcher = {};
  let newTuple = null;

  catcher.readFileSync = newFile1 => {
    assert(isPackageJson(newFile1), 'walker: ' +
      newFile1 + ' must be package.json');
    const r = fs.readFileSync(newFile1);
    this.stack({
      file: newFile1,
      store: STORE_CONTENT
      // package.json has no tuple
    });
    return r;
  };

  catcher.packageFilter = (config, base) => {
    assert(!newTuple);
    newTuple = { config, base };
    return config;
  };

  let newFile2, failure;

  try {
    newFile2 = await follow(derivative.alias, {
      basedir: path.dirname(record.file),
      // default is `extensions: ['.js']`, but
      // it is not enough because 'typos.json'
      // is not taken in require("./typos")
      // in `normalize-package-data/lib/fixer.js`
      extensions: [ '.js', '.json', '.node' ],
      readFileSync: catcher.readFileSync,
      packageFilter: catcher.packageFilter
    });
  } catch (error) {
    failure = error;
  }

  // was taken from resolve/lib/sync.js
  const isNear = /^(?:\.\.?(?:\/|$)|\/|([A-Za-z]:)?[\\\/])/;

  if (!isNear.test(derivative.alias)) {
    let short = derivative.alias;
    short = short.split('\\')[0];
    short = short.split('/')[0];
    if (short !== derivative.alias) {
      try {
        await follow(short, {
          basedir: path.dirname(record.file),
          extensions: [ '.js', '.json', '.node' ],
          readFileSync: catcher.readFileSync,
          packageFilter: catcher.packageFilter
        });
      } catch (error) {
        // the purpose is to fire `packageFilter`
        // in cases like require("npm/bin/npm-cli.js")
        // because otherwise it will not be fired
        // (only loadAsFileSync is executed)
      }
    }
  }

  if (newTuple) {
    const { config } = newTuple;
    newTuple.permissive = isPermissive(config);
    const { name } = config;
    if (name) {
      const d = this.dictionaries[name];
      if (d) {
        // if there is dictionary - apply it to package.json
        // so it can merge both top-level files and pkgConfig
        Object.assign(config, d);
        newTuple.dictionary = true;
      }
      try {
        await this.activateConfig(newTuple);
      } catch (error) {
        const newFile3 = path.join(newTuple.base, 'package.json');
        reporter.report(newFile3, 'error', error.message, error);
        throw error;
      }
    }
  }

  if (failure) {
    const error2 = failure;
    if (derivative.canIgnore) {
      reporter.report(record.file, 'info', error2.message);
      return;
    } else {
      reporter.report(record.file, 'error', error2.message, error2);
      throw error2;
    }
  }

  this.stack({
    file: newFile2,
    tuple: newTuple || record.tuple,
    store: STORE_CODE
  });

};

Walker.prototype.stepDerivatives = async function (record, derivatives) {

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

};

Walker.prototype.step_STORE_ANY = async function (record) { // eslint-disable-line camelcase

  assert(typeof record.body === 'undefined',
    'walker: unexpected body ' + record.file);

  if (isDotNODE(record.file)) {
    record.discard = true;
    reporter.report(record.file, 'warning', [
      'Cannot include native addon into executable.',
      'The addon file must be distributed with executable.'
    ]);
    return;
  }

  if (record.store === STORE_CODE) {

    if (!isDotJS(record.file)) {
      this.stack({
        file: record.file,
        tuple: record.tuple,
        store: STORE_CONTENT
      });
      record.discard = true;
      return;
    }

    if (record.tuple.permissive ||
        record.tuple.dictionary) { // ejs 0.8.8 has no license field
      this.stack({
        file: record.file,
        tuple: record.tuple,
        store: STORE_CONTENT,
        treatAsCODE: true
      });
      record.discard = true;
      return;
    }

  }

  this.stack({
    file: record.file,
    tuple: record.tuple,
    store: STORE_STAT
  });

  await this.stepRead(record);
  this.stepPatch(record);

  if (record.treatAsCODE ||
      record.store === STORE_CODE) {
    this.stepStrip(record);
    const derivatives = this.stepDetect(record);
    await this.stepDerivatives(record, derivatives);
  }

};

Walker.prototype.step_STORE_LINKS = function (record) { // eslint-disable-line camelcase

  assert(typeof record.body !== 'undefined',
    'walker: expected body ' + record.file);

  this.stack({
    file: record.file,
    tuple: record.tuple,
    store: STORE_STAT
  });

};

Walker.prototype.step_STORE_STAT = async function (record) { // eslint-disable-line camelcase

  assert(typeof record.body === 'undefined',
    'walker: unexpected body ' + record.file);

  let body;
  try {
    body = await fs.stat(record.file);
  } catch (error) {
    reporter.report(record.file, 'error', [
      'Cannot stat, ' + error.code
    ], error);
    throw error;
  }

  if (path.dirname(record.file) !== record.file) { // root directory
    this.stack({
      file: path.dirname(record.file),
      tuple: record.tuple,
      store: STORE_LINKS,
      body: [ path.basename(record.file) ]
    });
  }

  record.body = body;

};

Walker.prototype.step = async function (record) {

  if (record.store === STORE_CODE) {
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

};

Walker.prototype.readDictionaries = async function () {

  const lib = path.dirname(process.argv[1]);
  const dd = path.join(lib, '..', 'dictionary');
  const files = await fs.readdir(dd);

  for (const file of files) {
    if (/\.js$/.test(file)) {
      const name = file.slice(0, -3);
      const config = require(path.join(dd, file));
      this.dictionaries[name] = config;
    }
  }

};

Walker.prototype.start = async function (opts) {

  const { tuple, input } = opts;

  this.records = [];
  this.recordsMap = {};
  this.dictionaries = {};

  await this.readDictionaries();

  this.stack({
    file: input,
    tuple,
    store: STORE_CODE,
    entrypoint: true
  });

  try {
    await this.activateConfig(tuple);
  } catch (error) {
    reporter.report(tuple.base, 'error', error.message, error);
    throw error;
  }

  const records = this.records;
  for (let i = 0; i < records.length; i += 1) {
    // TODO make a queue after per-file codegen
    await this.step(records[i]);
  }

  return this.records;

};

export default async function (opts) {
  const w = new Walker();
  return await w.start(opts);
}
