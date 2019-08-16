var md5 = require('md5');
var nodemailer = require('nodemailer');
var bcrypt = require('bcrypt');
var saltrounds = 12;
const { Client } = require('pg');
const connectionString = 'postgresql://velin:9810017583@localhost:5432/store';

var html = '<head>'
+ '  <style>'
+ '    input, label {'
+ '      display:block;'
+ '    }'
+ '  </style>'
+ '  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />'
+ '  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.0/jquery.min.js"></script>'
+ '  <script>'
+ '  function submitForm(){'
+ '    var uname = document.getElementById("username").value;'
+ '    var pass = document.getElementById("password").value;'
+ '    var pass2 = document.getElementById("password2").value;'
+ '    var fname = document.getElementById("fname").value;'
+ '    var lname = document.getElementById("lname").value;'
+ '    var email = document.getElementById("email").value;'
+ ''
+ '    if(uname !="" && pass!="" && pass2!="" && fname!="" && lname!="" && email!=""){'
+ '      if (document.getElementById("password").value == document.getElementById("password2").value){'
+ '        $.post("register.js", $("#registerform").serialize(), function (status){'
+ '          if (status!="All good") alert(status);'
//+ '          else if (status==2) alert("This email is already registered");'
//+ '          else if (status==3) alert("The password is too short");'
+ '          else window.location.href="success";'
+ '        });'
+ '      }'
+ '      else alert("passwords do not match");'
+ '    }'
+ '    else alert("all fields are required");'
+ '  }'
+ '  function goToLogin(){'
+ '    window.location.href="login";'
+ '  }'
+ '  </script>'
+ '</head>'
+ '<body>'
+ '  <form autocomplete="off" id="registerform" action="register.js" method="POST" >'
+ '    <div>'
+ '      <label for="username">Username:</label>'
+ '      <input type="text" id="username" name="uname"/><br>'
+ '    </div>'
+ '    <div>'
+ '      <label for="password">Password:</label>'
+ '      <input type="password" id="password" name="pass"/><br>'
+ '    </div>'
+ '    <div>'
+ '      <label for="password2">Confirm password:</label>'
+ '      <input type="password" id="password2" name="pass2"/><br>'
+ '    </div>'
+ '    <div>'
+ '      <label for="fname">First name:</label>'
+ '      <input type="text" id="fname" name="fname"/><br>'
+ '    </div>'
+ '    <div>'
+ '      <label for="lname">Last name:</label>'
+ '      <input type="text" id="lname" name="lname"/><br>'
+ '    </div>'
+ '    <div>'
+ '      <label for="email">Email:</label>'
+ '      <input type="email" id="email" name="email"/><br>'
+ '    </div>'
+ '      <input type="button" id="submit" value="Register" onclick="submitForm()" />'
+ '      <label style="display:inline" for="login">If you already have an account, please log in</label>'
+ '      <input style="display:inline" type="button" id="login" value="Login" onclick="goToLogin()" />'
+ '    </form>'
+ '</body>'


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
  var unique;
  result = await client.query(sql, async function(err,result){
    res = await checkResult(result, username, email);
    client.end();
    return res;
  })
  unique = await checkResult(result, username, email);
  return unique;
}

async function saveData(username, pass, fname, lname, email)
{
  var client = new Client({
    connectionString: connectionString
  });
  var hash = await md5(Math.floor(Math.random() * 1000))
  bcrypt.hash(pass,saltrounds, async function(err,hashedpass){
    var sql = "insert into users (username, pass, fname, lname, email, hash) values ($1,$2,$3,$4,$5,$6)"
    client.connect();
    insert = await client.query(sql,[username, hashedpass, fname, lname, email, hash], async function(err, result){
      if(err) console.log(err);
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
    saveData,
    html
}
