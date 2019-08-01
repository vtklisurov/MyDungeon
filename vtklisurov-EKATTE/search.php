<?php
   $dbcon = pg_connect("host=localhost port=5432 dbname=velin user=velin password=9810017583");

   $data = [];
   $where = [];
   $cnt = 0;
   if ($_POST['form']=='place') {
     if ( $_POST['ekatte']!='') {
       $data[] = $_POST['ekatte'];
       $where[] = "ekatte = $".++$cnt;
     }
     if ( $_POST['name']!='') {
       $data[] = $_POST['name'];
       $where[] = "name = $".++$cnt;
     }
     if ( $_POST['municipality']!='') {
       $data[] = $_POST['municipality'];
       $where[] = "obstina = $".++$cnt;
     }
     if ( $_POST['province']!='') {
       $data[] = $_POST['province'];
       $where[] = "oblast = $".++$cnt;
     }
     if ( $_POST['kind']!='') {
       $data[] = $_POST['kind'];
       $where[] = "kind = $".++$cnt;
     }
     if ( $_POST['category']!='') {
       $data[] = $_POST['category'];
       $where[] = "category = $".++$cnt;
     }
     if ( $_POST['altitude']!='') {
       $data[] = $_POST['altitude'];
       $where[] = "altitude = $".++$cnt;
     }
     if ( $_POST['doc']!='') {
       $data[] = $_POST['doc'];
       $where[] = "doc = $".++$cnt;
     }
     $sql = "select * from ekatte";
   }
   elseif ($_POST['form']=='munic'){
     if ( $_POST['ekatte']!='') {
       $data[] = $_POST['ekatte'];
       $where[] = "ekatte = $".++$cnt;
     }
     if ( $_POST['name']!='') {
       $data[] = $_POST['name'];
       $where[] = "name = $".++$cnt;
     }
     if ( $_POST['code']!='') {
       $data[] = $_POST['code'];
       $where[] = "obstina = $".++$cnt;
     }
     if ( $_POST['province']!='') {
       $data[] = $_POST['province'];
       $where[] = "oblast = $".++$cnt;
     }
     if ( $_POST['category']!='') {
       $data[] = $_POST['category'];
       $where[] = "category = $".++$cnt;
     }
     if ( $_POST['doc']!='') {
       $data[] = $_POST['doc'];
       $where[] = "doc = $".++$cnt;
     }
     $sql = "select * from obstina";
   }
   elseif($_POST['form']=='prov'){
     if ( $_POST['ekatte']!='') {
       $data[] = $_POST['ekatte'];
       $where[] = "ekatte = $".++$cnt;
     }
     if ( $_POST['name']!='') {
       $data[] = $_POST['name'];
       $where[] = "name = $".++$cnt;
     }
     if ( $_POST['code']!='') {
       $data[] = $_POST['code'];
       $where[] = "oblast = $".++$cnt;
     }
     if ( $_POST['region']!='') {
       $data[] = $_POST['region'];
       $where[] = "region = $".++$cnt;
     }
     if ( $_POST['doc']!='') {
       $data[] = $_POST['doc'];
       $where[] = "doc = $".++$cnt;
     }
     $sql = "select * from oblast";
   }

   if ( count($where) > 0 ){
     $sql .= " where ". implode(" and ", $where) . " order by name asc;";
   }
   echo $sql;

   $result = pg_prepare($dbcon,"query",$sql);
   $result = pg_execute($dbcon,"query",$data);
   echo"<style>table, th, td {
     border: 1px solid black;
     border-collapse: collapse;
     text-align:center;
   }</style>";


   if($_POST['form']=='place'){
     echo "<table style='width:100%'>";
     echo "<tr><th>ekatte</th><th>name</th><th>municipality</th><th>province</th><th>kind</th><th>category</th><th>altitude</th><th>document</th><th>tsb</th><th>abc</th></tr>";
     while ($row = pg_fetch_row($result)) {
       echo "<tr><td>$row[0]</td><td>$row[1]</td><td>$row[2]</td><td>$row[3]</td><td>$row[4]</td><td>$row[5]</td><td>$row[6]</td><td>$row[7]</td><td>$row[8]</td><td>$row[9]</td></tr>";
     }
   }
   elseif($_POST['form']=='munic'){
     echo "<table style='width:100%'>";
     echo "<tr><th>code</th><th>ekatte</th><th>name</th><th>province</th><th>category</th><th>doc</th><th>abc</th></tr>";
     while ($row = pg_fetch_row($result)) {
       echo "<tr><td>$row[0]</td><td>$row[1]</td><td>$row[2]</td><td>$row[3]</td><td>$row[4]</td><td>$row[5]</td><td>$row[6]</td></tr>";
     }
   }
   elseif($_POST['form']=='prov'){
     echo "<table style='width:100%'>";
     echo "<tr><th>code</th><th>ekatte</th><th>name</th><th>region</th><th>doc</th><th>abc</th></tr>";
     while ($row = pg_fetch_row($result)) {
       echo "<tr><td>$row[0]</td><td>$row[1]</td><td>$row[2]</td><td>$row[3]</td><td>$row[4]</td><td>$row[5]</td><td>$row[6]</td></tr>";
     }
   }
?>
