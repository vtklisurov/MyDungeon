var md5 = require('md5');
var nodemailer = require('nodemailer');
var bcrypt = require('bcrypt');
var saltrounds = 12;
const { Client } = require('pg');
const connectionString = require("./connector.js").connectionString

var html = '<head>\n'
+ '  <style>\n'
+ '    input, label {\n'
+ '      display:block;\n'
+ '    }\n'
+ '  </style>\n'
+ '  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />\n'
+ '  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.0/jquery.min.js"></script>\n'
+ '  <script>\n'
+ '  function submitForm(){\n'
+ '    var uname = document.getElementById("username").value;\n'
+ '    var pass = document.getElementById("password").value;\n'
+ '    var pass2 = document.getElementById("password2").value;\n'
+ '    var fname = document.getElementById("fname").value;\n'
+ '    var lname = document.getElementById("lname").value;\n'
+ '    var email = document.getElementById("email").value;\n'
+ '\n'
+ '    if(uname !="" && pass!="" && pass2!="" && fname!="" && lname!="" && email!=""){\n'
+ '      if (document.getElementById("password").value == document.getElementById("password2").value){\n'
+ '        $.post("register.js", $("#registerform").serialize(), function (status){\n'
+ '          if (status=="All good") {window.location.href="/success";\n'
+ '        });\n'
+ '      }\n'
+ '      else alert("passwords do not match");\n'
+ '    }\n'
+ '    else alert("all fields are required");\n'
+ '  }\n'
+ '  function goToLogin(){\n'
+ '    window.location.href="/login";\n'
+ '  }\n'
+ '  </script>\n'
+ '</head>\n'
+ '<body>\n'
+ '  <form autocomplete="off" id="registerform" action="register.js" method="POST" >\n'
+ '    <div>\n'
+ '      <label for="username">Username:</label>\n'
+ '      <input type="text" id="username" name="uname"/><br>\n'
+ '    </div>\n'
+ '    <div>\n'
+ '      <label for="password">Password:</label>\n'
+ '      <input type="password" id="password" name="pass"/><br>\n'
+ '    </div>\n'
+ '    <div>\n'
+ '      <label for="password2">Confirm password:</label>\n'
+ '      <input type="password" id="password2" name="pass2"/><br>\n'
+ '    </div>\n'
+ '    <div>\n'
+ '      <label for="fname">First name:</label>\n'
+ '      <input type="text" id="fname" name="fname"/><br>\n'
+ '    </div>\n'
+ '    <div>\n'
+ '      <label for="lname">Last name:</label>\n'
+ '      <input type="text" id="lname" name="lname"/><br>\n'
+ '    </div>\n'
+ '    <div>\n'
+ '      <label for="email">Email:</label>\n'
+ '      <input type="email" id="email" name="email"/><br>\n'
+ '    </div>\n'
+ '      <input type="button" id="submit" value="Register" onclick="submitForm()" />\n'
+ '      <label style="display:inline" for="login">If you already have an account, please log in</label>\n'
+ '      <input style="display:inline" type="button" id="login" value="Login" onclick="goToLogin()" />\n'
+ '    </form>\n'
+ '</body>\n'

// function checkResult (result, username, email){
//   for (var i = 0; i < result.rowCount; i++) {
//     if (username == result.rows[i].username) return "Username exists";
//     else if (email == result.rows[i].email) return "Email exists";
//   }
//   return "All good";
// }

async function checkUnique(username,email)
{
  var client = new Client({
    connectionString: connectionString
  });
  var sql = "select username, email from users where username=$1";

  client.connect();
  result = await client.query(sql,[username]);

  if (result.rowCount!=0) {
    return "Username exists"
  } else {
    sql = "select username, email from users where email=$1";
    result = await client.query(sql,[username]);
    if (result.rowCount!=0) return "Email exists"
    else return "All good"
  }

  client.end();
}

async function saveData(username, pass, fname, lname, email)
{
  var client = new Client({
    connectionString: connectionString
  });

  var hash = await md5(Math.floor(Math.random() * 1000))

  bcrypt.hash(pass,saltrounds, function(err,hashedpass){
    var sql = "insert into users (username, pass, fname, lname, email, hash) values ($1,$2,$3,$4,$5,$6) returning username"
    client.connect();
    client.query(sql,[username, hashedpass, fname, lname, email, hash], function(err, result){
      client.end();
      setTimeout(function(){
        var client = new Client({
          connectionString: connectionString
        });
        client.connect();
        sql = "delete from users where username=$1 and status=0";
        client.query(sql,[result.rows[0].username]);
      }, 600000)
    });
  })

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
    text: 'Please click this link to verify your account http://localhost:8080/verify/'+email +'/' + hash
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
    saveData,
    html
}
