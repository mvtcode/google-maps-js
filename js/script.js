'use strict';

// code by Tanmv
// date: 2021-08-18

const iconBase = "https://developers.google.com/maps/documentation/javascript/examples/full/images/";

function initApp() {
  const map = initMap();
  const directionsService = new google.maps.DirectionsService();
  const directionsDisplay = new google.maps.DirectionsRenderer();
  const distanceMatrixService = new google.maps.DistanceMatrixService();
  const from = initSearchPlace(map, 'search_input_from', 'Origin location');
  const to = initSearchPlace(map, 'search_input_to', 'Distination location');
  const divDirection = $('#div-direction');
  const divDirectionError = $('#div-direction-error');
  const distance = $('#distance');
  const duration = $('#duration');
  const ddlTravelMode = $('#ddl-travel-mode');

  directionsDisplay.setMap(map);

  // google.maps.event.addListener(map, "click", (event) => {
  // map.addListener("click", (event) => {
  //   addMarker(map, event.latLng, 'New position');
  //   console.log(event.latLng.lat(), event.latLng.lng());
  // });

  // map.addListener('zoom_changed', () => {
  //   console.log('Zoom changed:', map.getZoom());
  // });

  // map.addListener('center_changed', () => {
  //   console.log('Center changed:', map.getCenter());
  // });

  var GeoMarker = new GeolocationMarker();
  GeoMarker.setCircleOptions({fillColor: '#808080'});
  google.maps.event.addListenerOnce(GeoMarker, 'position_changed', function() {
    map.setCenter(this.getPosition());
    map.fitBounds(this.getBounds());
  });
  google.maps.event.addListener(GeoMarker, 'geolocation_error', function(e) {
    alert('There was an error obtaining your position. Message: ' + e.message);
  });
  GeoMarker.setMap(map);

  // if('geolocation' in navigator) {
  //   navigator.permissions.query({name:'geolocation'}).then(function(result) {
  //     if (result.state === 'granted') {
  //       navigator.geolocation.getCurrentPosition((position) => {
  //         // map.setCenter({lat: position.coords.latitude, lng: position.coords.longitude, zoom: 14});
  //         map.setCenter(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
  //         map.setZoom(14);
  //       });
  //     } else {
  //       console.log('Permisstion geolocation is:', result.state);
  //     }
  //   });
  // } else {
  //   console.error('geolocation IS NOT available');
  // }

  $('form').submit(function(e) {
    e.preventDefault();
    // const origin1 = { lat: 55.93, lng: -3.118 };
    // const origin2 = "Greenwich, England";
    // const destinationA = "Stockholm, Sweden";
    // const destinationB = { lat: 50.087, lng: 14.421 };

    distanceMatrixService.getDistanceMatrix({
      // origins: [origin1, origin2],
      // destinations: [destinationA, destinationB],
      origins: [ from.getPlace().formatted_address, from.getPlace().geometry.location ],
      destinations: [ to.getPlace().formatted_address, to.getPlace().geometry.location ],

      travelMode: ddlTravelMode.val(),
      unitSystem: google.maps.UnitSystem.METRIC,
      avoidHighways: false,
      avoidTolls: false,
    }, (response, status) => {
      if(status === google.maps.DistanceMatrixStatus.OK) {
        // const origin = res.originAddresses[0];
        // const destination = res.destinationAddresses[0];
        if (response.rows[0].elements[0].status === "ZERO_RESULTS") {
          console.log('Better get on a plane. There are no roads');
        } else {
          // console.log(response.rows[0].elements[0].distance.value / 1000, 'km');
          // console.log(response.rows[0].elements[0].duration.text);
          distance.text(`${response.rows[0].elements[0].distance.value / 1000} km`);
          duration.text(response.rows[0].elements[0].duration.text);
        }
      }
    });

    directionsService.route({
      origin: from.getPlace().geometry.location,
      destination: to.getPlace().geometry.location,
      travelMode: ddlTravelMode.val(), // DRIVING | WALKING | BICYCLING | TRANSIT | TWO_WHEELER
      unitSystem: google.maps.UnitSystem.IMPERIAL, // METRIC = 0 | IMPERIAL = 1
    }, (result, status) => {
      if (status === google.maps.DirectionsStatus.OK) { // INVALID_REQUEST | MAX_WAYPOINTS_EXCEEDED | NOT_FOUND | OK | OVER_QUERY_LIMIT | REQUEST_DENIED | UNKNOWN_ERROR | ZERO_RESULTS
        // distance.text(result.routes[0].legs[0].distance.text);
        // duration.text(result.routes[0].legs[0].duration.text);
        directionsDisplay.setDirections(result);
        divDirection.show();
        divDirectionError.hide();
      } else {
        console.error('Not direction');
        directionsDisplay.setDirections({routes: []});
        divDirection.hide();
        divDirectionError.text(`Could not retrieve driving distance, status: ${status}`).show();
      }
      
    });

    return false;
  });
}

function initMap() {
  return new google.maps.Map(document.getElementById("map"), {
    center: {
      lat: 21.028511,
      lng: 105.804817
    },
    zoom: 10,
    mapTypeId: google.maps.MapTypeId.TERRAIN,
    mapTypeControl: false,
    panControl: false,
    // zoomControl: false,
    streetViewControl: false,
  });
}

function addMarker(map, location, title) {
  const marker = new google.maps.Marker({
    position: location,
    title: title,
    // label: title,
    map: map, // or using marker.setMap(map);
    icon: iconBase + 'beachflag.png',
    animation: google.maps.Animation.DROP,
    draggable: true,
  });

  const infoWindow = new google.maps.InfoWindow({
    content: title
  });

  marker.addListener('click', () => {
    infoWindow.open({
      anchor: marker,
      map,
      shouldFocus: false,
    });

    setTimeout(() => {
      marker.setMap(null);
    }, 5000);
  });

  return marker;
}

function initSearchPlace(map, inputId, title) {
  const autocomplete = new google.maps.places.Autocomplete((document.getElementById(inputId)), {
    types: ['geocode'],
    /*componentRestrictions: {
     country: "USA"
    }*/
   });

  google.maps.event.addListener(autocomplete, 'place_changed', () => {
    var near_place = autocomplete.getPlace();
    map.setCenter(near_place.geometry.location);
    addMarker(map, near_place.geometry.location, title);
  });

  return autocomplete;
}