'use strict';

var parse = require('xml2js').parseString;
var xml = '<root>Hello xml2js!</root>';
parse(xml, function (error, result) {
  if (error) throw error;
  if (result.root === 'Hello xml2js!') {
    console.log('ok');
  }
});
