"use strict";
/*
 *  Defined the Mongoose Schema and return a Model for a Well Entry
 */
/* jshint node: true */

var mongoose = require('mongoose');

// Entry Scheme used in webServer.js
var entrySchema = new mongoose.Schema({
	id: String,
	author: String,
	date: String,
	city: String,
	country: String,
	lat: Number,
	long: Number,
	description: String,
	water: String,
	potable: String,
	photoFile: String
});

// Create model for schema
var Entry = mongoose.model('Entry', entrySchema);

// make this available to our users in our Node applications
module.exports = Entry;
