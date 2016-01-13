'use strict';

const express = require('express');

// Constants
const PORT = 8080;

// App
var app = express();

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/droneCharts.html');
});

 app.get(/^(.+)$/, function(req, res){ 
     res.sendfile( __dirname + req.params[0]); 
 });

app.use(express.static(__dirname + '/src/lib'));
app.use(express.static(__dirname + '/css'));
app.use(express.static(__dirname + '/src'));

app.listen(PORT);
console.log('Running on http://localhost:' + PORT);