"use strict";

module.exports = {

  scripts: [
    "lib/**/*.js"
  ],

  patches: {

    "lib/dialects/mssql/connection-manager.js": [
      { do: "append" },
      "require('tedious', 'can-ignore');\n"
    ],

    "lib/dialects/postgres/connection-manager.js": [
      { do: "append" },
      "require('pg', 'can-ignore');\n"
    ],

    "lib/dialects/postgres/hstore.js": [
      "require('pg-hstore')",
      "require('pg-hstore', 'can-ignore')"
    ],

    "lib/dialects/sqlite/connection-manager.js": [
      { do: "append" },
      "require('sqlite3', 'can-ignore');\n"
    ]

  }

};
