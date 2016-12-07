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
          var contentString =
              '<div class="infoBubble">'+
                '<div class = firstBlock>' +
                  '<h1 class="firstHeading">' + wellTitle + '</h1>'+
                    '<p class="locationBlock">' + 
                      city + ', India' + '   |   ' +
                      latitude + ', ' + longitude +
                    '</p>' +
                '</div>' +
                '<div class = secondBlock>' +
                  '<p>' +
                    '<img src=' + image + ' style="width: 290px;height: 200px;margin: auto;display:block;"></br>' +
                    '<b>Description:</b> ' + description + '</br>' + 
                    '<b>Potable:</b> ' + potable + '</br>' + 
                    '<b>Water Level:</b> ' + waterLevel + '</br></br>' + 
                    '<b>Date Posted:</b> ' + date + '</br>' + 
                    '<b>Credit to:</b> ' + author + '</br></br>' +
                  '</p>'+
                '</div>'+
              '</div>';

          /*var contentString =
              '<div class="infoBubble">'+
                '<div class = firstBlock>' +
                  '<h1 class="firstHeading">' + wellTitle + '</h1>'+
                    '<p class="locationBlock">' + 
                      '<b>City:</b> ' + city + ' ' +//'</br>' + 
                      '<b>Latitude:</b> ' + latitude + ' ' +//'</br>' + 
                      '<b>Longitude:</b> ' + longitude + ' ' +//'</br></br>' + 
                    '</p>' +
                '</div>' +
                '<div class = secondBlock>' +
                  '<p>' +
                    '<img src=' + image + ' style="width: auto;height: 200px;margin: auto;display:block;"></br>' +
                    '<b>Description:</b> ' + description + '</br>' + 
                    '<b>Potable:</b> ' + potable + '</br>' + 
                    '<b>Water Level:</b> ' + waterLevel + '</br></br>' + 
                    '<b>Date Posted:</b> ' + date + '</br>' + 
                    '<b>Credit to:</b> ' + author + '</br></br>' +
                  '</p>'+
                '</div>'+
              '</div>';
              */

          // Pop up modal when you click on a marker on the map!
          var infowindow = new google.maps.InfoWindow({
            content: contentString,
            maxWidth: 350,
          });

          // close info window when another info window is open (NOT WORKING)
          infowindow.addListener('anotherClicked', function() {
            this.close();
          })

          // Customize infowindow
          google.maps.event.addListener(infowindow, 'domready', function() {
            
            // Reference to the DIV that wraps the bottom of infowindow
            var iwOuter = $('.gm-style-iw');

            /* Since this div is in a position prior to .gm-div style-iw.
             * We use jQuery and create a iwBackground variable,
             * and took advantage of the existing reference .gm-style-iw for the previous div with .prev().
            */
            var iwBackground = iwOuter.prev();

            // Removes background shadow DIV
            iwBackground.children(':nth-child(2)').css({'display' : 'none'});

            // Removes white background DIV
            iwBackground.children(':nth-child(4)').css({'display' : 'none'});

            // Moves the infowindow 115px to the left.
            iwOuter.parent().parent().css({'left': '115px'});

            // Moves the shadow of the arrow 76px to the left margin.
            iwBackground.children(':nth-child(1)').attr('style', function(i,s){ return s + 'left: 76px !important;'});

            // Moves the arrow 76px to the left margin.
            iwBackground.children(':nth-child(3)').attr('style', function(i,s){ return s + 'left: 76px !important;'});

            // Changes the desired tail shadow color.
            iwBackground.children(':nth-child(3)').find('div').children().css({'box-shadow': 'rgba(72, 181, 233, 0.6) 0px 1px 6px', 'z-index' : '1'});

            // Reference to the div that groups the close button elements.
            var iwCloseBtn = iwOuter.next();

            // Apply the desired effect to the close button
            iwCloseBtn.css({opacity: '1', right: '38px', top: '3px', border: '7px solid #48b5e9', 'border-radius': '13px', 'box-shadow': '0 0 5px #3990B9'});

            // If the content of infowindow not exceed the set maximum height, then the gradient is removed.
            if($('.iw-content').height() < 140){
              $('.iw-bottom-gradient').css({display: 'none'});
            }

            // The API automatically applies 0.7 opacity to the button after the mouseout event. This function reverses this event to the desired value.
            iwCloseBtn.mouseout(function(){
              $(this).css({opacity: '1'});
            });
          });

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
google.maps.event.addDomListener(window, 'load', initialize);