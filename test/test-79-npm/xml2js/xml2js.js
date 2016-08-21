let parse = require('xml2js').parseString;
let xml = '<root>Hello xml2js!</root>';
parse(xml, function (error, result) {
  if (result.root === 'Hello xml2js!') {
    console.log('ok');
  }
});
