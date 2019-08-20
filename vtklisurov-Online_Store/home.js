const { Client } = require('pg');
const connectionString = 'postgresql://velin:9810017583@localhost:5432/store';

var html = '<head>\n'
+ '<style>\n'
+ '* {\n'
+ '  box-sizing: border-box;\n'
+ '}\n'
+ '\n'
+ 'body {\n'
+ '  font-family: Arial, Helvetica, sans-serif;\n'
+ '}\n'
+ '\n'
+ '.column {\n'
+ '  float: left;\n'
+ '  width: 25%;\n'
+ '  padding: 0 10px;\n'
+ '}\n'
+ '\n'
+ '.row {margin: 0 -5px;}\n'
+ '\n'
+ '.row:after {\n'
+ '  content: "";\n'
+ '  display: table;\n'
+ '  clear: both;\n'
+ '}\n'
+ '\n'
+ '.card {\n'
+ '  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);\n'
+ '  max-width: 300px;\n'
+ '  margin: auto;\n'
+ '  text-align: center;\n'
+ '  font-family: arial;\n'
+ '}\n'
+ '\n'
+ '.price {\n'
+ '  color: grey;\n'
+ '  font-size: 22px;\n'
+ '}\n'
+ '\n'
+ '.card button {\n'
+ '  border: none;\n'
+ '  outline: 0;\n'
+ '  padding: 12px;\n'
+ '  color: white;\n'
+ '  background-color: #000;\n'
+ '  text-align: center;\n'
+ '  cursor: pointer;\n'
+ '  width: 100%;\n'
+ '  font-size: 18px;\n'
+ '}\n'
+ '\n'
+ '.card button:hover {\n'
+ '  opacity: 0.7;\n'
+ '}\n'
+ '\n'
+ 'div {\n'
+ '  word-wrap: break-word;\n'
+ '}\n'
+ '@media screen and (max-width: 800px) {\n'
+ '  .column {\n'
+ '    width: 100%;\n'
+ '    display: block;\n'
+ '    margin-bottom: 20px;\n'
+ '  }\n'
+ '</style>\n'
+ '</head>\n'
+ '<body>\n'
+ '<h1 align="center">Homepage</h1>\n'
+ '<p align="center">That\'s it for now</p>\n'
+ '<div style="text-align: center;">\n'
+ '  <button align="center" onclick="location.href = \'/Online_Store/search.html\';">Search</button>\n'
+ '<div>\n'
+ '<div id="products"></div>\n'

var client = new Client({
  connectionString: connectionString
});

client.connect()
client.query('SELECT * FROM products', function (err, result){
  var numprod;
  if(result.rowCount > 100) numprod = 100;
  else numprod = result.rowCount;
  for (var i=1; i <= numprod; i++) {
     var rnd = Math.floor(Math.random() * result.rowCount)

    html += ' <div class="column">'
    + '<div class="card">'
    + '<img src="' + result.rows[rnd].image_loc + '" alt="' + result.rows[rnd].name + '" style="width:100%">'
    + '<p style="font-size: 30px"><b>' + result.rows[rnd].name + '</b><p>'
    + '<p class="price">$' + result.rows[rnd].price + '</p>'
    + ' <p>' + result.rows[rnd].description + '</p>'
    + ' <p><button>Add to Cart</button></p>'
    + ' </div>'
    + ' </div>';
  }
  client.end();
});

html += '</body>';

exports.products = function Products(){ return html;};
