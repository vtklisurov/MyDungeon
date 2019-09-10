// var app = require('http').createServer(createServer);
var path = require('path');
var homepage = require('./home');
var verify = require('./verify');
var express = require('express');
var app = express();
var myParser = require('body-parser');
var register = require('./register');
var login = require('./login');
var redis = require('redis');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var client = redis.createClient();
var productControls = require('./product_controls');
var formidable = require('formidable');
var cart = require('./carts.js');

var images = path.join(__dirname, 'images');
var publicfiles = path.join(__dirname, 'public');
app.use(session({
  secret: 'idk',
  store: new RedisStore({ host: 'localhost', port: 6379, client: client, ttl: 260 }),
  saveUninitialized: false,
  resave: false
}));
app.use(myParser.urlencoded({ extended: true }));
app.use('/images', express.static(images));
app.use('/public', express.static(publicfiles));

app.get('/register', async function (request, response) {
  response.sendFile('public/register.html', { root: __dirname });
});

app.get('/', function (request, response) {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(homepage.products());
  response.end();
});

app.get('/success', function (request, response) {
  response.sendFile('public/success.html', { root: __dirname });
});

app.get('/login', function (request, response) {
  response.sendFile('public/login.html', { root: __dirname });
});

app.get('/admin', function (request, response) {
  response.sendFile('public/admin_controls.html', { root: __dirname });
  // if (request.session.admin) {
  //   response.sendFile('public/admin_controls.html', { root: __dirname });
  // } else if (request.session.user) {
  //   response.redirect('/');
  // } else {
  //   response.redirect('/login');
  // }
});

app.get('/cart', function (request, response) {
  response.sendFile('public/cart.html', { root: __dirname });
});

app.post('/login', function (request, response) {
  var promise = login.checkLogin(request.body.uname, request.body.pass);
  promise.then(function (value) {
    if (value === 'Success') {
      request.session.user = request.body.uname;
    } else if (value === 'Admin') {
      request.session.user = request.body.uname;
      request.session.admin = 'yes';
    }
    response.send(value);
    response.end(' ');
  });
});

app.post('/logout', function (request, response) {
  if (request.session.user) {
    request.session.destroy();
    response.redirect('/');
  } else {
    response.redirect('/');
  }
});

app.post('/productControls', function (request, response) {
  var form = new formidable.IncomingForm();
  form.parse(request, async function (err, fields, files) {
    if (err) {
      console.log(err);
      response.end();
    }
    if (fields.form === 'update') {
      await productControls.update(fields, files);
    } else if (fields.form === 'add') {
      await productControls.add(fields, files);
    } else if (fields.form === 'delete') {
      await productControls.remove(fields);
    }
    response.end();
  });
});

app.post('/islogged', function (request, response) {
  response.send(request.session);
});

app.post('/getCart', async function (request, response) {
  var result = await cart.getProducts(request.body.uname);
  response.send(result);
});

app.post('/addToCart', function (request, response) {
  cart.addProduct(request.body.pid, request.session.user);
});

app.post('/removeProduct', async function (request, response) {
  await cart.removeProduct(request.body.item, request.session.user);
  response.end()
});

app.post('/register', function (request, response) {
  var promise = register.checkUnique(request.body.uname, request.body.email);
  promise.then(function (value) {
    if (value === 'All good') {
      register.saveData(request.body.uname, request.body.pass, request.body.fname, request.body.lname, request.body.email);
      response.send(value);
    } else {
      response.send(value);
    }
    response.end(' ');
  });
});

app.get('/verify/:email/:hash', function (request, response) {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  var status = verify.checkHash(request.params.email, request.params.hash);
  status.then(function (value) {
    if (value === 'Ok') {
      response.write('<p align="center">Your email has been verified</p><p align="center">You will be redirected to the login page shortly</p><script>setTimeout(function(){window.location.href="/login"},5000)</script>');
    } else {
      response.write('<p align="center">' + value + '</p>');
    }
    response.end();
  });
});

app.listen(8080);
