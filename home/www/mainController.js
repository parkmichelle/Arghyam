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

    $scope.data = {};

    // Load initial data - if mongodb doesn't match data.json, we scrap mongodb and recreate it.
    $scope.loadData = function() {
      $scope.FetchModel('/firstData/', function(dbCount){
        if (dbCount[0] == dbCount[1]) {
          return
        } else {
          $scope.FetchModel('/data/', function(model) {
            var data = model;
            var funcs = [];
            for (var i = 0; i < data.length; i++) {
              funcs[i] = (function (i) {
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
                currentReq.save({
                  city: data[i].City, 
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

    $scope.loadData();
        
  }]);

