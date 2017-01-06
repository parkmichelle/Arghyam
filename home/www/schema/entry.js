"use strict";
/*
 *  Defined the Mongoose Schema and return a Model for a Well Entry
 */
/* jshint node: true */

var mongoose = require('mongoose');

// create a schema
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

// the schema is useless so far
// we need to create a model using it
var Entry = mongoose.model('Entry', entrySchema);

// make this available to our users in our Node applications
module.exports = Entry;
