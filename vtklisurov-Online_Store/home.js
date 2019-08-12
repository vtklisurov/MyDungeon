

const { Client } = require('pg');
const connectionString = 'postgresql://velin:9810017583@localhost:5432/store';

var client = new Client({
  connectionString: connectionString
});

client.connect();
const result = client.query({
  rowMode: 'array',
  text: 'select * from products;'
})

var html = '<head>'
+ '<style>'
+ '* {'
+ '  box-sizing: border-box;'
+ '}'
+ ''
+ 'body {'
+ '  font-family: Arial, Helvetica, sans-serif;'
+ '}'
+ ''
+ '.column {'
+ '  float: left;'
+ '  width: 25%;'
+ '  padding: 0 10px;'
+ '}'
+ ''
+ '.row {margin: 0 -5px;}'
+ ''
+ '.row:after {'
+ '  content: "";'
+ '  display: table;'
+ '  clear: both;'
+ '}'
+ ''
+ '.card {'
+ '  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);'
+ '  max-width: 300px;'
+ '  margin: auto;'
+ '  text-align: center;'
+ '  font-family: arial;'
+ '}'
+ ''
+ '.price {'
+ '  color: grey;'
+ '  font-size: 22px;'
+ '}'
+ ''
+ '.card button {'
+ '  border: none;'
+ '  outline: 0;'
+ '  padding: 12px;'
+ '  color: white;'
+ '  background-color: #000;'
+ '  text-align: center;'
+ '  cursor: pointer;'
+ '  width: 100%;'
+ '  font-size: 18px;'
+ '}'
+ ''
+ '.card button:hover {'
+ '  opacity: 0.7;'
+ '}'
+ ''
+ 'div {'
+ '  word-wrap: break-word;'
+ '}'
+ '@media screen and (max-width: 800px) {'
+ '  .column {'
+ '    width: 100%;'
+ '    display: block;'
+ '    margin-bottom: 20px;'
+ '  }'

+ '</style>'
+ '</head>'
+ '<body>';

var numprod;
if(result.rowCount > 100) numprod = 100;
else numprod = result.rowCount;
for (var i=1; i <= numprod; i++) {
   var rnd = Math.floor(Math.random() * result.rowCount)

  html += ' <div class="column">'
  + '<div class="card">'
  + '<img src="' + result.fields[rnd][2] + '" alt="' + result.fields[rnd][1] + '" style="width:100%">'
  + '<p style="font-size: 30px"><b>' + result.fields[rnd][2] + '</b><p>'
  + '<p class="price">$' + result.fields[rnd][5] + '</p>'
  + ' <p>' + result.fields[rnd][3] + '</p>'
  + ' <p><button>Add to Cart</button></p>'
  + ' </div>'
  + ' </div>';
}
html += '</body>';

exports.html;
