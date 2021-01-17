const { Client } = require('pg');
const connectionString = require('./connector.js').connectionString;
var convert = require('./convert');
var paypal = require('paypal-rest-sdk');
var server = require('./server_address').server;
var port = require('./server_address').port;
paypal.configure({
  mode: 'sandbox', // sandbox or live
  client_id: 'Af84lwtHLfjxnC1cMgUfwfbLvyZc17LIriaadXfkx5RtMi24w1jfTiZQfJjE5JAcvBKsHdm3FUjfJP4l', // please provide your client id here
  client_secret: 'EHK7uNglLnWc0xxXCWzk6Bl2XR9o-RprJrTm02PRy-laFJJQkWcIbwVMrq7u4q0cMNSt9p6fPY8lO427' // provide your client secret here
});

var createPay = (payment) => {
  return new Promise((resolve, reject) => {
    paypal.payment.create(payment, function (err, payment) {
      if (err) {
        reject(err);
      } else {
        resolve(payment);
      }
    });
  });
};

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
    result = await client.query('INSERT INTO orders(id, user_id,address_id) VALUES((select COALESCE(max(id),0) from orders)+1, $1,$2) RETURNING id', [uid, data.addr]);
    var orderID = result.rows[0].id;
    await client.query('INSERT INTO order_products(order_id,product_id,quantity,price) SELECT $1, product_id, quantity, products.price FROM cart_products join products on product_id = products.id WHERE cart_id=$2', [result.rows[0].id, cid]);
  } catch (err) {
    console.log(err);
    return 'Order could not be placed';
  }

  try {
    result = await client.query('SELECT product_id, quantity FROM cart_products where cart_id=$1', [cid]);
    for (var j = 0; j < result.rowCount; j++) {
      await client.query('UPDATE products SET stock=stock-$1 where id=$2', [result.rows[j].quantity, result.rows[j].id]);
    }
  } catch (err) {
    console.log(err);
  }

  try {
    var total = 0;
    result = await client.query('SELECT price,quantity FROM order_products WHERE order_id=$1', [orderID]);
    for (var k = 0; k < result.rowCount; k++) {
      total += result.rows[k].price / 100 * result.rows[k].quantity;
    }
    console.log(total);
    total = total.toFixed(2);
    result = await client.query('INSERT INTO payments(id, order_id,type,amount) values((select COALESCE(max(id),0) from payments)+1, $1,$2,$3) RETURNING id', [orderID, data.type, Math.round(total * 100)]);
  } catch (err) {
    console.log(err);
    return 'Order could not be placed';
  }

  if (data.type === '0') {
    // create payment object
    var payment = {
      intent: 'authorize',
      payer: {
        payment_method: 'paypal'
      },
      redirect_urls: {
        return_url: 'http://' + server + ':' + port + '/PaySuccess',
        cancel_url: 'http://' + server + ':' + port + '/err'
      },
      transactions: [{
        amount: {
          total: total,
          currency: 'USD'
        },
        description: 'Order with ID' + orderID
      }]
    };

    // call the create Pay method
    var returnUrl;
    await createPay(payment)
      .then((transaction) => {
        var id = transaction.id;
        var links = transaction.links;
        var counter = links.length;
        while (counter--) {
          if (links[counter].method === 'REDIRECT') {
          // redirect to paypal where user approves the transaction
            returnUrl = links[counter].href;
            return;
          }
        }
      })
      .catch((err) => {
        console.log(err);
        returnUrl = '/err';
      });
  } else if (data.type === 1) {
    return
  }

  return { returnUrl: returnUrl, id: result.rows[0].id };
}

async function changeStatus (status, id) {
  var client = new Client({
    connectionString: connectionString
  });

  client.connect();
  try {
    await client.query('UPDATE orders SET status=$1 WHERE id=$2', [status, id]);
    if (status === 2) {
      await client.query('UPDATE payments SET is_paid=true, time_paid=NOW() WHERE order_id=$1', [id]);
    }
  } catch (err) {
    console.log(err);
    return 'Order status could not be changed';
  }
}

async function history (user) {
	var client = new Client({
        connectionString: connectionString
    });

	var uid = await convert.unameToUid(user);
	
    client.connect();
    try {
        var result = await client.query('select order_products.order_id, order_products.product_id, order_products.quantity, order_products.price, products.name, orders.placed::text from order_products inner join orders on orders.id = order_products.order_id join products on order_products.product_id = products.id where user_id = $1', [uid]);
		//var result = await client.query('select * from order_products inner join orders on orders.id = order_products.order_id join products on order_products.product_id = products.id where user_id = $1', [uid]);
    } catch (err) {
        return err.message;
    }
    var numprod;
    if (result.rowCount === 0) {
        console.log("empty response")
        return 'Error in the database';
    }

	var order_price;
    var obj = {};
    obj.order = [];
    for (var i = 0; i < result.rowCount; i++) {
		order_price = 0;
        obj.order.push({});
		if (obj.order.some(e => e.id ===  result.rows[i].order_id)) {
			continue
		}
        obj.order[i].id = result.rows[i].order_id;
        obj.order[i].products = [];
		for (var j = 0; j<result.rowCount; j++){
			obj.order[i].products.push({});
			if (result.rows[j].order_id === obj.order[i].id){
				obj.order[i].products[j].name = result.rows[j].name;
				obj.order[i].products[j].price = result.rows[j].price/100;			
				obj.order[i].products[j].quantity = result.rows[j].quantity;
				order_price += (result.rows[j].price*obj.order[i].products[j].quantity)/100;
			} else { 
			}
		}
        obj.order[i].placed = result.rows[i].placed.substring(0,19);
		obj.order[i].price = order_price;
		var newArray = obj.order[i].products.filter(value => Object.keys(value).length !== 0);
		obj.order[i].products = newArray;
    }
	var newArray = obj.order.filter(value => Object.keys(value).length !== 0);
	obj.order = newArray;
	console.log(obj);
    return obj;
}

async function paid (id) {
  var client = new Client({
    connectionString: connectionString
  });

  client.connect();
  try {
    console.log('about to be paid');
    console.log(id);
    await client.query('UPDATE payments SET is_paid=true, time_paid=NOW() WHERE id=$1', [id]);
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
  getPayTypes,
  paid,
  history
};
