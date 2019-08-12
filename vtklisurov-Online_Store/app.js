var app = require('http').createServer(createServer);
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var homepage = require('./home');



function createServer(request, response) {
  fs.readFile('./home.html', function (err, html) {
    if (err) {
      throw err;
    }
    response.writeHeader(200, {"Content-Type": "text/html"});
    response.write(homepage.html);
    response.end();
  });
}

app.listen(8080);
