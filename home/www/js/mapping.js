function initMap() {

  // Get data function for api calls to
  var getData = function(url, callback) {
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
  }


  var data = {}
  var centralIndia = {lat: 18.597492, lng: 78.572716};
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 5,
    center: centralIndia
  });
  var styledMapType = new google.maps.StyledMapType(
      [
        {
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#ebe3cd"
            }
          ]
        },
        {
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#523735"
            }
          ]
        },
        {
          "elementType": "labels.text.stroke",
          "stylers": [
            {
              "color": "#f5f1e6"
            }
          ]
        },
        {
          "featureType": "administrative",
          "elementType": "geometry.stroke",
          "stylers": [
            {
              "color": "#c9b2a6"
            }
          ]
        },
        {
          "featureType": "administrative.land_parcel",
          "elementType": "geometry.stroke",
          "stylers": [
            {
              "color": "#dcd2be"
            }
          ]
        },
        {
          "featureType": "administrative.land_parcel",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#ae9e90"
            }
          ]
        },
        {
          "featureType": "landscape.natural",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#dfd2ae"
            }
          ]
        },
        {
          "featureType": "poi",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#dfd2ae"
            }
          ]
        },
        {
          "featureType": "poi",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#93817c"
            }
          ]
        },
        {
          "featureType": "poi.park",
          "elementType": "geometry.fill",
          "stylers": [
            {
              "color": "#a5b076"
            }
          ]
        },
        {
          "featureType": "poi.park",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#447530"
            }
          ]
        },
        {
          "featureType": "road",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#f5f1e6"
            }
          ]
        },
        {
          "featureType": "road.arterial",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#fdfcf8"
            }
          ]
        },
        {
          "featureType": "road.highway",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#f8c967"
            }
          ]
        },
        {
          "featureType": "road.highway",
          "elementType": "geometry.stroke",
          "stylers": [
            {
              "color": "#e9bc62"
            }
          ]
        },
        {
          "featureType": "road.highway.controlled_access",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#e98d58"
            }
          ]
        },
        {
          "featureType": "road.highway.controlled_access",
          "elementType": "geometry.stroke",
          "stylers": [
            {
              "color": "#db8555"
            }
          ]
        },
        {
          "featureType": "road.local",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#806b63"
            }
          ]
        },
        {
          "featureType": "transit.line",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#dfd2ae"
            }
          ]
        },
        {
          "featureType": "transit.line",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#8f7d77"
            }
          ]
        },
        {
          "featureType": "transit.line",
          "elementType": "labels.text.stroke",
          "stylers": [
            {
              "color": "#ebe3cd"
            }
          ]
        },
        {
          "featureType": "transit.station",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#dfd2ae"
            }
          ]
        },
        {
          "featureType": "water",
          "elementType": "geometry.fill",
          "stylers": [
            {
              "color": "#99bfca"
            }
          ]
        },
        {
          "featureType": "water",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#92998d"
            }
          ]
        }
      ],
    {name: 'Styled Map'});

    //Associate the styled map with the MapTypeId and set it to display.
    map.mapTypes.set('styled_map', styledMapType);
    map.setMapTypeId('styled_map');

    // Call for data and to create all markers on map
    getData('/data/', function(model){
      data = model;
      var funcs = [];
      for (var i = 0; i < data.length; i++) {
        funcs[i] = (function (i) {
          var wellTitle = "Well in " + data[i].City;
          var marker = new google.maps.Marker({
            position: {lat: data[i].Latitude, lng: data[i].Longitude},
            map: map,
            title: wellTitle,
            mapTypeControlOptions: {
              mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain',
                      'styled_map']
            }
          });

          var city = data[i].City;
          var description = data[i].Description;
          var image = data[i].Image;
          if (image != "") {
            image = "http://localhost:3000/img/wells/" + data[i].Image;
          } else {
            image = "http://localhost:3000/img/wells/noWell.png";
          }
          
          var latitude = data[i].Latitude;
          var longitude = data[i].Longitude;
          var author = data[i].Person;
          var potable = data[i].Potable;
          var date = data[i].Time;
          var waterLevel = data[i].Water;

          if (waterLevel == null) {
            waterLevel = "Not reported";
          }

          if (potable == null) {
            potable = "Not reported";
          }

          // HTML markup for infowindow format
          var contentString = '<div>'+
              '<div>'+
              '</div>'+
              '<h1 class="firstHeading">' + wellTitle + '</h1>'+
              '<div>'+
              '<p>' + 
              '<b>City:</b> ' + city + '</br>' + 
              '<b>Latitude:</b> ' + latitude + '</br>' + 
              '<b>Longitude:</b> ' + longitude + '</br></br>' + 
              '<b>Description:</b> ' + description + '</br>' + 
              '<b>Potable:</b> ' + potable + '</br>' + 
              '<b>Water Level:</b> ' + waterLevel + '</br></br>' + 
              '<b>Date Posted:</b> ' + date + '</br>' + 
              '<b>Credit to:</b> ' + author + '</br></br>' +
              '<img src=' + image + ' style="width: auto;height: 200px;margin: auto;display:block;"></br>' +
              '</p>'+
              '</div>'+
              '</div>';

          // Pop up modal when you click on a marker on the map!
          var infowindow = new google.maps.InfoWindow({
            content: contentString,
            maxWidth: 400
          });

          // close info window when another info window is open (NOT WORKING)
          infowindow.addListener('anotherClicked', function() {
            this.close();
          })

          // Center on map when info window is closed
          google.maps.event.addListener(infowindow,'closeclick',function(){
             map.setCenter(centralIndia);
             map.setZoom(5);
             // then, remove the infowindows name from the array
          });

          // Close all info windows when user clicks on map (does not apply to dragging)
          map.addListener('click', function() {
            infowindow.close();
            map.setCenter(centralIndia);
             map.setZoom(5);
          });

          marker.addListener('click', function() {
            map.setCenter(marker.getPosition());
            infowindow.open(map, marker);
          });
        }(i));
      }
    })

    // Polyfill Code - For india outline
    var world_geometry = new google.maps.FusionTablesLayer({
      query: {
        select: 'geometry',
        from: '1N2LBk4JHwWpOY4d9fobIn27lfnZ5MDy-NoqqRpk',
        where: "ISO_2DIGIT IN ('IN')"
      },
      styles: [{
        where: "ISO_2DIGIT IN ('IN')",
        markerOptions: {
          iconName: "supported_icon_name"
        },
        polygonOptions: {
          fillColor: "#ffffff",
          strokeColor: "#CD5C5C",
          strokeWeight: "1",
          fillOpacity: -1.0
        },
        polylineOptions: {
          strokeColor: "#ffffff",
          strokeWeight: "2000"  }
      }, {
        where: "ISO_2DIGIT IN ('IN')"
      }],
      map: map,
      suppressInfoWindows: true
    });

  }