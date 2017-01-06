'use strict';

var cs142App = angular.module('cs142App', ['ngRoute', 'ngMaterial', 'ngResource']);

cs142App.controller('MainController', ['$scope', '$rootScope', '$location', '$http', '$routeParams', '$resource', '$mdDialog', '$mdMedia',
    function ($scope, $rootScope, $location, $http, $routeParams, $resource, $mdDialog, $mdMedia) {
        
        /*
  		 *   FetchModel - Fetch a model from the web server.
  		 *   url - string - The URL to issue the GET request.
  		 *   doneCallback - function - called with argument (model) when the
  		 *   the GET request is done. The argument model is the object
  		 *   containing the model. model is undefined in the error case.
  		 */
 		$scope.FetchModel = function(url, callback) {
			
			// Create XMLHttpRequest and assign handler
			var xhr = new XMLHttpRequest();
			xhr.onreadystatechange = xhrHandler;
			xhr.open("GET", url);
  			xhr.send();
  			
  			
			function xhrHandler(){	
				// If we have an invalid state or status, log and return. 
				if (this.readyState != 4 || this.status != 200) {
 					console.log("ERROR Status " + this.status + " state: " + this.readyState);
 					return;
 				}
 				
 				// Otherwise call callback with model
 				var model = JSON.parse(this.responseText);
 				callback(model);
			};
 		};

    // Load initial data - if mongodb doesn't match data.json, we scrap mongodb and recreate it.
    $scope.loadData = function() {
      $scope.FetchModel('/firstData/', function(dbCount){

        // If mongodb matches data.json, we are good. Return.
        if (dbCount[0] == dbCount[1]) {
          return
        } else {
          // Clear mongo database and recreate entries in the database. O(N) time
          $scope.FetchModel('/clearMongo/', function(model) {
            var data = model;
            var funcs = [];

            // For each entry in data.json, create an Entry document in our entries database
            for (var i = 0; i < data.length; i++) {
              funcs[i] = (function (i) {

                // Set proper parameters as specified in data.json
                var currentReq = $resource('/entry');
                var currWaterLevel = data[i].Water;
                var currPotable = data[i].Potable;
                if (currWaterLevel == null) {
                  currWaterLevel = "Not reported";
                }
                if (currPotable == null) {
                  currPotable = "Not reported";
                }

                var currImage = data[i].Image;
                if (currImage != "") {
                  currImage = "http://localhost:3000/img/wells/" + data[i].Image;
                } else {
                  currImage = "http://localhost:3000/img/wells/noWell.png";
                }

                // Save request.
                currentReq.save({
                  city: data[i].City, 
                  country: data[i].Country,
                  longitude: data[i].Longitude, 
                  latitude: data[i].Latitude, 
                  description: data[i].Description, 
                  imageUrl: currImage,
                  imageName: data[i].Image,
                  author: data[i].Person,
                  potable: currPotable,
                  date: data[i].Time,
                  water: currWaterLevel,
                  source: "initial"
                }, function(ret) {
                  console.log("Done");
                });
              }(i));
            }
          })
        }
      });
    }

    $scope.loadData();    // Call loadData upon loading page.

    // Form variable bindings (for when user Adds a Well)
    $scope.newCity;
    $scope.newCountry;
    $scope.newLat;
    $scope.newLong;
    $scope.newDescription = "";
    $scope.newWater = "";
    $scope.newPotable = "";
    $scope.newName = "";
    var selectedPhotoFile;   // Holds the last file selected by the user

    // Called on file selection - we simply save a reference to the file in selectedPhotoFile
    $scope.inputFileNameChanged = function (element) {
        selectedPhotoFile = element.files[0];
        console.log(selectedPhotoFile);
    };

    // Has the user selected a file?
    $scope.inputFileNameSelected = function () {
        return !!selectedPhotoFile;
    };

    /* uploadPhoto():
     * POST photo to server (img/wells folder) and then save new entry
     * This function is only called upon user clicking "Submit" when adding a well.
     */
    $scope.uploadPhoto = function() {
      if (!$scope.inputFileNameSelected()) {
          console.error("uploadPhoto called will no selected file");
          return "";
      }
      var domForm = new FormData();
      domForm.append('uploadedphoto', selectedPhotoFile);

      // Using $http to POST the picture
      $http.post('/photos/new', domForm, {
        transformRequest: angular.identity,
        headers: {'Content-Type': undefined}
      }).then(function(model){

        // Create new Entry for Mongoose (for the new added well)
        var currentReq = $resource('/entry');
        var currWaterLevel = $scope.newWater;
        var currPotable = $scope.newPotable;
        var currDescription = $scope.newDescription;
        var currAuthor = $scope.newName;
        if (currAuthor == "") {
          currAuthor = "Anonymous";
        }
        if (currDescription == "") {
          currDescription = "Not available";
        }
        if (currWaterLevel == "") {
          currWaterLevel = "Not reported";
        }
        if (currPotable == "") {
          currPotable = "Not reported";
        }

        var currDate = $scope.getDate();
        var currImage = "http://localhost:3000/img/wells/" + model.data;
        currentReq.save({
          city: $scope.newCity,
          country: $scope.newCountry,
          longitude: $scope.newLong, 
          latitude: $scope.newLat, 
          description: currDescription, 
          imageUrl: currImage,
          imageName: model.data,
          author: currAuthor,
          potable: currPotable,
          date: currDate,
          water: currWaterLevel,
          source: "form"
        }, function(ret) {
          $scope.loadData();
        });
      });
      console.log('fileSubmitted', selectedPhotoFile);  
    };

    // getDate() returns a string format of a date.
    $scope.getDate = function() {
      var today = new Date();
      var dd = today.getDate();
      var mm = today.getMonth()+1; //January is 0!
      var yyyy = today.getFullYear();

      if(dd<10) {
          dd='0'+dd
      }

      if (mm == 1) {
        mm = "January"
      } else if (mm == 2) {
        mm = "February"
      } else if (mm == 3) {
        mm = "March"
      } else if (mm == 4) {
        mm = "April"
      } else if (mm == 5) {
        mm = "May"
      } else if (mm == 6) {
        mm = "June"
      } else if (mm == 7) {
        mm = "July"
      } else if (mm == 8) {
        mm = "August"
      } else if (mm == 9) {
        mm = "September"
      } else if (mm == 10) {
        mm = "October"
      } else if (mm == 11) {
        mm = "November"
      } else {
        mm = "December"
      }

      today = dd + '-' + mm+'-'+yyyy;
      return today;
    }

    /* adjust_textarea()
     * Adjusts "description" text area if user types more than the alotted space.
     */
    $scope.adjust_textarea = function(h) {
        h.style.height = "20px";
        h.style.height = (h.scrollHeight)+"px";
    }
    
    // when the Save button is pressed, we send the selected file to the server and save it as a new entry.
    $scope.submitWell = function(arr) {
      if (!$scope.newCity || !$scope.newCountry || !$scope.newLat || !$scope.newLong) {
        return;
      }

      // If a photo is selected, we call uploadPhoto() to submit an Entry with a photo
      if ($scope.inputFileNameSelected()) {
        $scope.uploadPhoto();
        document.getElementById("addWellPopup").innerHTML = "Thank you! Your well has been added!";
        setTimeout(function () { location.reload(true); }, 1500);
        return;
      }

      // Otherwise we just create an Entry without a photo and POST it to the server's mongo database.
      var currentReq = $resource('/entry');
      var currWaterLevel = $scope.newWater;
      var currPotable = $scope.newPotable;
      var currDescription = $scope.newDescription;
      var currAuthor = $scope.newName;
      if (currAuthor == "") {
        currAuthor = "Anonymous";
      }
      if (currDescription == "") {
        currDescription = "Not available";
      }
      if (currWaterLevel == "") {
        currWaterLevel = "Not reported";
      }
      if (currPotable == "") {
        currPotable = "Not reported";
      }

      var currDate = $scope.getDate();

      currentReq.save({
        city: $scope.newCity,
        country: $scope.newCountry,
        longitude: $scope.newLong, 
        latitude: $scope.newLat, 
        description: currDescription, 
        imageUrl: "http://localhost:3000/img/wells/noWell.png",
        imageName: "",
        author: currAuthor,
        potable: currPotable,
        date: currDate,
        water: currWaterLevel,
        source: "form"
      }, function(ret) {
        $scope.loadData();
        console.log("Done");
      });
      document.getElementById("addWellPopup").innerHTML = "Thank you! Your well has been added!";
      setTimeout(function () { location.reload(true); }, 15000);
    };
        
  }]);

