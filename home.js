const { Client } = require('pg');
const connectionString = require('./connector.js').connectionString;

async function generateHTML() {
    var client = new Client({
        connectionString: connectionString
    });

    client.connect();
    try {
        var result = await client.query('SELECT random() as rnd, * FROM products WHERE for_sale=true and stock>0 ORDER BY rnd LIMIT 100');
    } catch (err) {
        return err.message;
    }
    var numprod;
    if (result.rowCount === 0) {
        console.log("empty response")
        return 'Error in the database';
    }
    if (result.rowCount > 100) {
        numprod = 100;
    } else {
        numprod = result.rowCount;
    }

    var obj = {};
    obj.prod = [];
    var price;
    for (var i = 0; i < numprod; i++) {
        price = result.rows[i].price / 100;
        obj.prod.push({});
        obj.prod[i].img = result.rows[i].image_loc;
        obj.prod[i].name = result.rows[i].name;
        obj.prod[i].description = result.rows[i].description;
        obj.prod[i].price = price.toFixed(2);
        obj.prod[i].id = result.rows[i].id;
    }
    return obj;
}

async function generateHTMLForSearch(searchVal) {
    var client = new Client({
        connectionString: connectionString
    });

    client.connect();
    try {
        searchVal = '%' + searchVal + '%';
        var result = await client.query('SELECT * FROM products WHERE for_sale=true and stock>0 and ( name LIKE $1 or description LIKE $1 ) LIMIT 300', [searchVal]);
    } catch (err) {
        return err.message;
    }
    var numprod;
    if (result.rowCount === 0) {
        console.log("empty response")
        return 'No products found';
    }

    numprod = result.rowCount;

    var obj = {};
    obj.prod = [];
    var price;
    for (var i = 0; i < numprod; i++) {
        price = result.rows[i].price / 100;
        obj.prod.push({});
        obj.prod[i].img = result.rows[i].image_loc;
        obj.prod[i].name = result.rows[i].name;
        obj.prod[i].description = result.rows[i].description;
        obj.prod[i].price = price.toFixed(2);
        obj.prod[i].id = result.rows[i].id;
    }
    return obj;
}

module.exports = {
    generateHTML,
    generateHTMLForSearch
};