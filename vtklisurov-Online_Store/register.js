var md5 = require('md5');
var nodemailer = require('nodemailer');
var bcrypt = require('bcrypt');
var saltrounds = 12;
const { Client } = require('pg');
const connectionString = require('./connector.js').connectionString;

async function checkUnique (username, email) {
  var client = new Client({
    connectionString: connectionString
  });

  client.connect();
  var result = await client.query('SELECT username, email FROM users WHERE username=$1', [username]);

  if (result.rowCount !== 0) {
    return 'Username exists';
  } else {
    result = await client.query('SELECT username, email FROM users WHERE email=$1', [username]);

    if (result.rowCount !== 0) {
      return 'Email exists';
    } else {
      return 'All good';
    }
  }
}

async function saveData (username, pass, fname, lname, email) {
  var client = new Client({
    connectionString: connectionString
  });

  var hash = await md5(Math.floor(Math.random() * 1000));

  bcrypt.hash(pass, saltrounds, function (err, hashedpass) {
    if (err) {
      return 'Error with the password hashing';
    }
    client.connect();
    client.query('INSERT INTO users (username, pass, fname, lname, email, hash) VALUES ($1,$2,$3,$4,$5,$6) RETURNING username', [username, hashedpass, fname, lname, email, hash], function (err, result) {
      if (err) {
        return 'Error in the database';
      }
      client.end();
      setTimeout(function () {
        var client = new Client({
          connectionString: connectionString
        });
        client.connect();
        client.query('DELETE FROM users WHERE username=$1 AND status=0', [result.rows[0].username]);
      }, 600000);
    });
  });

  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'vtklisurov@gmail.com',
      pass: 'Dell+Toshib@123'
    }
  });

  var mailOptions = {
    from: 'online_store_task@gmail.com',
    to: email,
    subject: 'Account Verification',
    text: 'Please click this link to verify your account http://localhost:8080/verify/' + email + '/' + hash
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
  client.end();
}

module.exports = {
  checkUnique,
  saveData
};
