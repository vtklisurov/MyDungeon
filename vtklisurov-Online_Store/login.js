var bcrypt = require('bcrypt');
const { Client } = require('pg');
const connectionString = 'postgresql://velin:9810017583@localhost:5432/store';

var html = '<!DOCTYPE html>'
+ '<head>\n'
+ '  <style>\n'
+ '    input, label {\n'
+ '      display:block;\n'
+ '    }\n'
+ '  </style>\n'
+ '  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />\n'
+ '  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.0/jquery.min.js"></script>\n'
+ '  <script>\n'
+ '  localStorage.removeItem("status");\n'
+ '\n'
+ '  function submitForm(){\n'
+ '    var uname = document.getElementById("username").value;\n'
+ '    var pass = document.getElementById("password").value;\n'
+ '\n'
+ '    document.cookie = "loggedIn=; expires=Thu, 08 Aug 2019 00:00:01 GMT;  path=/";\n'
+ '    document.cookie = "admin=; expires=Thu,  08 Aug 2019 00:00:01 GMT;  path=/";\n'
//+ '    alert("cookie="document.cookie);\n'
+ '    if(uname !="" && pass!=""){\n'
+ '      $.post("login.js", $("#loginform").serialize(), function (status){\n'
+ '        if (status=="Success"){\n'
+ '          alert("Welcome");\n'
+ '          document.cookie="loggedIn=yes; path=/";\n'
+ '          alert(document.cookie);\n'
+ '          window.location.href="/";\n'
+ '        }\n'
+ '        else if (status=="Admin"){\n'
+ '          alert("Welcome, admin");\n'
+ '          document.cookie="admin=yes; path=/";\n'
+ '          window.location.href="/admin";\n'
+ '        }\n'
+ '        else alert(status);\n'
+ '      });\n'
+ '    }\n'
+ '    else alert("All fields are required");\n'
+ '  }\n'
+ '  function goToRegister(){\n'
+ '    window.location.href="register";\n'
+ '  }\n'
+ '  </script>\n'
+ '</head>\n'
+ '<body>\n'
+ '  <form autocomplete="off" id="loginform" action="login.js" method="POST" >\n'
+ '    <div>\n'
+ '      <label for="username">Username:</label>\n'
+ '      <input type="text" id="username" name="uname"/><br>\n'
+ '    </div>\n'
+ '    <div>\n'
+ '      <label for="password">Password:</label>\n'
+ '      <input type="password" id="password" name="pass"/><br>\n'
+ '    </div>\n'
+ '      <input type="button" id="login" value="Login" onclick="submitForm()" />\n'
+ '      <label style="display:inline" for="register">If you don\'t have an account, please register: </label>\n'
+ '      <input style="display:inline" type="button" id="register" value="Register" onclick="goToRegister()" />\n'
+ '    </form>\n'
+ '</body>\n'

async function checkLogin(username, pass){
  var client = new Client({
    connectionString: connectionString
  });

  var sql = "select pass, status from users where username=$1"
  client.connect();
  result = await client.query(sql,[username]);
  console.log(pass);
  console.log(result.rows[0].pass)
  res = await bcrypt.compare(pass, result.rows[0].pass);
  if(res && result.rows[0].status==0) return "Please verify your account before logging in";
  else if (res && result.rows[0].status==1) {
    var sql = "update only users set last_login=NOW() where username=$1"
    client.query(sql,[username])
    return "Success"
  }
  else if (res && result.rows[0].status==2) return "Your account has been banned";
  else if (res && result.rows[0].status==3) return "Admin";
  else return ("Username and password do not match");
}

module.exports = {
  html,
  checkLogin
}
