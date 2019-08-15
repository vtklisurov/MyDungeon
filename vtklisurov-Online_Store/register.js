var md5 = require('md5');
var nodemailer = require('nodemailer');
var bcrypt = require('bcrypt');
var saltrounds = 12;
const { Client } = require('pg');
const connectionString = 'postgresql://velin:9810017583@localhost:5432/store';

// async function checkUnique(username,email)
// {
//   var client = new Client({
//     connectionString: connectionString
//   });
//   var sql = "select username, email from users;";
//   console.log("gonna connect");
//   client.connect();
//   console.log('after connect');
//   client.query(sql, function (err, result){
//     console.log("after query");
//     for (var i = 0; i < result.rowCount; i++) {
//       if (username == result.rows[i].username) return "Username exists";
//       else if (email == result.rows[i].email) return "Email exists";
//     }
//     return "All good";
//   });
//   client.end();
//   return "finished function";
// }

function checkResult (result, username, email){
  for (var i = 0; i < result.rowCount; i++) {
    if (username == result.rows[i].username) return "Username exists";
    else if (email == result.rows[i].email) return "Email exists";
  }
  return "All good";
}

async function checkUnique(username,email)
{
  var client = new Client({
    connectionString: connectionString
  });
  var sql = "select username, email from users";
  client.connect();
  result = client.query(sql);
  console.log(result);
  res = await checkResult(result, username, email);
  client.end();
  return res;
}

function saveData(username, pass, fname, lname, email)
{
  var client = new Client({
    connectionString: connectionString
  });
  var hash = md5(Math.floor(Math.random() * 1000))
  var sql = "insert into users (username, pass, fname, lname, email, hash) values ($1,$2,$3,$4,$5,$6);"
  client.connect();
  insert = client.query(sql,[username, pass, fname, lname, email, hash]);
  console.log(insert)

  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'vtklisurov@gmail.com',
      pass: 'Dell+Toshib@123'
    }
  });

  var mailOptions = {
    from: 'klisurovi4@gmail.com',
    to: email,
    subject: 'Account Verification',
    text: 'Please click this link to verify your account http://localhost:8080/verify?hash=' + hash
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



module.exports = {
    checkUnique,
    saveData
}
