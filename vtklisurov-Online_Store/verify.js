const { Client } = require('pg');
const connectionString = require("./connector.js").connectionString

async function checkHash(email, hash){
  var client = new Client({
    connectionString: connectionString
  });
  var sql = "select hash from users where email = $1";
  client.connect();
  var res;
  result = await client.query(sql, [email])
  //add error checking here for row cnt
  if (hash==result.rows[0].hash) {
    res = await verify(email);
    client.end();
    return res;
  } else {
    //use error throwing
    client.end();
    res = 1;
    return res;
  }
}

async function verify(email){
  var client = new Client({
    connectionString: connectionString
  });
  var sql = "update only users set status=1 where email=$1 and status=0;";
  client.connect();
  var status;
  await client.query(sql, [email], function(err,result){
    status=0;
    if (result.rowCount==0) {
      status=1;
    }
    client.end();
  })
  return status
}

module.exports = {
    checkHash
}
