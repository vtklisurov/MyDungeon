const { Client } = require('pg');
const connectionString = require("./connector.js").connectionString

var html = '<!DOCTYPE html>\n'
+ '<head>\n'
+ '<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />\n'
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
+ '  <script>\n'
+ '      document.addEventListener("DOMContentLoaded", (event) => {'
+ '    var cookies = document.cookie\n'
+ '      cookies=cookies.split(";");\n'
+ '      for (var i = 0; i < cookies.length; i++) {\n'
+ '        if (cookies[i].includes("loggedIn=")){\n'
+ '          var uname = cookies[i].split("=")[1];\n'
+ '          var divcontent = "<button onclick=\\"location.href = \'/account\';\\">Profile</button>"\n'
+ '          document.getElementById("logindiv").innerHTML = divcontent;\n'
+ '          break;\n'
+ '        }\n'
+ '        if(uname==undefined) {\n'
+ '            var divcontent = "<button onclick=\\"location.href = \'/login\';\\">Login</button>"\n'
+ '            document.getElementById("logindiv").innerHTML = divcontent;\n'
+ '          }\n'
+ '      }\n'
+ '      }\n)'
+ '  </script>\n'
+ '</head>\n'
+ '<body>\n'
+ ' <div id="logindiv"></div>\n'
+ '<h1 align="center">Homepage</h1>\n'
+ '<p align="center">That\'s it for now</p>\n'
+ '<div style="text-align: center;">\n'
+ '  <button align="center" onclick="location.href = \'/Online_Store/search\';">Search</button>\n'
+ '<div>\n'
+ '<div id="products"></div>\n'


var client = new Client({
  connectionString: connectionString
});

client.connect()
client.query('SELECT * FROM products', function (err, result){
  var numprod;

  if(result.rowCount > 100) {
    numprod = 100;
  } else {
    numprod = result.rowCount;
  }

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
