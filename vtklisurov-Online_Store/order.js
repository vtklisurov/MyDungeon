const { Client } = require('pg');
const connectionString = require('./connector.js').connectionString;
var convert = require('./convert');

async function place (user, addr) {
  var client = new Client({
    connectionString: connectionString
  });

  var uid = await convert.unameToUid(user);
  var cid = await convert.uidToCid(uid);

  client.connect();
  try {
    var result = await client.query('INSERT INTO orders(user_id,address_id) VALUES($1,$2) RETURNING id', [uid, addr]);
    await client.query('INSERT INTO order_products(order_id,product_id,quantity,price) SELECT $1, product_id, quantity, price FROM cart_products WHERE cart_id=$2', [result.rows[0].id, cid]);
  } catch (err) {
    console.log(err);
    return 'Order could not be placed';
  }
  try {
    await client.query('DELETE FROM cart_products WHERE cart_id=$1', [cid]);
    await client.query('DELETE FROM carts WHERE cart_id=$1', [cid]);
  } catch (err) {
    console.log(err);
  }
  return 'Order placed';
}

async function changeStatus (status, id) {
  var client = new Client({
    connectionString: connectionString
  });

  client.connect();
  try {
    await client.query('UPDATE orders SET status=$1 WHERE id=$2', [status, id]);
    if (status === 2) await client.query('UPDATE payments SET is_paid=true, time_paid=NOW() WHERE order_id=$2', [status, id]);
  } catch (err) {
    console.log(err);
    return 'Order status could not be changed';
  }
}

async function getPayTypes () {
  var client = new Client({
    connectionString: connectionString
  });

  client.connect();
  try {
    var result = await client.query('SELECT * FROM payment_type');
  } catch (err) {
    console.log(err);
    throw err;
  }
  return result.rows;
}

module.exports = {
  place,
  changeStatus,
  getPayTypes
};
