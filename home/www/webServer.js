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

// getting-started.js
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/Arghyam');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
});

var multer = require('multer');
var processFormBody = multer({storage: multer.memoryStorage()}).single('uploadedphoto');

var Entry = require('./schema/entry.js');

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

app.get('/firstData/', function(request, response) {
	Entry.count({}, function(err, count) {
		if (!err) {
			console.log("DB");
			console.log(count);
			console.log(data.length);
			response.status(200).send([count, data.length]);

		} else {
			response.status(400).send("Error");
		}
	});
})

app.get('/dataCount/', function(request, response) {
	console.log("DATA");
	console.log(data.length);
	response.status(200).send(data.length);
})

app.get('/data/', function (request, response) {
	Entry.find({}, function(err, entries) {
		var entryMap = {};
		entries.forEach(function(entry) {
			entryMap[entry._id] = entry;
			// console.log(entry);
			Entry.remove({_id: entry._id}, function(err) {
				if (!err) {
					console.log("SUCCESS Removal of " + entry._id);
				} else {
					console.log("FAILURE Removal of " + entry._id);
				}
			})
			
		});
	})
	response.status(200).send(JSON.stringify(data));
});

app.get('/newData/', function(request, response) {
	response.status(200).send(JSON.stringify(data));
})

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

/*
 * POST /entry - create new Entry (INITIALIZE FROM data.json)
 */
app.post('/entry', function(request, response) {

	// Get body parameters
	var city = request.body.city;
	var long = request.body.longitude;
	var lat = request.body.latitude;
	var description = request.body.description;
	var image = request.body.imageUrl;
	var author = request.body.author;
	var potable = request.body.potable;
	var date = request.body.date;
	var water = request.body.water;
	
	// Check if login credentials already exist
	Entry.findOne({photoFile: "afadsfaasdsd"}, function (err, user) { 
		// If not, create new User
    	if (!err && long != null && lat != null) {
    		if (city == null) {
    			city = "Not available";
    		}
    		if (description == null) {
    			description = "Not available";
    		}
    		if (author == null) {
    			author = "Anonymous"
    		}
    		if (date == null) {
    			date = "Not available"
    		}
    		Entry.create({
            	author: author,
            	date: date,
            	city: city,
            	lat: lat,
            	long: long,
            	description: description,
            	water: water,
            	potable: potable,
            	photoFile: image
        	}, function (err, userObj) {
            	if (err) {
                	console.error('Error create user', err);
            	} else {
                	// Set the unique ID of the object.
                	userObj.id = userObj._id;
                	userObj.save();
                	if (response.body.source == "form") {
                		// Write to file
                		newPost = data.length + 1;
                		data.push({
                			"Post": newPost,
                			"Person": author,
                			"Time": date,
                			"City": city,
                			"Latitude": lat,
                			"Longitude": long,
                			"Description": description,
                			"Water": water,
                			"Potable": potable,
                			"Image": response.body.imageName
                		})
                		fs.writeFile('./data.json', JSON.stringify(data), 'utf8', function(err) {
                			if (err) {
                				return console.log(err);
                			} else {
                				console.log("file saved to data.json");
                			}
                		});
                	}
                	response.end("Complete Registration");
            	}
        	});
        	
        // Error Handling 
    	} else if (long == null || lat == null) {
			response.status(400).send("Must provide longitude and latitude!");    	  	
    	} else {
    		response.status(400).send("Error!");
    	}
    });
});


var server = app.listen(portno, function () {
  var port = server.address().port;
  console.log('Listening at http://localhost:' + port + ' exporting the directory ' + __dirname);
  console.log(data);
});
