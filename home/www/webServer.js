'use strict';

/*
 * A simple Node.js program for exporting the current working directory via a webserver listing
 * on a hard code (see portno below) port. To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:3001 will be able to fetch any file accessible
 * to the current user in the current directory or any of its children.
 */

// For parsing request body parameters
var bodyParser = require('body-parser');

// Hosting Mongoose/mongodb on our local server
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/Arghyam');

// Open mongodb connection (make sure Mongo is running!)
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
});

// Used for uploading photo functionality
var multer = require('multer');
var processFormBody = multer({storage: multer.memoryStorage()}).single('uploadedphoto');

// Schema for Well Entries (Mongoose)
var Entry = require('./schema/entry.js');

// HTTP
var http = require('http');
var portno = 3000;   // Port number to use
var fs = require('fs');

// Load data from data.json (local datastore - used for safety reasons in case MongoDB decides to crash)
var data = require('./data.json');

// Express - client for easy communication between backend and frontend
var express = require('express');
var app = express();

app.use(bodyParser.json());

// Sets working directory (directory loaded) to __dirname, which is "Arghyam/home/www"
// Not sure where I set __dirname though...
app.use(express.static(__dirname));

/* GET: /firstData/
 * Called upon loading screen to get counts of entries in MongoDB and data.json.
 * Used to check if the two match up - very basic check, not strong, but suffices.
 */
app.get('/firstData/', function(request, response) {
	Entry.count({}, function(err, count) {
		if (!err) {

			// Console messages for checking if MongoDB and Data.json match. We just use counts of entries to check.
			console.log(count);	// mongo
			console.log(data.length);	// data.json
			response.status(200).send([count, data.length]);

		} else {
			response.status(400).send("Error");
		}
	});
})

/* GET: /clearMongo/
 * Returns objects in data.json in json object format.
 * 
 * Called only if mongoDB doesnt match data.json.
 * CLEARS Mongo Database. Expects user to rewrite entire database after.
 */
app.get('/clearMongo/', function (request, response) {

	// Get all entries in mongo and erase them.
	Entry.find({}, function(err, entries) {
		var entryMap = {};
		entries.forEach(function(entry) {
			entryMap[entry._id] = entry;
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

/* GET: /newData/
 * Returns objects in data.json in json object format WITHOUT clearing MongoDB database.
 */
app.get('/newData/', function(request, response) {
	response.status(200).send(JSON.stringify(data));
})

/* GET: /data/:photo_id
 * Called upon loading screen to get counts of entries in MongoDB and data.json.
 * Used to check if the two match up - very basic check, not strong, but suffices.
 */
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
	var country = request.body.country;
	var long = request.body.longitude;
	var lat = request.body.latitude;
	var description = request.body.description;
	var image = request.body.imageUrl;
	var author = request.body.author;
	var potable = request.body.potable;
	var date = request.body.date;
	var water = request.body.water;
	
	// If we have valid paramters, create new Well Entry
	if (long != null && lat != null) {
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

		// Mongoose: Create Entry
		Entry.create({
        	author: author,
        	date: date,
        	city: city,
        	country: country,
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

            	// If we created a new well from form, add it to data.json
            	if (request.body.source == "form") {
            		// Write to file
            		var newPost = userObj.id;
            		data.push({
            			"Post": newPost,
            			"Person": author,
            			"Time": date,
            			"City": city,
            			"Country": country,
            			"Latitude": lat,
            			"Longitude": long,
            			"Description": description,
            			"Water": water,
            			"Potable": potable,
            			"Image": request.body.imageName
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

/*
 * POST /photos/new - Add new photo
 */
app.post('/photos/new', function (request, response) {
	
	processFormBody(request, response, function (err) {
        if (err || !request.file) {
            response.status(400).send("Photo Upload Error"); 
            return;
        }

        // We need to create the file in the directory "images" under an unique name. We make
        // the original file name unique by adding a unique prefix with a timestamp.
        var timestamp = new Date().valueOf();
        var filename = 'U' +  String(timestamp) + request.file.originalname;
		
        fs.writeFile("./img/wells/" + filename, request.file.buffer, function (err) {
          if (err) {
          	response.status(400).send("Photo Error");
          } else {
          	response.end(filename)
          }
        });
    });
});

// Server startup
var server = app.listen(portno, function () {
  var port = server.address().port;
  console.log('Listening at http://localhost:' + port + ' exporting the directory ' + __dirname);
  console.log(data);
});
