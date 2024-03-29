var md5 = require('md5');
var nodemailer = require('nodemailer');
var bcrypt = require('bcrypt');
var saltrounds = 12;
const { Client } = require('pg');
const connectionString = require('./connector.js').connectionString;
const serverAddr = require('./server_address.js').server;
const serverPort= require('./server_address.js').port;
const mailCredentials = require ('./mail_credentials.js');

async function checkData (data) {
  var client = new Client({
    connectionString: connectionString
  });

  if (!data.uname || !data.email || !data.pass || !data.pass2 || !data.fname || !data.lname) {
    return 'All fields are required';
  }
  if (data.pass !== data.pass2) {
    return 'Passwords do not match';
  }

  client.connect();
  var result = await client.query('SELECT username, email FROM users WHERE username=$1 OR username IN (SELECT username FROM staff WHERE username=$1)', [data.uname]);

  if (result.rowCount !== 0) {
    return 'Username exists';
  } else {
    result = await client.query('SELECT username, email FROM users WHERE email=$1 OR email IN (SELECT username FROM staff WHERE username=$1)', [data.email]);
    if (result.rowCount !== 0) {
      return 'Email exists';
    } else {
      return 'All good';
    }
  }
}

async function saveUser (username, pass, fname, lname, email, isAdmin) {


  
  var hash = await md5(Math.floor(Math.random() * 1000));
console.log("hashing pass");
  bcrypt.hash(pass, saltrounds, function (err, hashedpass) {
    if (err) {
      return 'Error with the password hashing';
    }
	
	var client = new Client({
		connectionString: connectionString
	});
	
    client.connect();
    if (isAdmin) {
      client.query('INSERT INTO staff (staff_id, username, pass, fname, lname, email) OVERRIDING SYSTEM VALUE VALUES ((select COALESCE(max(staff_id),0) from staff)+1, $1,$2,$3,$4,$5)', [username, hashedpass, fname, lname, email], function (err, result) {
        if (err) {
          console.log(err);
          return 'Error in the database';
        }
        client.end();
      });
    } else {
		console.log("inserting into db");
      client.query('INSERT INTO users (user_id, username, pass, fname, lname, email, hash) OVERRIDING SYSTEM VALUE VALUES ((select COALESCE(max(user_id),0) from users)+1, $1,$2,$3,$4,$5,$6)', [username, hashedpass, fname, lname, email, hash], function (err, result) {
        if (err) {
          console.log(err);
          return 'Error in the database';
        }
        client.end();
      });
    }
  });

  var transporter = nodemailer.createTransport({
    service: mailCredentials.service,
    auth: {
      user: mailCredentials.email,
      pass: mailCredentials.pass
    }
  });

  var mailOptions = {
    from: 'MyDungeon@gmail.com',
    to: email,
    subject: 'Account Verification',
    text: 'Please click this link to verify your account http://' + serverAddr + ':' + serverPort + '/verify/' + email + '/' + hash
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });

}

async function deleteUnverified () {
	
	var client = new Client({
		connectionString: connectionString
	});
	
    await client.connect();
  
  
  await client.query('DELETE FROM users WHERE status=0 AND created < NOW() - INTERVAL \'15 minutes\';', function (err, result) {
    if (err) {
	  console.log("Error from the deleting unverified users")
      console.log(err);
    } 
  });
  //client.end();
}

module.exports = {
  checkData,
  // saveAdmin,
  saveUser,
  deleteUnverified
};
