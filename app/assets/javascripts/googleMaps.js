var map;
var directionsDisplay;
var directionsService;
var directionsDisplay;
var myLat;
var myLng;
var infowindow;
var infowindowOpen = false;

var initAutoComplete = function () {
  var input = $('.search input[type="text"]')[0];
  var options = {
    componentRestrictions: {country: 'au'},
    types: ['geocode']
  };

  var autocomplete = new google.maps.places.Autocomplete(input, options);
};


function placeMarkers(data){

  var name = data.name;
  var official;

  if (data.official === true) {
    official = "Official";
  }else {
    official = "Unofficial";
  }

  var openTimes;

  if (data.open_at_all_times === true) {
    openTimes = "Open at All Times";
  }else {
    openTimes = data.open_times;
  }


  var size = data.size;

  var info = '<div class="infowindow"><p class="infowindow_title"><a href="/areas/' + data.id + '">' + name + '('+ official +')</a><p>' + '<p>Open Times: ' + openTimes + '</p>' + '<p>Size: ' + size + '</p></div>' + '<button id="directions" data-lat="'+ data.latitude +'" data-lng="' + data.longitude + '">Directions</button>';

  var latitude = parseFloat(data.latitude);
  var longitude = parseFloat(data.longitude);
  var cordinate = {lat: latitude, lng: longitude};

  var marker = new google.maps.Marker({
    position: cordinate,
    map: map,
  });

  google.maps.event.addListener(marker, 'click', function() {

    if (infowindowOpen === true) {
      infowindow.close();
    }
    infowindow = new google.maps.InfoWindow({
       content: info,
       maxWidth: 200
    });
    infowindowOpen = true;
    infowindow.open(map, marker);
  });

  google.maps.event.addListener(map, "click", function(event) {
    infowindow.close();
  });

}

function handleData(response){

  for (var i = 0; i < response.length; i++) {
    placeMarkers(response[i]);
    // console.log(response[i]);
  }
}

function fetchAreas(){
  var ajaxConfig = {
    url: "/areas",
    type: 'GET',
    format: 'JSON',
  };
  // if ( $("#search").val() !== "" ) {
  //   ajaxConfig.data = {
  //     search: $("#search").val()
  //   };
  // }
  $.ajax(ajaxConfig).done( handleData );
}

var searchTerm;
var latitude;
var longitude;

function initMap() {
  if ( $("#search").length === 0 || $("#map").length === 0 ) {
    return false;
  }

  if ($("input#search").val() !== "") {
    searchTerm = $("input#search").val();
  }else {
    searchTerm = "Sydney, NSW";
  }

  var geocoder = new google.maps.Geocoder();

  geocoder.geocode( { 'address': searchTerm }, function(results, status){

    if (status == google.maps.GeocoderStatus.OK) {
      // debugger;
      latitude = results[0].geometry.location.lat();
      longitude = results[0].geometry.location.lng();
    }
    // console.log( latitude, longitude );
    map = new google.maps.Map(document.getElementById('map'), {

      center: {
        lat: latitude,
        lng: longitude
      },
      zoom: 12,
    });
    fetchAreas();
    initAutoComplete();
  });

}


function calcRoute(lat,lng) {
  directionsService = new google.maps.DirectionsService();
  directionsDisplay = new google.maps.DirectionsRenderer();

  directionsService = new google.maps.DirectionsService();

  var destination = new google.maps.LatLng(lat, lng);
  var mapOptions = {
    zoom:7,
    center: destination
  };

  map = new google.maps.Map(document.getElementById('map'), mapOptions);
  directionsDisplay.setMap(map);

  navigator.geolocation.getCurrentPosition(function(position) {
    myLat = position.coords.latitude;
    myLng = position.coords.longitude;
    // console.log(myLat, myLng);

    var request = {
      origin: {
               "lat" : myLat,
               "lng" : myLng
            },
      destination: {
               "lat" : lat,
               "lng" : lng
            },
      travelMode: 'DRIVING'
    };

    directionsService.route(request, function(response, status) {
      // debugger;
      if (status == 'OK') {
        directionsDisplay.setDirections(response);
      }

      if ( response.routes[0] ) {

        // Link to Google Directions
        var destination = response.routes[0].legs[0].end_address;
        var url = "https://www.google.com/maps?saddr=My+Location&daddr=" + destination;

        var $a = $("<a></a>").attr({
          href: url,
          target: "_blank"
        }).text("Live directions to here");
        $(".live_directions_button").append( $a );

        for ( var i = 0; i < response.routes[0].legs[0].steps.length; i++ ) {
          var currentStep = response.routes[0].legs[0].steps[i];
          $(".live_directions").append( currentStep.instructions );
          $(".live_directions").append( "<br />" );
        }

      }
    });
  });

}
