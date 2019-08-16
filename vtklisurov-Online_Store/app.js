//var app = require('http').createServer(createServer);
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var homepage = require('./home');
var register=require('./register');
var express = require('express');
var app = express();
var myParser = require("body-parser");


//async function createServer(request, response) {
// if(request.url == '/favicon.ico') {
//   response.writeHead(404);
//   response.end(' ');
// }
app.use(myParser.urlencoded({extended : true}));
app.use('/images', express.static(__dirname + '/images'));
app.use('/public', express.static(__dirname + '/public'));

app.get('/register', function(request, response){
  response.writeHead(200, {"Content-Type": "text/html"});
  response.write(register.html);
  response.end();
})

app.get('/', function(request, response){
  response.writeHead(200, {'Content-Type': 'text/html'});
  response.write(homepage.products());
  response.end();

})

app.get('/success', function(request, response){
  response.writeHead(200, {'Content-Type': 'text/html'});
  res.sendFile('public/success.html');
  response.end();

})

app.post("/register.js", function(request, response){
  var promise = register.checkUnique(request.body.uname, request.body.email);
  promise.then(function(value){
    if (value=="All good")
    {
      register.saveData(request.body.uname, request.body.pass, request.body.fname,request.body.lname, request.body.email)
    }
    else response.send(value);
    console.log(value);
    response.end(' ');
  });
});
app.listen(8080);
