import type { PkgOptions } from './types';

interface ConfigItem {
  dependencies?: Record<string, string | undefined>;
  pkg?: Partial<PkgOptions>;
}

const dictionary: Record<string, ConfigItem> = {
  'angular-bridge': {},
  'any-promise': {},
  async: {},
  'aws-sdk': {
    pkg: {
      scripts: ['apis/*.json', 'lib/services/*.js'],
    },
  },
  'babel-core': {},
  batch: {},
  bcrypt: {},
  'better-sqlite3': {},
  bignum: {},
  bindings: {},
  blessed: {
    // https://github.com/chjj/blessed/issues/298
    pkg: {
      scripts: ['lib/widgets/*.js'],
    },
  },
  'body-parser': {
    pkg: {
      scripts: [
        'lib/types/*.js', // for 1.4-1.13
      ],
    },
  },
  browserify: {
    pkg: {
      assets: ['bin/*.txt'],
    },
  },
  bson: {},
  buffermaker: {
    pkg: {
      scripts: ['lib/*.js'],
    },
  },
  bunyan: {
    pkg: {
      patches: {
        'lib/bunyan.js': [
          {
            command: 'replace',
            from: "'mv' + '');",
            to: "mv = require('mv');",
          },
        ],
      },
    },
  },
  busboy: {
    pkg: {
      scripts: ['lib/types/*.js'],
    },
  },
  bytes: {},
  callsites: {},
  chokidar: {},
  'coffee-script': {
    pkg: {
      scripts: ['lib/coffee-script/*.js'],
    },
  },
  colors: {},
  compression: {},
  compressjs: {
    pkg: {
      scripts: ['lib/*.js'],
    },
  },
  'connect-mongo': {},
  'connect-mongodb': {},
  'connect-redis': {},
  connect: {
    pkg: {
      scripts: ['lib/middleware/*.js'],
      assets: [
        'lib/public/**/*', // for connect@2.3
      ],
    },
  },
  consolidate: {},
  'cookie-parser': {},
  cookie: {},
  cors: {},
  cron: {},
  'cross-env': {
    pkg: {
      patches: {
        // author is mistaken to point package.json.main to
        // src/index.js (that is es6) instead of dist/index.js (es5)
        'src/index.js': [{ command: 'erase', source: '' }],
      },
    },
  },
  'cross-spawn-async': {},
  curve25519: {},
  'data-preflight': {
    pkg: {
      assets: ['src/view/**/*', 'src/js/view/**/*'],
    },
  },
  debug: {},
  denymount: {},
  diff: {},
  drivelist: {
    pkg: {
      patches: {
        'build/scripts.js': [
          {
            command: 'replace',
            from: "path.join(__dirname, '..', 'scripts')",
            to: "path.join(path.dirname(process.execPath), 'drivelist')",
          },
        ],
        'lib/scripts.js': [
          {
            command: 'replace',
            from: "path.join(__dirname, '..', 'scripts')",
            to: "path.join(path.dirname(process.execPath), 'drivelist')", // for 4.0.0
          },
        ],
      },
      deployFiles: [
        ['build/Release/drivelist.node', 'drivelist.node'],
        ['scripts/darwin.sh', 'drivelist/darwin.sh'],
        ['scripts/linux.sh', 'drivelist/linux.sh'],
        ['scripts/win32.bat', 'drivelist/win32.bat'],
      ],
    },
  },
  ed25519: {},
  ejs: {},
  elasticsearch: {},
  electron: {
    pkg: {
      patches: {
        'index.js': [
          {
            command: 'replace',
            from: 'path.join(__dirname, fs',
            to: "path.join(path.dirname(process.execPath), 'electron', fs",
          },
        ],
      },
      deployFiles: [
        ['dist', 'electron/dist', 'directory'],
        ['../sliced/index.js', 'node_modules/sliced/index.js'],
        [
          '../deep-defaults/lib/index.js',
          'node_modules/deep-defaults/index.js',
        ],
      ],
    },
  },
  emailjs: {},
  'engine.io': {},
  epoll: {},
  errorhandler: {
    pkg: {
      assets: ['public/**/*'],
    },
  },
  errors: {
    pkg: {
      assets: ['lib/static/*'],
    },
  },
  eslint: {
    pkg: {
      scripts: ['lib/rules/*.js', 'lib/formatters/*.js'],
    },
  },
  'etcher-image-write': {},
  exceljs: {
    pkg: {
      assets: [
        // TODO look at exceljs and implement as
        // many __dirname use cases as possible
        'lib/**/*.xml',
      ],
      patches: {
        'lib/stream/xlsx/workbook-writer.js': [
          {
            command: 'replace',
            from: "require.resolve('../../xlsx/xml/theme1.xml')",
            to: "require('path').join(__dirname, '../../xlsx/xml/theme1.xml')",
          },
        ],
        'lib/xlsx/xlsx.js': [
          {
            command: 'replace',
            from: "require.resolve('./xml/theme1.xml')",
            to: "require('path').join(__dirname, './xml/theme1.xml')",
          },
        ],
      },
    },
  },
  'exiftool.exe': {
    pkg: {
      patches: {
        'index.js': [
          {
            command: 'replace',
            from: "path.join(__dirname, 'vendor', 'exiftool.exe')",
            to: "path.join(path.dirname(process.execPath), 'exiftool.exe')",
          },
        ],
      },
      deployFiles: [['vendor/exiftool.exe', 'exiftool.exe']],
    },
  },
  'exiftool.pl': {
    pkg: {
      patches: {
        'index.js': [
          {
            command: 'replace',
            from: "path.join(__dirname, 'vendor', 'exiftool')",
            to: "path.join(path.dirname(process.execPath), 'exiftool')",
          },
        ],
      },
      deployFiles: [['vendor/exiftool', 'exiftool']],
    },
  },
  'express-load': {
    pkg: {
      patches: {
        'lib/express-load.js': [
          {
            command: 'replace',
            from: 'entity = path.resolve(',
            to: 'entity = process.pkg.path.resolve(',
          },
        ],
      },
    },
  },
  'express-session': {},
  express: {
    pkg: {
      patches: {
        'lib/view.js': [
          {
            command: 'replace',
            from: 'path = join(this.root, path)',
            to: 'path = process.pkg.path.resolve(this.root, path)', // for 3.x
          },
          {
            command: 'replace',
            from: 'loc = resolve(root, name)',
            to: 'loc = process.pkg.path.resolve(root, name)', // for 4.x
          },
        ],
      },
    },
  },
  extender: {
    // в declare.js грязный хак.
    // если в тексте(!) функции есть подстрока "super"
    // (см SUPER_REGEXP), то её надо оборачивать особым
    // способом (см functionWrapper). поэтому все пакеты,
    // которые зависят от declare.js - надо проработать.
    // хотя бы те файлы, функции в которых попадают в
    // functionWrapper
  },
  extsprintf: {},
  'faye-websocket': {},
  feathers: {},
  'findup-sync': {},
  floordate: {},
  fmt: {},
  formidable: {},
  'fs-extra': {},
  fsevents: {},
  'geoip-lite': {
    pkg: {
      assets: ['data/*'],
    },
  },
  github: {
    pkg: {
      assets: ['lib/routes.json'],
    },
  },
  gm: {},
  'google-closure-compiler-java': {
    pkg: {
      patches: {
        'index.js': [
          {
            command: 'replace',
            from: "require.resolve('./compiler.jar')",
            to: "require('path').join(require('path').dirname(process.execPath), 'compiler/compiler.jar')",
          },
        ],
      },
      deployFiles: [['compiler.jar', 'compiler/compiler.jar']],
    },
  },
  'google-closure-compiler': {
    pkg: {
      patches: {
        'lib/node/closure-compiler.js': [
          {
            command: 'replace',
            from: "require.resolve('../../compiler.jar')",
            to: "require('path').join(require('path').dirname(process.execPath), 'compiler/compiler.jar')",
          },
        ],
      },
      deployFiles: [['compiler.jar', 'compiler/compiler.jar']],
    },
  },
  googleapis: {
    pkg: {
      scripts: ['apis/**/*.js'],
    },
  },
  got: {},
  'graceful-fs': {
    pkg: {
      patches: {
        'graceful-fs.js': [
          {
            command: 'prepend',
            source:
              'if ((function() {\n' +
              "  var version = require('./package.json').version;\n" +
              "  var major = parseInt(version.split('.')[0]);\n" +
              '  if (major < 4) {\n' +
              "    module.exports = require('fs');\n" +
              '    return true;\n' +
              '  }\n' +
              '})()) return;\n',
          },
        ],
      },
    },
  },
  grpc: {
    pkg: {
      files: [
        // suppress because hundreds of
        // C++ files go inside executable
      ],
      assets: ['etc/*.pem', 'deps/grpc/etc/*.pem'],
    },
  },
  gulp: {},
  'hap-nodejs': {},
  heapdump: {},
  hoek: {},
  homebridge: {},
  'http-proxy': {},
  'http-server': {},
  'image-size': {},
  indexof: {},
  inquirer: {},
  j: {
    pkg: {
      patches: {
        'j.js': [
          {
            command: 'replace',
            from: "require('xl'+'sx')",
            to: "require('xlsx')",
          },
          {
            command: 'replace',
            from: "require('xl'+'sjs')",
            to: "require('xlsjs')",
          },
          {
            command: 'replace',
            from: "require('ha'+'rb')",
            to: "require('harb')",
          },
        ],
      },
    },
  },
  jade: {},
  jsdom: {},
  'json-stringify-date': {},
  'json-stringify-safe': {},
  jsonwebtoken: {},
  kerberos: {},
  knex: {
    pkg: {
      scripts: ['lib/**/*.js'],
    },
  },
  later: {
    pkg: {
      scripts: ['later.js'],
    },
  },
  level: {},
  leveldown: {
    pkg: {
      patches: {
        'binding.js': [
          {
            command: 'replace',
            from: '__dirname',
            to: "require('path').dirname(process.execPath)",
          },
        ],
      },
      deployFiles: [['prebuilds', 'prebuilds', 'directory']],
    },
  },
  levelup: {},
  liftoff: {
    pkg: {
      patches: {
        'index.js': [
          {
            command: 'replace',
            from: 'resolve.sync(this.moduleName, {basedir: configBase || cwd, paths: paths})',
            to: 'resolve.sync(this.moduleName, {basedir: configBase || require.main.filename, paths: paths})',
          },
        ],
      },
    },
  },
  lodash: {},
  log4js: {
    pkg: {
      scripts: ['lib/appenders/*.js'],
    },
  },
  logform: {
    pkg: {
      scripts: ['*.js'],
    },
  },
  'machinepack-urls': {
    pkg: {
      scripts: ['machines/*.js'],
    },
  },
  markdown: {},
  mdns: {},
  'method-override': {},
  microjob: {
    pkg: {
      patches: {
        'dist/worker-pool.js': [
          {
            command: 'replace',
            from: 'error.stack = message.error.stack;',
            to:
              'error.stack = message.error.stack;\n' +
              'if (error.stack.indexOf("SyntaxError") >= 0) {' +
              'error.stack = "Pkg: Try to specify your ' +
              "javascript file in 'assets' in config.\\n\" + error.stack;" +
              '};',
          },
        ],
      },
    },
  },
  'mime-types': {},
  mime: {},
  minimatch: {},
  minstache: {},
  'module-deps': {},
  'moment-timezone': {},
  moment: {
    pkg: {
      scripts: ['locale/*.js'],
    },
  },
  'mongodb-core': {
    pkg: {
      patches: {
        'lib/error.js': [
          {
            command: 'replace',
            from: 'return err;',
            to:
              'if (err.message.indexOf("SyntaxError") >= 0) {' +
              'err.message = "Pkg: Try to specify your ' +
              "javascript file in 'assets' in config. \" + err.message;" +
              '};\n' +
              'return err;',
          },
          {
            command: 'replace',
            from: 'if (Error.captureStackTrace) {',
            to:
              'if (this.message.indexOf("SyntaxError") >= 0) {' +
              'this.message = "Pkg: Try to specify your ' +
              "javascript file in 'assets' in config. \" + this.message;" +
              '};\n' +
              'if (Error.captureStackTrace) {',
          },
        ],
      },
    },
  },
  mongodb: {
    pkg: {
      scripts: ['lib/mongodb/**/*.js'],
    },
  },
  mongoose: {
    pkg: {
      scripts: ['lib/drivers/node-mongodb-native/*.js'],
    },
  },
  mongoskin: {
    pkg: {
      scripts: ['lib/**/*.js'],
    },
  },
  ms: {},
  msgpack: {},
  multer: {},
  muri: {},
  'native-or-bluebird': {},
  natives: {},
  nconf: {
    pkg: {
      scripts: ['lib/nconf/stores/*.js'],
    },
  },
  nedb: {},
  negotiator: {
    pkg: {
      scripts: ['lib/*.js'],
    },
  },
  newrelic: {},
  nib: {},
  nightmare: {
    pkg: {
      patches: {
        'lib/nightmare.js': [
          {
            command: 'replace',
            from: "path.join(__dirname, 'runner.js')",
            to: "path.join(path.dirname(process.execPath), 'nightmare/runner.js')",
          },
        ],
      },
      deployFiles: [
        ['lib/runner.js', 'nightmare/runner.js'],
        ['lib/frame-manager.js', 'nightmare/frame-manager.js'],
        ['lib/ipc.js', 'nightmare/ipc.js'],
        ['lib/preload.js', 'nightmare/preload.js'],
      ],
    },
  },
  'node-forge': {
    pkg: {
      scripts: ['js/*.js', 'lib/*.js'],
    },
  },
  'node-libcurl': {},
  'node-notifier': {
    pkg: {
      patches: {
        'notifiers/balloon.js': [
          {
            command: 'replace',
            from: "__dirname, '../vendor/notifu/notifu'",
            to: "path.dirname(process.execPath), 'notifier/notifu'",
          },
        ],
        'notifiers/notificationcenter.js': [
          {
            command: 'replace',
            from: "__dirname,\n  '../vendor/terminal-notifier.app/Contents/MacOS/terminal-notifier'",
            to: "path.dirname(process.execPath), 'notifier/terminal-notifier'",
          },
        ],
        'notifiers/toaster.js': [
          {
            command: 'replace',
            from: "__dirname, '../vendor/snoreToast/snoretoast'",
            to: "path.dirname(process.execPath), 'notifier/snoretoast'",
          },
        ],
      },
      deployFiles: [
        ['vendor/notifu/notifu.exe', 'notifier/notifu.exe'],
        ['vendor/notifu/notifu64.exe', 'notifier/notifu64.exe'],
        [
          'vendor/terminal-notifier.app/Contents/MacOS/terminal-notifier',
          'notifier/terminal-notifier',
        ],
        ['vendor/snoreToast/snoretoast-x64.exe', 'notifier/snoretoast-x64.exe'],
        ['vendor/snoreToast/snoretoast-x86.exe', 'notifier/snoretoast-x86.exe'],
      ],
    },
  },
  'node-pre-gyp': {
    pkg: {
      scripts: ['lib/*.js'],
    },
  },
  'node-redis-pubsub': {},
  'node-sass': {},
  'node-uuid': {},
  'node-xlsx': {},
  'node-zookeeper-client': {
    pkg: {
      assets: ['lib/jute/specification.json'],
    },
  },
  nodegit: {
    pkg: {
      scripts: ['dist/**/*.js'],
    },
  },
  'nodemailer-sendmail-transport': {},
  nodemailer: {},
  'npm-registry-client': {
    pkg: {
      scripts: ['lib/**/*.js'],
    },
  },
  npm: {
    pkg: {
      scripts: ['lib/*.js'],
    },
  },
  nssocket: {},
  oauth2orize: {
    pkg: {
      scripts: ['lib/**/*.js'],
    },
  },
  octobat: {},
  open: {
    pkg: {
      patches: {
        'index.js': [
          {
            command: 'replace',
            from: "path.join(__dirname, 'xdg-open')",
            to: "path.join(path.dirname(process.execPath), 'xdg-open')",
          },
        ],
      },
      deployFiles: [['xdg-open', 'xdg-open']],
    },
  },
  opn: {
    pkg: {
      patches: {
        'index.js': [
          {
            command: 'replace',
            from: "path.join(__dirname, 'xdg-open')",
            to: "path.join(path.dirname(process.execPath), 'xdg-open')",
          },
        ],
      },
      deployFiles: [['xdg-open', 'xdg-open']],
    },
  },
  optimist: {},
  'passport-local': {},
  passport: {},
  'pg-cursor': {},
  'pg-query-stream': {},
  'pg-types': {
    pkg: {
      scripts: ['lib/arrayParser.js'],
    },
  },
  pg: {
    pkg: {
      scripts: ['lib/**/*.js'],
    },
  },
  'pg.js': {
    pkg: {
      scripts: ['lib/**/*.js'],
    },
  },
  pgpass: {
    pkg: {
      scripts: ['lib/helper.js'],
    },
  },
  phantom: {
    pkg: {
      patches: {
        'lib/phantom.js': [
          {
            command: 'replace',
            from: "__dirname + '/shim/index.js'",
            to: "_path2.default.join(_path2.default.dirname(process.execPath), 'phantom/index.js')",
          },
        ],
      },
      deployFiles: [
        ['lib/shim/index.js', 'phantom/index.js'],
        [
          'lib/shim/function_bind_polyfill.js',
          'phantom/function_bind_polyfill.js',
        ],
      ],
    },
  },
  'phantomjs-prebuilt': {
    pkg: {
      patches: {
        'lib/phantomjs.js': [
          {
            command: 'replace',
            from: '__dirname, location.location',
            to: "path.dirname(process.execPath), 'phantom', path.basename(location.location)",
          },
        ],
      },
      deployFiles: [
        ['lib/phantom/bin/phantomjs', 'phantom/phantomjs'],
        ['lib/phantom/bin/phantomjs.exe', 'phantom/phantomjs.exe'],
      ],
    },
  },
  pkginfo: {},
  pm2: {
    pkg: {
      scripts: ['lib/ProcessContainerFork.js'],
    },
  },
  pmx: {},
  pouchdb: {},
  'primus-emitter': {},
  'primus-spark-latency': {},
  primus: {},
  publicsuffixlist: {
    dependencies: {
      gulp: undefined,
      'gulp-di': undefined,
      'gulp-istanbul': undefined,
      'gulp-jshint': undefined,
      'gulp-mocha': undefined,
      mocha: undefined,
    },
    pkg: {
      assets: ['effective_tld_names.dat'],
    },
  },
  pug: {},
  punt: {},
  puppeteer: {
    pkg: {
      patches: {
        'utils/ChromiumDownloader.js': [
          {
            command: 'replace',
            from: "path.join(__dirname, '..', '.local-chromium')",
            to: "path.join(path.dirname(process.execPath), 'puppeteer')",
          },
        ],
      },
      deployFiles: [['.local-chromium', 'puppeteer', 'directory']],
    },
  },
  pwd: {},
  q: {},
  raven: {},
  rc: {
    pkg: {
      patches: {
        'lib/utils.js': [
          {
            command: 'replace',
            from: 'process.cwd()',
            to: "require('path').dirname(require.main.filename)",
          },
        ],
      },
    },
  },
  'readable-stream': {},
  rechoir: {},
  'redis-parser': {},
  redis: {},
  regression: {},
  reload: {
    pkg: {
      scripts: ['lib/reload-server.js'],
    },
  },
  request: {},
  'require-uncached': {},
  require_optional: {},
  s3: {},
  safe_datejs: {},
  sails: {
    pkg: {
      scripts: ['lib/**/*.js'],
      patches: {
        'lib/hooks/moduleloader/index.js': [
          {
            command: 'replace',
            from: "require('coffee-script/register')",
            to: '',
          },
        ],
        'lib/app/configuration/index.js': [
          {
            command: 'replace',
            from: 'hook = require(hookBundled);',
            to:
              'hook = require(hookBundled);' +
              // force to take the whole package
              "require('sails-hook-sockets');",
          },
        ],
        'lib/hooks/grunt/index.js': [
          {
            command: 'replace',
            from: 'var child = ChildProcess.fork(',
            to:
              '\n' +
              "sails.log.warn('*******************************************************************');\n" +
              "sails.log.warn('** Pkg: Grunt hook is temporarily disabled in pkg-ed app         **');\n" +
              "sails.log.warn('** Instead it should be run before compilation to prepare files  **');\n" +
              "sails.log.warn('*******************************************************************');\n" +
              "sails.emit('hook:grunt:done');\n" +
              'return cb_afterTaskStarted();(',
          },
        ],
        'lib/hooks/orm/backwards-compatibility/upgrade-datastore.js': [
          {
            command: 'replace',
            from: 'if (!fs.existsSync(modulePath)) {',
            to: 'try { require(modulePath); } catch (e) {',
          },
        ],
      },
    },
  },
  sax: {},
  scrypt: {},
  semver: {},
  sequelize: {
    pkg: {
      scripts: ['lib/**/*.js'],
    },
  },
  serialport: {},
  sha3: {},
  sharp: {
    pkg: {
      scripts: ['lib/*.js'],
      deployFiles: [
        ['build/Release', 'sharp/build/Release', 'directory'],
        ['vendor/lib', 'sharp/vendor/lib', 'directory'],
      ],
    },
  },
  shelljs: {
    pkg: {
      scripts: ['src/*.js'],
    },
  },
  sinon: {},
  'socket.io-client': {
    pkg: {
      scripts: [
        'lib/**/*.js', // for 0.9.17
      ],
      assets: [
        'socket.io.js',
        'dist/**/*', // for 0.9.17
      ],
    },
  },
  'socket.io': {
    pkg: {
      patches: {
        'lib/index.js': [
          {
            command: 'replace',
            from: "require.resolve('socket.io-client/dist/socket.io.js.map')",
            to: "require.resolve('socket.io-client/dist/socket.io.js.map', 'must-exclude')",
          },
        ],
      },
    },
  },
  sqip: {
    /**
     * primitive Binaries must be installed on the system.
     * e.g. go get -u github.com/fogleman/primitive
     */
  },
  sqlite3: {},
  'steam-crypto': {
    pkg: {
      assets: ['public.pub'],
    },
  },
  'steam-resources': {
    pkg: {
      assets: ['steam_language/**/*'],
      patches: {
        'steam_language_parser/index.js': [
          { command: 'replace', from: 'process.chdir', to: '// process.chdir' },
          {
            command: 'replace',
            from: "'steammsg.steamd'",
            to: "require('path').join(__dirname, '../steam_language', 'steammsg.steamd')",
          },
        ],
        'steam_language_parser/parser/token_analyzer.js': [
          {
            command: 'replace',
            from: 'text.value',
            to: "require('path').join(__dirname, '../../steam_language', text.value)",
          },
        ],
      },
    },
  },
  steam: {},
  'stripe-webhook-middleware': {},
  stripe: {},
  'strong-globalize': {},
  stylus: {
    pkg: {
      assets: ['lib/**/*.styl'],
      log(log, opts) {
        log.warn(
          'Add { paths: [ __dirname ] } to stylus options to resolve imports',
          [opts.packagePath]
        );
      },
    },
  },
  supervisor: {},
  svgo: {
    pkg: {
      scripts: ['lib/**/*.js', 'plugins/*.js'],
      assets: ['.svgo.yml'],
    },
  },
  tabtab: {},
  'tesseract.js': {
    pkg: {
      scripts: ['src/node/worker.js'],
    },
  },
  throng: {},
  time: {},
  tinify: {
    pkg: {
      assets: ['lib/data/cacert.pem'],
    },
  },
  'tiny-worker': {
    pkg: {
      assets: ['lib/noop.js'],
    },
  },
  tmp: {},
  transformers: {},
  'uglify-js': {
    pkg: {
      // assets, not scripts because of custom
      // load_global (readFileSync + runInContext)
      assets: ['lib/**/*.js', 'tools/*.js'],
    },
  },
  umd: {
    pkg: {
      assets: [
        'template.js', // for 2.1.0
      ],
      patches: {
        'index.js': [
          {
            command: 'replace',
            from: "var rfile = require('rfile');",
            to:
              'var rfile = function(f) { ' +
              "require('fs').readFileSync(" + // for 2.1.0
              'require.resolve(f)' +
              '); ' +
              '};',
          },
        ],
      },
    },
  },
  underscore: {},
  union: {},
  'update-notifier': {},
  usage: {
    pkg: {
      scripts: ['lib/providers/*.js'],
    },
  },
  v8flags: {
    pkg: {
      patches: {
        'index.js': [
          {
            command: 'replace',
            from: "execFile(process.execPath, ['--v8-options'],",
            to:
              "execFile(process.execPath, ['--v8-options'], " +
              "{ env: { PKG_EXECPATH: 'PKG_INVOKE_NODEJS' } },",
          },
        ],
      },
    },
  },
  verror: {},
  voc: {},
  webdriverio: {
    pkg: {
      scripts: ['build/**/*.js'],
    },
  },
  'winston-uber': {
    pkg: {
      scripts: ['lib/winston/transports/*.js'],
    },
  },
  winston: {
    pkg: {
      scripts: ['lib/winston/transports/*.js'],
    },
  },
  ws: {},
  xlsx: {
    pkg: {
      patches: {
        'xlsx.js': [
          {
            command: 'replace',
            from: "require('js'+'zip')",
            to: "require('jszip')",
          },
          {
            command: 'replace',
            from: "require('./js'+'zip')",
            to: "require('./jszip')",
          },
          {
            command: 'replace',
            from: "require('./od' + 's')",
            to: "require('./ods')",
          },
        ],
      },
    },
  },
  xml2js: {},
  yargs: {},
  zeromq: {
    pkg: {
      patches: {
        'lib/native.js': [
          {
            command: 'replace',
            from: 'path.join(__dirname, "..")',
            to: 'path.dirname(process.execPath)',
          },
        ],
      },
      deployFiles: [['prebuilds', 'prebuilds', 'directory']],
    },
  },
};

export default dictionary;
