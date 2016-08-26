const fs = require('fs');
const path = require('path');
const assert = require('assert');
const async = require('async');
const globby = require('globby');
const follow = require('resolve').sync;
const minimatch = require('minimatch');
const common = require('../runtime/common.js');
const detector = require('./detector.js');
const natives = require('./natives.js');
const reporter = require('./reporter.js');

const STORE_CODE = common.STORE_CODE;
const STORE_CONTENT = common.STORE_CONTENT;
const STORE_LINKS = common.STORE_LINKS;
const STORE_STAT = common.STORE_STAT;
const ALIAS_AS_RELATIVE = common.ALIAS_AS_RELATIVE;
const ALIAS_AS_RESOLVABLE = common.ALIAS_AS_RESOLVABLE;

const normalizePath = common.normalizePath;
const isPackageJson = common.isPackageJson;
const isDotJS = common.isDotJS;
const isDotNODE = common.isDotNODE;

function permissive (tuple) {
  const { config } = tuple;
  if (config.private) return false;
  let license = config.license;
  if (typeof license === 'object') license = license.type;
  license = license || ''; // to work with slice
  if (license.slice(0, 1) === '(') license = license.slice(1);
  if (license.slice(-1) === ')') license = license.slice(0, -1);
  license = license.toLowerCase();
  const licenses = Array.prototype.concat(
    license.split(' or '), license.split(' and '), license.split('/')
  );
  let free = false;
  const foss = [ 'isc', 'mit', 'apache-2.0', 'apache 2.0',
    'public domain', 'bsd', 'bsd-2-clause', 'bsd-3-clause', 'wtfpl',
    'cc-by-3.0', 'x11', 'artistic-2.0', 'gplv3', 'mplv2.0' ];
  licenses.some(function (c) {
    free = foss.indexOf(c) >= 0;
    return free;
  });
  return free;
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
    if (r.parse && !prev.parse) {
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

Walker.prototype.hasDictionary = function (name) {
  let config = this.dictionaries[name];
  if (config) return config;
  const home = path.dirname(process.argv[1]);
  const file = path.join(home, '..', 'dictionary', name + '.js');
  if (!fs.existsSync(file)) return null;
  if (!fs.statSync(file).isFile()) return null;
  config = require(file);
  this.dictionaries[name] = config;
  return config;
};

const another = function (p, base) {
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
  if (!path.isAbsolute(p))
    p = path.join(base, p);
  if (negate)
    p = '!' + p;
  return p;
};

const collect = function (ps) {
  return globby.sync(
    ps, { dot: true }
  );
};

Walker.prototype.activateConfig = function (tuple) {

  const that = this;
  const { config, base } = tuple;
  const { pkgConfig } = config;

  if (pkgConfig) {

    let scripts = pkgConfig.scripts;

    if (scripts) {
      if (!Array.isArray(scripts)) {
        scripts = [ scripts ];
      }
      scripts = collect(
        scripts.map(function (p) {
          return another(p, base);
        })
      );
      scripts.some(function (script) {
        const stat = fs.statSync(script);
        if (!stat.isFile()) return;
        that.stack({
          file: script,
          tuple: tuple,
          store: STORE_CODE
        });
      });
    }

    let assets = pkgConfig.assets;

    if (assets) {
      if (!Array.isArray(assets)) {
        assets = [ assets ];
      }
      assets = collect(
        assets.map(function (p) {
          return another(p, base);
        })
      );
      assets.some(function (asset) {
        const stat = fs.statSync(asset);
        if (!stat.isFile()) return;
        that.stack({
          file: asset,
          tuple: tuple,
          store: STORE_CONTENT
        });
      });
    }

  } else {

    let files = config.files;

    if (files) {
      files = files.map(function (file) {
        // npm/node_modules/fstream-npm/fstream-npm.js
        // Packer.prototype.readRules
        return file.replace(/\/+$/, '') + '/**'
      })
      files = collect(
        files.map(function (p) {
          return another(p, base);
        })
      );
      files.some(function (file) {
        const stat = fs.statSync(file);
        if (!stat.isFile()) return;
        that.stack({
          file: file,
          tuple: tuple,
          store: STORE_CONTENT
        });
      });
    }

  }

};

Walker.prototype.stepRead = function (record, cb) {

  fs.readFile(record.file, function (error, body) {
    if (error) {
      reporter.report(record.file, 'error', [
        'Cannot read file, ' + error.code
      ], error);
      return cb(error);
    }
    record.body = body;
    cb();
  });

};

Walker.prototype.stepPatch = function (record, cb) {

  if (isPackageJson(record.file)) return cb(); // package.json is package-neutral
  const tuple = record.tuple;
  if (!tuple) assert(false);
  const config = tuple.config;
  if (!config) assert(false);
  const pkgConfig = config.pkgConfig;
  if (!pkgConfig) return cb();
  const patches = pkgConfig.patches;
  if (!patches) return cb();

  const relate = path.relative(
    record.tuple.base, record.file
  ).replace(/\\/g, '/');

  Object.keys(patches).some(function (key) {
    if (minimatch(relate, key)) {

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
  });

  cb();

};

Walker.prototype.stepStrip = function (record, cb) {

  let body = record.body.toString('utf8');

  if (/^\ufeff/.test(body)) {
    body = body.replace(/^\ufeff/, '');
  }
  if (/^#!/.test(body)) {
    body = body.replace(/^#![^\n]*\n/, '\n');
  }

  record.body = body;
  cb();

};

Walker.prototype.stepDetect = function (record, cb) {

  const that = this;
  const body = record.body;

  const derivatives = [];
  try {
    detector.detect(
      body,
      function (node, trying) {
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
      }
    );
  } catch (error) {
    reporter.report(record.file, 'error', error.message, error);
    return cb(error);
  }

  cb(null, derivatives);

};

Walker.prototype.stepDerivatives_ALIAS_AS_RELATIVE = function (record, derivative, cb) { // eslint-disable-line camelcase

  const that = this;

  const file = path.join(
    path.dirname(record.file),
    derivative.alias
  );

  fs.stat(file, function (error, stat) {
    if (error) {
      reporter.report(file, 'error', [
        'Cannot stat, ' + error.code,
        'The file was required from \'' + record.file + '\''
      ], error);
      return cb(error);
    }
    if (!stat.isFile()) {
      return cb();
    }
    that.stack({
      file: file,
      tuple: record.tuple,
      store: STORE_CONTENT
    });
    cb();
  });

};

Walker.prototype.stepDerivatives_ALIAS_AS_RESOLVABLE = function (record, derivative, cb) { // eslint-disable-line camelcase

  const that = this;
  const catcher = {};
  let newTuple = null;

  catcher.readFileSync = function (file) {
    assert(isPackageJson(file), 'walker: ' +
      file + ' must be package.json');
    const r = fs.readFileSync(file);
    that.stack({
      file: file,
      store: STORE_CONTENT
    });
    return r;
  };

  catcher.packageFilter = function (config, base) {
    assert(!newTuple);
    newTuple = { config, base };
    return config;
  };

  let file2, failure;

  try {
    file2 = follow(derivative.alias, {
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
        follow(short, {
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
    const { name } = newTuple.config;
    if (name) {
      try {
        const d = that.hasDictionary(name);
        if (d) {
          // if there is dict - apply it to package.json. it
          // replaces pkgConfig even if there is already one
          Object.assign(newTuple.config, d);
          newTuple.dictionary = name;
          that.activateConfig(newTuple);
        }
      } catch (error) {
        const file3 = path.join(newTuple.base, 'package.json');
        reporter.report(file3, 'error', error.message, error);
        return cb(error);
      }
    }
  }

  if (failure) {
    const error2 = failure;
    if (derivative.canIgnore) {
      reporter.report(record.file, 'info', error2.message);
      return cb();
    } else {
      reporter.report(record.file, 'error', error2.message, error2);
      return cb(error2);
    }
  }

  that.stack({
    file: file2,
    tuple: newTuple || record.tuple,
    store: STORE_CODE
  });

  cb();

};

Walker.prototype.stepDerivatives = function (record, derivatives, cb) {

  const that = this;

  async.map(derivatives, function (derivative, next) {

    if (natives[derivative.alias]) {
      return next();
    }

    if (derivative.aliasType === ALIAS_AS_RELATIVE) {
      that.stepDerivatives_ALIAS_AS_RELATIVE(record, derivative, next);
    } else
    if (derivative.aliasType === ALIAS_AS_RESOLVABLE) {
      that.stepDerivatives_ALIAS_AS_RESOLVABLE(record, derivative, next);
    } else {
      assert(false, 'walker: unknown aliasType ' + derivative.aliasType);
    }

  }, cb);

};

Walker.prototype.step_STORE_ANY = function (record, cb) { // eslint-disable-line camelcase

  const that = this;
  assert(typeof record.body === 'undefined',
    'walker: unexpected body ' + record.file);

  if (isDotNODE(record.file)) {
    record.discard = true;
    reporter.report(record.file, 'warning', [
      'Cannot include native addon into executable.',
      'The addon file must be distributed with executable.'
    ]);
    return cb();
  }

  if (record.store === STORE_CODE) {

    if (!isDotJS(record.file)) {
      that.stack({
        file: record.file,
        tuple: record.tuple,
        store: STORE_CONTENT
      });
      record.discard = true;
      return cb();
    }

    if (permissive(record.tuple) ||
        record.tuple.dictionary) { // ejs 0.8.8 has no license field
      that.stack({
        file: record.file,
        tuple: record.tuple,
        store: STORE_CONTENT,
        parse: true
      });
      record.discard = true;
      return cb();
    }

  }

  that.stack({
    file: record.file,
    tuple: record.tuple,
    store: STORE_STAT
  });

  async.waterfall([

    function (next) {
      that.stepRead(record, next);
    },
    function (next) {
      that.stepPatch(record, next);
    },
    function (next) {
      if (record.store === STORE_CODE) return next();
      if (record.parse) return next();
      cb();
    },
    function (next) {
      that.stepStrip(record, next);
    },
    function (next) {
      that.stepDetect(record, next);
    },
    function (derivatives, next) {
      that.stepDerivatives(record, derivatives, next);
    }

  ], cb);

};

Walker.prototype.step_STORE_LINKS = function (record, cb) { // eslint-disable-line camelcase

  const that = this;
  assert(typeof record.body !== 'undefined',
    'walker: expected body ' + record.file);

  that.stack({
    file: record.file,
    tuple: record.tuple,
    store: STORE_STAT
  });

  cb();

};

Walker.prototype.step_STORE_STAT = function (record, cb) { // eslint-disable-line camelcase

  const that = this;
  assert(typeof record.body === 'undefined',
    'walker: unexpected body ' + record.file);

  fs.stat(record.file, function (error, body) {
    if (error) {
      reporter.report(record.file, 'error', [
        'Cannot stat, ' + error.code
      ], error);
      return cb(error);
    }
    if (path.dirname(record.file) !== record.file) { // root directory
      that.stack({
        file: path.dirname(record.file),
        tuple: record.tuple,
        store: STORE_LINKS,
        body: [ path.basename(record.file) ]
      });
    }
    record.body = body;
    cb();
  });

};

Walker.prototype.step = function (record, cb) {

  const that = this;

  if (record.store === STORE_CODE) {
    that.step_STORE_ANY(record, cb);
  } else
  if (record.store === STORE_CONTENT) {
    that.step_STORE_ANY(record, cb);
  } else
  if (record.store === STORE_LINKS) {
    that.step_STORE_LINKS(record, cb);
  } else
  if (record.store === STORE_STAT) {
    that.step_STORE_STAT(record, cb);
  } else {
    assert(false, 'walker: unknown store ' + record.store);
  }

};

Walker.prototype.walk = function (cb) {

  const that = this;
  const records = that.records;
  let advance = 0;

  function loop () {
    if (advance >= records.length) return cb();
    const record = records[advance];
    that.step(record, function (error) {
      if (error) return cb(error);
      advance += 1;
      loop();
    });
  }

  loop();

};

Walker.prototype.start = function (opts, cb) {

  const that = this;

  that.records = [];
  that.recordsMap = {};
  that.dictionaries = {};

  const input = opts.input;
  const boot = opts.boot;

  const tuple = {
    config: opts.config || {},
    base: path.dirname(boot)
  };

  that.stack({
    file: input,
    tuple: tuple,
    store: STORE_CODE,
    entrypoint: true
  });

  try {
    that.activateConfig(tuple);
  } catch (error) {
    reporter.report(boot, 'error', error.message, error);
    return cb(error);
  }

  that.walk(function (error) {
    if (error) return cb(error);
    cb(null, that.records);
  });

};

module.exports = function (opts) {
  return new Promise((resolve, reject) => {
    const w = new Walker();
    w.start(opts, (error, stripe) => {
      if (error) return reject(error);
      resolve(stripe);
    });
  });
};
