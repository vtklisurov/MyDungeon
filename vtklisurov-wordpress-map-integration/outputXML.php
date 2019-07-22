    <?php
       $dom = new DOMDocument("1.0");
       $node = $dom->createElement("markers");
       $parnode = $dom->appendChild($node);

       $user='velin';
       $pass='9810017583';
       $host='localhost';
       $db='wp_task';

       $dbcon = new mysqli($host,$user,$pass,$db);
       $sqlget = "select id, name, latitude, longitude, country, timezone, population from map_coords where id < 1000;";
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
          $newnode->setAttribute("country", $row['country']);
          $newnode->setAttribute("timezone", $row['timezone']);
          $newnode->setAttribute("population", $row['population']);
       }
       ob_clean();
       echo $dom->saveXML();
    ?>
