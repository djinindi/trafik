<?php
/**
 * Step 1: Require the Slim Framework
 *
 * If you are not using Composer, you need to require the
 * Slim Framework and register its PSR-0 autoloader.
 *
 * If you are using Composer, you can skip this step.
 */
require 'Slim/Slim.php';

\Slim\Slim::registerAutoloader();

/**
 * Step 2: Instantiate a Slim application
 *
 * This example instantiates a Slim application using
 * its default settings. However, you will usually configure
 * your Slim application now by passing an associative array
 * of setting names and values into the application constructor.
 */
$app = new \Slim\Slim();

/**
 * Step 3: Define the Slim application routes
 *
 * Here we define several Slim application routes that respond
 * to appropriate HTTP request methods. In this example, the second
 * argument for `Slim::get`, `Slim::post`, `Slim::put`, `Slim::patch`, and `Slim::delete`
 * is an anonymous function.
 */

// Login route
$app->get('/login/:date/:userid', function ($userdate, $userid) {
  if ($userid == 'undefined' || $userid == 'null') {
    header('HTTP/1.1 400 Userid missing');
    exit();
  }
  //Database connection
  $mysqli = getMysqli();

  //SQL Statement 
  $sql = "SELECT Users.ID AS UserID, Users.Name, Task.Date, Task.TimeFrom, Task.TimeTo, Task.LocationID, Task.ID AS TaskID, Location.LocationTypeID FROM Users, Task, Location WHERE Users.ID='$userid' AND Task.UserID='$userid' AND Task.Date='$userdate' AND Location.ID=Task.LocationID";
  
  //Query SQL in database
  $res = $mysqli->query($sql);
  if (!$res) {
    echo $mysqli->error;
  }
  if ($res) {
    if($res->num_rows == 1) {
      $user = $res->fetch_assoc();
      echo json_encode($user); //Return result as JSON-object
    } else if($res->num_rows == 0) {
      header('HTTP/1.1 404 Task not found');
      exit();
    }
    $res->close();
  }
  $mysqli->close();
});

// Get Categories with locationid route
$app->get('/categories/:id', function ($locationid) {
  if ($locationid == 'undefined' || $locationid == 'null') {
    header('HTTP/1.1 400 Bad Request');
    exit();
  }

  //Database connection
  $mysqli = getMysqli();

  //SQL Statement
  $sql = "SELECT * FROM Categories WHERE LocationTypeID='$locationid'";

  //Run SQL query in database
  $res = $mysqli->query($sql);
  if (!$res) {
    echo $mysqli->error;
  }
  if ($res) {
    if ($res->num_rows == 0) {
      header('HTTP/1.1 404 No categories found');
      exit();
    } else {
      $categories = $res->fetch_all(MYSQLI_ASSOC);
      echo json_encode($categories); //Return result as JSON-object
    }
    $res->close();
  }
  $mysqli->close();
});

// Get counts with taskid
$app->get('/get/count/:id', function ($taskid) {
  if ($taskid == 'undefined' || $taskid == 'null') {
    header('HTTP/1.1 400 Bad Request');
    exit();
  }

  $mysqli = getMysqli();

  $sql = "SELECT Count.Time, Count.Count, Count.CategoriesID, Categories.Name FROM Count, Categories WHERE TaskID='$taskid' AND Count.CategoriesID=Categories.ID ORDER BY Time";
  $res = $mysqli->query($sql);
  if (!$res) {
    echo $mysqli->error;
  }
  if ($res) {
    if ($res->num_rows == 0) {
      header('HTTP/1.1 404 Counts not found');
      exit();
    } else {
      $counts = $res->fetch_all(MYSQLI_ASSOC);
      echo json_encode($counts);
    }
    $res->close();
  }
  $mysqli->close();
});

// Post count data
$app->post('/post/count', function () use ($app){
  $params = $app->request->getBody(); //Get params as string
  $json = json_decode($params, true); //JSONify params
  //$json = array_filter($json);
  $categories = $json['categories']; //
  $hour = $json['hour'];
  $minute = $json['minut'];
  $task = $json['task'];
  //echo json_encode($json);
  //echo $params;
  //echo gettype($categories);

  $mysqli = getMysqli();

  foreach ($categories as $item) {
    $categoryid = $item['ID'];
    $count = $item['count'];
    $time = $hour . $minute;
    $note = $item['note'];
    
    $sql = "INSERT INTO Count (Count, Time, CategoriesID, TaskID, Note) VALUES ($count, $time, $categoryid, $task, $note)";
    if($res = $mysqli->query($sql)) {
      echo "Inserted!";
    } else {
      header('HTTP/1.1 404 Could not post data');
      exit();
    }
  }
});

$app->post('/post/location', function () use ($app) {
  $params = $app->request->getBody();
  $json = json_decode($params, true);
  $name = $json['name'];
  $type = $json['type'];

  $mysqli = getMysqli();

  $sql = "INSERT INTO Location (Name, LocationTypeID) VALUES ($name, $type)";
  if($res = $mysqli->query($sql)) {
    echo "Inserted!";
  } else {
    header('HTTP/1.1 404 Could not post data');
    exit();
  }
});

$app->get('/get/users', function () {
  $mysqli = getMysqli();
  $sql = "SELECT * FROM Users";
  $res = $mysqli->query($sql);
  if (!$res) {
    echo $mysqli->error;
  }
  if ($res) {
    $users = $res->fetch_all(MYSQLI_ASSOC);
    echo json_encode($users);
  }
});

$app->get('/get/locations', function () {
  $mysqli = getMysqli();
  $sql = "SELECT * FROM Location";
  $res = $mysqli->query($sql);
  if (!$res) {
    echo $mysqli->error;
  }
  if ($res) {
    $locations = $res->fetch_all(MYSQLI_ASSOC);
    echo json_encode($locations);
  }
});

$app->get('/get/locationTypes', function () {
  $mysqli = getMysqli();
  $sql = "SELECT * FROM LocationType";
  $res = $mysqli->query($sql);
  if (!$res) {
    echo $mysqli->error;
  }
  if ($res) {
    $locations = $res->fetch_all(MYSQLI_ASSOC);
    echo json_encode($locations);
  }
});

// POST route
$app->post('/post', function () {
  echo 'This is a POST route';
});

// PUT route
$app->put('/put', function () {
  echo 'This is a PUT route';
});

// PATCH route
$app->patch('/patch', function () {
  echo 'This is a PATCH route';
});

// DELETE route
$app->delete('/delete', function () {
  echo 'This is a DELETE route';
});

/**
 * Step 4: Run the Slim application
 *
 * This method should be called last. This executes the Slim application
 * and returns the HTTP response to the HTTP client.
 */
$app->run();

function getMysqli() {
  /*Live*/
  $mysqli = mysqli_connect("db_address", "db_user", "db_pass", "db_name");

  /*Development*/
  //$mysqli = mysqli_connect("localhost:8889", "root", "root", "trafik");
  if (mysqli_connect_errno($mysqli)) {
    echo "Failed to connect to MySQL: " . mysqli_connect_error();
    die();
  }
  $mysqli->set_charset("utf8");
  return $mysqli;
}
