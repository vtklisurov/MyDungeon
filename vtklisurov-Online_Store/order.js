const { Client } = require('pg');
const connectionString = require('./connector.js').connectionString;
var convert = require('./convert');

async function place (user, data) {
  var client = new Client({
    connectionString: connectionString
  });

  var uid = await convert.unameToUid(user);
  var cid = await convert.uidToCid(uid);
  var result;

  client.connect();

  try {
    result = await client.query('SELECT name FROM cart_products JOIN products on cart_products.product_id = products.id WHERE cart_id=$1 AND stock<quantity', [cid]);
  } catch (err) {
    console.log(err);
    return 'Order could not be placed';
  }

  if (result.rowCount !== 0) {
    if (result.rowCount === 1) {
      return 'There is not enough of product ' + result.rows[0].name + ' in stock';
    } else {
      var str = 'There is not enough of products ';
      for (var i = 0; i < result.rowCount; i++) {
        str += result.rows[i].name;
        if (i < result.rowCount - 1) {
          str += ', ';
        }
      }
      str += ' in stock';
      return str;
    }
  }

  try {
    result = await client.query('INSERT INTO orders(user_id,address_id) VALUES($1,$2) RETURNING id', [uid, data.addr]);
    var orderID = result.rows[0].id;
    await client.query('INSERT INTO order_products(order_id,product_id,quantity,price) SELECT $1, product_id, quantity, price FROM cart_products WHERE cart_id=$2', [result.rows[0].id, cid]);
  } catch (err) {
    console.log(err);
    return 'Order could not be placed';
  }

  try {
    result = await client.query('SELECT product_id, quantity FROM cart_products where cart_id=$1', [cid]);
    for (var j = 0; j < result.rowCount; j++) {
      await client.query('UPDATE products SET stock=stock-$1 where id=$2', [result.rows[j].quanity, result.rows[j].id]);
    }
  } catch (err) {
    console.log(err);
  }

  try {
    var total = 0;
    result = await client.query('SELECT price,quantity FROM order_products WHERE order_id=$1', [orderID]);
    for (var k = 0; k < result.rowCount; k++) {
      total += result.rows[k].price / 100 * result.rows[k].quantity;
      total = total.toFixed(2);
    }

    await client.query('INSERT INTO payments(order_id,type,amount) values($1,$2,$3)', [orderID, data.type, Number(total) * 100]);
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
    if (status === 2) {
      await client.query('UPDATE payments SET is_paid=true, time_paid=NOW() WHERE order_id=$2 AND status=3', [status, id]);
    }
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
