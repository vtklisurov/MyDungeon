var md5 = require('md5');
var nodemailer = require('nodemailer');
var bcrypt = require('bcrypt');
var saltrounds = 12;
var { Client } = require('pg');
var connectionString = 'postgresql://velin:9810017583@localhost:5432/store';

function checkUnique(username,email)
{
  var client = new Client({
    connectionString: connectionString
  });
  var sql = "select username, email from users"
  console.log(username)
  client.connect();
  client.query(sql, function (err, result){
    for (var i = 0; i < result.rowCount; i++) {

      if (username == result.rows[i].username) return 1;
      else if (email == result.rows[i].email) return 2;
    }
    return 0;
  });
  client.end();
}

function saveData(username, pass, fname, lname, email)
{
  var client = new Client({
    connectionString: connectionString
  });
  var hash = md5(Math.floor(Math.random() * 1000))
  var sql = "insert into users (username, pass, fname, lname, email, hash) values ($1,$2,$3,$4,$5,$6);"
  client.connect();
  client.query(sql,[username, pass, fname, lname, email, hash]);

  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'klisurovi4@gmail.com',
      pass: 'Toshib@+Dell123'
    }
  });

  var mailOptions = {
    from: 'vtklisurov@gmail.com',
    to: email,
    subject: 'Account Verification',
    text: 'Please click this link to verify your account localhost:8080/verify?hash=' + hash
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
  client.end();
}



exports.check= function(username, email) {return checkUnique(username, email)};
exports.save = function(username, pass, fname, lname, email) {return saveData(username, pass, fname, lname, email)};
