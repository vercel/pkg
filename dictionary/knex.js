'use strict';

module.exports = {

  scripts: [
    'lib/**/*.js'
  ],

  patches: {

    'lib/dialects/maria/index.js': [
      'require(\'mariasql\')',
      'require(\'mariasql\', \'can-ignore\')'
    ],

    'lib/dialects/mssql/index.js': [
      'require(\'mssql\')',
      'require(\'mssql\', \'can-ignore\')'
    ],

    'lib/dialects/mysql/index.js': [
      'require(\'mysql\')',
      'require(\'mysql\', \'can-ignore\')'
    ],

    'lib/dialects/mysql2/index.js': [
      'require(\'mysql2\')',
      'require(\'mysql2\', \'can-ignore\')'
    ],

    'lib/dialects/oracle/index.js': [
      'require(\'oracle\')',
      'require(\'oracle\', \'can-ignore\')'
    ],

    'lib/dialects/postgres/index.js': [
      'require(\'pg\')',
      'require(\'pg\', \'can-ignore\')',
      'require(\'pg-query-stream\')',
      'require(\'pg-query-stream\', \'can-ignore\')'
    ],

    'lib/dialects/sqlite3/index.js': [
      'require(\'sqlite3\')',
      'require(\'sqlite3\', \'can-ignore\')'
    ],

    'lib/dialects/strong-oracle/index.js': [
      'require(\'strong-oracle\')',
      'require(\'strong-oracle\', \'can-ignore\')'
    ]

  }

};
