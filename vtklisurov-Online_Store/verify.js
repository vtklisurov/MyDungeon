const { Client } = require('pg');
const connectionString = 'postgresql://velin:9810017583@localhost:5432/store';

async function checkHash(email, hash){
  var client = new Client({
    connectionString: connectionString
  });
  var sql = "select hash from users where email = $1";
  client.connect();
  var res;
  result = await client.query(sql, [email])
  if (hash==result.rows[0].hash) {
    res = await verify(email);
    client.end();
    return res;
  }
  else {
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
  await client.query(sql, [email], async function(err,result){
    status=0;
    if (result.rowCount==0) status=1;
    client.end();
  })
  return status
}

module.exports = {
    checkHash
}
