//var app = require('http').createServer(createServer);
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var homepage = require('./home');
var verify = require('./verify');
var express = require('express');
var app = express();
var myParser = require("body-parser");
var register = require("./register");
var regsucc = require("./regsucc");
var login = require("./login");

app.use(myParser.urlencoded({extended : true}));
app.use('/images', express.static(__dirname + '/images'));
app.use('/public', express.static(__dirname + '/public'));

app.get('/register', async function(request, response){
  response.sendFile('public/register.html', {root: __dirname })
  //response.end();
});

app.get('/', function(request, response){
  response.writeHead(200, {'Content-Type': 'text/html'});
  response.write(homepage.products());
  response.end();
});

app.get('/success', function(request, response){
  response.sendFile('public/success.html', {root: __dirname })
});

app.get('/login', function(request, response){
  response.sendFile('public/login.html', {root: __dirname })
  //response.end();
});

app.get('/test', function(req, res) {
    res.sendFile('public/success.html', {root: __dirname })
});

app.post("/login.js", function(request, response){
  var promise = login.checkLogin(request.body.uname, request.body.pass);
  promise.then(function(value){
    response.send(value);
    response.end(' ');
  });
});


app.post("/register.js", function(request, response){
  var promise = register.checkUnique(request.body.uname, request.body.email);
  promise.then(function(value){
    if (value=="All good")
    {
      register.saveData(request.body.uname, request.body.pass, request.body.fname,request.body.lname, request.body.email)
      response.send(value)
    }
    else response.send(value);
    response.end(' ');
  });
});

app.get('/verify/:email/:hash', function(request, response){
  response.writeHead(200, {"Content-Type": "text/html"});
  var status = verify.checkHash(request.params.email, request.params.hash);
  status.then(function(value){
    if (value == 0){
      response.write('<p align="center">Your email has been verified</p><p align="center">You will be redirected to the login page shortly</p><script>setTimeout(function(){window.location.href="/login"},5000)</script>')
    }
    else response.write('<p align="center">The verification string doesn\'t match, or the email is already verified</p>')
    response.end();
  })

});

app.listen(8080);
