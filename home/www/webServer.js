'use strict';

/*
 * A simple Node.js program for exporting the current working directory via a webserver listing
 * on a hard code (see portno below) port. To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:3001 will be able to fetch any file accessible
 * to the current user in the current directory or any of its children.
 */

/* jshint node: true */
// var async = require('async');
// var session = require('express-session');
var bodyParser = require('body-parser');

// HTTP
var http = require('http');
var portno = 3000;   // Port number to use
var fs = require('fs');

var data = require('./data.json');
// app.use(session({secret: 'secretKey', resave: false, saveUninitialized: false}));


// Express
var express = require('express');
var app = express();

app.use(bodyParser.json());

// We have the express static module (http://expressjs.com/en/starter/static-files.html) do all
// the work for us.
app.use(express.static(__dirname));

app.get('/data/', function (request, response) {
	response.status(200).send(JSON.stringify(data));
});

app.get('/data/:photo_id', function(request, response) {
	var id = request.params.photo_id;
	var imageFile = __dirname + "/img/wells/" + id;
	console.log(imageFile);


	try {
    	fs.accessSync(imageFile, fs.F_OK);
    	response.status(200).send('true');
	} catch (e) {
		console.log("HI");
	    response.status(200).send('false');
	}
})


var server = app.listen(portno, function () {
  var port = server.address().port;
  console.log('Listening at http://localhost:' + port + ' exporting the directory ' + __dirname);
  console.log(data);
});
