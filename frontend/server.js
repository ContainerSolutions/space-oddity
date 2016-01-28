'use strict';

var basicAuth = require('basic-auth');
const express = require('express');

// Constants
const PORT = 8080;

// App
var app = express();

var auth = function (req, res, next) {
  function unauthorized(res) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    return res.send(401);
  };

  var user = basicAuth(req);

  if (!user || !user.name || !user.pass) {
    return unauthorized(res);
  };

  if (user.name === 'cs' && user.pass === 'topSecret') {
    return next();
  } else {
    return unauthorized(res);
  };
};

app.get('/', auth, function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

 app.get(/^(.+)$/, function(req, res){ 
     res.sendfile( __dirname + req.params[0]); 
 });

app.use(express.static(__dirname + '/src/lib'));
app.use(express.static(__dirname + '/css'));
app.use(express.static(__dirname + '/src'));

app.listen(PORT);
console.log('Running on http://localhost:' + PORT);