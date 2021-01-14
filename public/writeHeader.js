document.write(`
<div id = "header">
  <div id = "siteName">
    MyDungeon
  </div>
  <div id="headerBtns">
      <div id="cartdiv" class="containerDiv">
      </div>
      <div id="logindiv" class="containerDiv">
      </div>
  </div>
</div>
`);

$(document).ready(function(){
  $.post("islogged", function (status){
    if (status.user!=undefined){
      var divcontent = "<div id=\"cartdiv\" class=\"containerDiv\"><button class=\"headerBtn\" onclick=\"location.href = '/logout';\">Logout</button></div>";
      document.getElementById("headerBtns").innerHTML = document.getElementById("headerBtns").innerHTML + divcontent;


      // var divcontent = "<button class=\"headerBtn\" onclick=\"location.href = '/profile';\">Profile</button>";
      // document.getElementById("logindiv").innerHTML = divcontent;
      // divcontent = "<button class=\"headerBtn\" onclick=\"location.href = '/cart';\">Cart</button>";
      // document.getElementById("cartdiv").innerHTML = divcontent;
    }
  });

});

{/* <button onclick= "location.href = cart;">Cart</button> */}
{/* <button class=\"headerBtn\" onclick=\"location.href = '/login';\">Login</button> */}