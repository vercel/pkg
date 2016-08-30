'use strict';

module.exports = {
  pkgConfig: {
    scripts: [
      'lib/**/*.js'
    ],
    patches: {
      'lib/dialects/maria/index.js': [
        'require(\'mariasql\')',
        'require(\'mariasql\', \'may-exclude\')'
      ],
      'lib/dialects/mssql/index.js': [
        'require(\'mssql\')',
        'require(\'mssql\', \'may-exclude\')'
      ],
      'lib/dialects/mysql/index.js': [
        'require(\'mysql\')',
        'require(\'mysql\', \'may-exclude\')'
      ],
      'lib/dialects/mysql2/index.js': [
        'require(\'mysql2\')',
        'require(\'mysql2\', \'may-exclude\')'
      ],
      'lib/dialects/oracle/index.js': [
        'require(\'oracle\')',
        'require(\'oracle\', \'may-exclude\')'
      ],
      'lib/dialects/oracledb/index.js': [
        'require(\'oracledb\')',
        'require(\'oracledb\', \'may-exclude\')'
      ],
      'lib/dialects/postgres/index.js': [
        'require(\'pg\')',
        'require(\'pg\', \'may-exclude\')',
        'require(\'pg-query-stream\')',
        'require(\'pg-query-stream\', \'may-exclude\')'
      ],
      'lib/dialects/sqlite3/index.js': [
        'require(\'sqlite3\')',
        'require(\'sqlite3\', \'may-exclude\')'
      ],
      'lib/dialects/strong-oracle/index.js': [
        'require(\'strong-oracle\')',
        'require(\'strong-oracle\', \'may-exclude\')'
      ]
    }
  }
};
