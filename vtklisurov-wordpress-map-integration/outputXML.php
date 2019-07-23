    <?php
       $dom = new DOMDocument("1.0");
       $node = $dom->createElement("markers");
       $parnode = $dom->appendChild($node);

       $user='velin';
       $pass='9810017583';
       $host='localhost';
       $db='wp_task';

       $dbcon = new mysqli($host,$user,$pass,$db);
       $sqlget = "select id, name, latitude, longitude from map_coords where id>0";
       if($_POST['city_country']!='') $sqlget .= " and country ='" . $_POST['city_country'] . "'";
       if($_POST['city_name']!='') $sqlget .= " and name ='" . $_POST['city_name'] . "'";
       if($_POST['city_timezone']!='') $sqlget .= " and timezone = '" . $_POST['city_timezone'] . "'";
       $lat1 = $_POST['city_lat1'];
       $lat2 = $_POST['city_lat2'];
       $lng1 = $_POST['city_lng1'];
       $lng2 = $_POST['city_lng2'];
       if($lat1!='' && $lat2!='' && $lng1!='' && $lng2!='') $sqlget .=" and latitude >" . min($lat1,$lat2) . " and latitude <" . max($lat1,$lat2) . " and longitude >" . min($lng1,$lng2) . " and longitude <" . max($lng1,$lng2);
       $sqlget .= ";";
       $sqldata= $dbcon->query($sqlget);

       header("Content-type: text/xml");
       while ($row = $sqldata->fetch_assoc())
       {
          $node = $dom->createElement("marker");
          $newnode = $parnode->appendChild($node);
          $newnode->setAttribute("id",$row['id']);
          $newnode->setAttribute("name",$row['name']);
          $newnode->setAttribute("lat", $row['latitude']);
          $newnode->setAttribute("lng", $row['longitude']);
       }
       ob_clean();
       echo $dom->saveXML();
    ?>
