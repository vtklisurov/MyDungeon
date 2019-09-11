const { Client } = require('pg');
const connectionString = require('./connector.js').connectionString;

async function generateHTML () {
  var html = '';
  var client = new Client({
    connectionString: connectionString
  });

  client.connect();
  try {
    var result = await client.query('SELECT * FROM products WHERE for_sale=true');
  } catch (err) {
    return err.message;
  }
  var numprod;
  if (result.rowCount === 0) {
    return 'Error in the database';
  }
  if (result.rowCount > 100) {
    numprod = 100;
  } else {
    numprod = result.rowCount;
  }

  var nums = [];
  for (var i = 1; i <= numprod; i++) {
    var rnd = Math.floor(Math.random() * result.rowCount);
    if (nums.includes(rnd)) {
      i--;
      continue;
    }
    nums.push(rnd);
    html += ' <div class="column">' +
    '<div class="card">' +
    '<img src="' + result.rows[rnd].image_loc + '" alt="' + result.rows[rnd].name + '" style="width:100%">' +
    '<p style="font-size: 30px"><b>' + result.rows[rnd].name + '</b><p>' +
    '<p class="price">$' + result.rows[rnd].price / 100 + '</p>' +
    ' <p>' + result.rows[rnd].description + '</p>' +
    ' <p><button onclick="addToCart(' + result.rows[rnd].id + ')">Add to Cart</button></p>' +
    ' </div>' +
    ' </div>';
  }
  return html;
}

module.exports = {
  generateHTML
};
