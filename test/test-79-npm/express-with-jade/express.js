let http = require('http');
let express = require('express');
let app = express();
app.set('views', 'views');
app.set('view engine', 'jade');

require('jade');

app.get('/', function (req, res) {
  res.render('fixture.jade', { title: 'Hey', message: 'Hello there!' });
});

let server = app.listen(1337, function () {
  let port = server.address().port;
  setTimeout(function () {
    http.get('http://127.0.0.1:' + port.toString() + '/', function (res) {
      let chunks = '';
      res.on('data', function (chunk) {
        chunks += chunk.toString();
      }).on('end', function () {
        if (chunks === '<html><head><title>Hey</title></head>' +
                             '<body><h1>Hello there!</h1></body></html>') {
          console.log('ok');
        }
        server.close();
      });
    });
  }, 100);
});
