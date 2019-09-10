const { Client } = require('pg');
const connectionString = require('./connector.js').connectionString;

async function unameToUid(uname){
  var client = new Client({
    connectionString: connectionString
  });
  client.connect();
  var uid;
  var err;
  var result = await client.query('SELECT user_id FROM users WHERE username=$1', [uname]);
  if (result.rowCount === 0) {
    err = Error("User doesn't exist");
    throw (err);
  } else if (result.rowCount !== 1) {
    err = Error('Repeating usernames');
    throw (err);
  } else {
    uid = result.rows[0].user_id;
  }
  client.end();
  return uid;
}

async function removeProduct(pid, uname){
  var client = new Client({
    connectionString: connectionString
  });

  var uid = await unameToUid(uname);

  client.connect();
  var result = await client.query('SELECT cart_id, price FROM carts WHERE user_id=$1', [uid]);
  var cid =result.rows[0].cart_id;
  var price = Number(result.rows[0].price);

  result = await client.query('SELECT price FROM products WHERE id=$1', [pid]);
  price-=result.rows[0].price;

  result = await client.query('SELECT quantity FROM cart_products WHERE cart_id=$1 AND product_id=$2', [cid,pid])
  if (result.rows[0].quantity===1){
    await client.query('DELETE FROM cart_products WHERE cart_id=$1 AND product_id=$2', [cid,pid])
    await client.query('UPDATE carts SET price=$1 WHERE cart_id=$2', [price, cid]);
  }else{
    await client.query('UPDATE cart_products SET quantity=quantity-1 WHERE cart_id=$1 AND product_id=$2', [cid, pid]);
    await client.query('UPDATE carts SET price=$1 WHERE cart_id=$2', [price, cid]);
  }


  client.end();
}

async function getProducts (uname) {
  var client = new Client({
    connectionString: connectionString
  });

  var uid = await unameToUid(uname);

  client.connect();
  var result = await client.query('SELECT cart_id, price FROM carts WHERE user_id=$1', [uid]);
  var cid =result.rows[0].cart_id;
  var price = result.rows[0].price;
  result = await client.query('SELECT product_id FROM cart_products WHERE cart_id=$1', [cid]);

  var pids=[];
  for (var i = 0; i < result.rowCount; i++) {
    pids.push(result.rows[i].product_id);
  }
  var items = {};
  items.product=[{}];
  for (var i = 0; i < pids.length; i++) {
    result = await client.query('SELECT * FROM products WHERE id=$1', [pids[i]]);
    if (i!==0) {
      items.product.push({});
    }
    items.product[i].id=result.rows[0].id;
    items.product[i].name=result.rows[0].name;
    items.product[i].price=Number(result.rows[0].price);
    result = await client.query('SELECT quantity FROM cart_products WHERE cart_id=$1 AND product_id=$2', [cid,pids[i]]);
    items.product[i].quantity= result.rows[0].quantity
  }
  items.total=price;
  return items;
}

async function addProduct (pid, user) {
  var client = new Client({
    connectionString: connectionString
  });

  var uid = await unameToUid(user);

  client.connect();
  var cid;
  var price = 0;
  result = await client.query('SELECT cart_id,price FROM carts WHERE user_id=$1', [uid]);
  if (result.rowCount === 0) {
    result = await client.query('INSERT INTO carts (user_id) values ($1) RETURNING cart_id', [uid]);
    cid = result.rows[0].cart_id;
  } else if (result.rowCount !== 1) {
    err = Error('Repeating cart_id');
    throw (err);
  } else {
    cid = result.rows[0].cart_id;
    price = Number(result.rows[0].price);
  }

  result = await client.query('SELECT * FROM cart_products WHERE cart_id=$1 AND product_id=$2', [cid, pid]);
  if (result.rowCount === 0) {
    await client.query('INSERT INTO cart_products (cart_id, product_id) VALUES ($1,$2)', [cid, pid]);
  } else {
    await client.query('UPDATE cart_products SET quantity=quantity+1 WHERE cart_id=$1 AND product_id=$2', [cid, pid]);
  }

  result = await client.query('SELECT price FROM products WHERE id=$1', [pid]);
  if (result.rowCount === 1) {
    price += Number(result.rows[0].price);
  } else {
    err = new Error('Repeating product id');
    throw (err);
  }

  await client.query('UPDATE carts SET price=$1 WHERE cart_id=$2', [price, cid]);
  client.end();
}

module.exports = {
  getProducts,
  addProduct,
  removeProduct
};
