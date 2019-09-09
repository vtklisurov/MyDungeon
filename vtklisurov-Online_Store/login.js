var bcrypt = require('bcrypt');
const { Client } = require('pg');
const connectionString = require('./connector.js').connectionString;

async function checkLogin (username, pass) {
  var client = new Client({
    connectionString: connectionString
  });

  client.connect();
  var result = await client.query('SELECT pass, status FROM users WHERE username=$1', [username]);
  var res = await bcrypt.compare(pass, result.rows[0].pass);
  if (res && result.rows[0].status === 0) return 'Please verify your account before logging in';
  else if (res && result.rows[0].status === 1) {
    client.query('UPDATE ONLY users SET last_login=NOW() WHERE username=$1', [username]);
    return 'Success';
  } else if (res && result.rows[0].status === 2) return 'Your account has been banned';
  else if (res && result.rows[0].status === 3) {
    client.query('UPDATE ONLY users SET last_login=NOW() WHERE username=$1', [username]);
    return 'Admin';
  } else return ('Username and password do not match');
}

module.exports = {
  checkLogin
};
