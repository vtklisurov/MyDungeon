var bcrypt = require('bcrypt');
const { Client } = require('pg');
const connectionString = require("./connector.js").connectionString


async function checkLogin(username, pass){
  var client = new Client({
    connectionString: connectionString
  });

  var sql = "select pass, status from users where username=$1"
  client.connect();
  result = await client.query(sql,[username]);
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
  checkLogin
}
