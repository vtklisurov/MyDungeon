var app = require('http').createServer(createServer);
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var homepage = require('./home');
var register=require('./register');



function createServer(request, response) {
  if(request.url == '/favicon.ico') {
    response.writeHead(404);
    response.end(' ');
  }
  if(request.url == '/register') {
    var tmp =register.check("klisurovi4","klisurovi4@gmail.com")
    console.log(tmp)
    response.end(' ');
  }
  if(request.url == '/home' || request.url == '/') {
    response.writeHead(200, {"Content-Type": "text/html"});
    response.write(homepage.products());
    response.end('test');
  }
}

app.listen(8080);
