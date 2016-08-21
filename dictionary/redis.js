module.exports = {

  patches: {

    'lib/parser/hiredis.js': [
      'require("hiredis")',
      'require("hiredis", "can-ignore")' // for 2.0 and earlier
    ],

    'lib/parsers/hiredis.js': [
      'require("hiredis")',
      'require("hiredis", "can-ignore")', // for 2.1
      'require(\'hiredis\')',
      'require(\'hiredis\', \'can-ignore\')' // for 2.2-2.4
    ]

  }

};
