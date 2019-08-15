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
    // response.writeHead(200, {"Content-Type": "text/html"});
    // var promise1 = Promise.resolve(register.checkUnique('vtklisurov', 'vtklisurov@gmail.com'));
    // promise1.then(function(value) {
    //   response.write(value);
    //       response.end(' ');
    // });
    register.saveData('vtklisurov', '9810017583', 'Velin','Klisurov', 'vtklisurov@gmail.com')
  }
}

app.listen(8080);
