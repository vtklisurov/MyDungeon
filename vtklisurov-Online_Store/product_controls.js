const { Client } = require('pg');
const connectionString = require('./connector.js').connectionString;

function update (toUpdate, pic) {
  var client = new Client({
    connectionString: connectionString
  });
  client.connect();
  client.query('UPDATE products SET name=$1,image_loc=$2,description=$3,stock=$4,price=$5 WHERE id=$6', [toUpdate.name, 'public/images' + pic, toUpdate.description, toUpdate.stock, toUpdate.price, toUpdate.pid], function (err, result) {
    if (err) {
      console.log(err);
      return 'Error in the database';
    }
    client.end();
  });
}

function add (toAdd, pic) {
  var client = new Client({
    connectionString: connectionString
  });
  client.connect();
  client.query('INSERT INTO products (name,image_loc,description,stock,price) VALUES ($1,$2,$3,$4,$5)', [toAdd.name, './images/' + pic, toAdd.description, toAdd.stock, toAdd.price], function (err, result) {
    if (err) {
      console.log(err);
      return 'Error in the database';
    }
    client.end();
  });
}

function remove (toRemove) {
  var client = new Client({
    connectionString: connectionString
  });
  client.connect();
  client.query('UPDATE products SET for_sale=false WHERE id=$1', [toRemove.pid], function (err, result) {
    if (err) {
      console.log(err);
      return 'Error in the database';
    }
    client.end();
  });
}

module.exports = {
  update,
  add,
  remove
};
