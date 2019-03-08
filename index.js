let destLoc = '';
let markers = [];

const fourURL = 'https://api.foursquare.com/v2/venues/explore?';
// api.openweathermap.org/data/2.5/forecast?q={city name},{country code}
// api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}

const weatherURL = 'https://api.openweathermap.org/data/2.5/'
const directionsURL = 'https://maps.googleapis.com/maps/api/directions/json?';
var geocoder;

function initialize() {
  geocoder = new google.maps.Geocoder();
  var latlng = new google.maps.LatLng(40.648610, -101.942230);
  var mapOptions = {
    zoom: 3,
    center: latlng,
    zoomControl: true
  };
  let map = new google.maps.Map(document.getElementById('map'), mapOptions);

  // var marker = new google.maps.Marker({
  //   // The below line is equivalent to writing:
  //   // position: new google.maps.LatLng(-34.397, 150.644)
  //   position: {
  //     lat: -34.397,
  //     lng: 150.644
  //   },
  //   map: map
  // });
  // var infowindow = new google.maps.InfoWindow({
  //   content: '<p>Marker Location:' + marker.getPosition() + '</p>'
  // });

  // google.maps.event.addListener(marker, 'click', function() {
  //   infowindow.open(map, marker);
  // });
}
// google.maps.event.addDomListener(window, 'load', initialize);

function cleanMarkers() {
  markers = [];
}
//
// function centerMapToLocation(loc) {
//   var addressSearch = loc;
//
//   getLatLngFromAddressAsync(addressSearch, function(location) {
//     map.setCenter(location);
//     map.setZoom(7);
//   });
// }

function getLatLngFromAddressAsync(addressSearch, callback) {

  if (!addressSearch) {
    return;
  }
  geocoder.geocode({
    'address': addressSearch
  }, function(results, status) {
    if (status == 'OK') {
      callback(results[0].geometry.location)
    }
  });
}
/*
function createMarker(latlon, currentPetName, index){

	var marker = new google.maps.Marker({
		position: latlon,
		map: map,
		title: currentPetName,
		icon: 'images/icn_blue.png'
	});
	state.markers[index]=marker
}*/

function formatQueryParams(params) {
  const queryItems = Object.keys(params).map(key =>
    `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
  return queryItems.join('&');
}


function renderFoursquarePillCategories(elements) {
  let result = '';
  for (let i = 0; i < elements.length; i++) {
    result += `<div>${elements[i].name}</div>`
  };
  return result;
}

function renderFoursquarePill(element, index) {
  return `<div class="foursquare-page">
      <p class="pill-title"><span>${index+1}.</span> <a href="https://foursquare.com/v/${element.venue.id}" target="_blank">${element.venue.name}</a>       <button class="foursquare-pill-button">Like</button>
            <button class="foursquare-pill-button">Dislike</button></p>
      <div class="pill-categories">` +
    renderFoursquarePillCategories(element.venue.categories) +

    `</div>

      <ul>
        <li>${element.venue.location.address}
        ${element.venue.location.city}, ${element.venue.location.state}
        Lat: ${element.venue.location.lat}
        Lon: ${element.venue.location.lng}</li>
      </ul>
        </div>
    `
}
let foursquareResponse = [];

function getFoursquare(fourParams) {
  console.log('foursquare response:');
  let fourRequest = fourURL + formatQueryParams(fourParams);
  fetch(fourRequest)
    .then(response => response.json())
    .then(responseJson => {
      console.log(responseJson);
      foursquareResponse = responseJson;
      $('.foursquare').append(`<h2>Foursquare Recommended places at ${responseJson.response.geocode.displayString}</h2>`);
      for (let i = 0; i < responseJson.response.groups[0].items.length; i++) {
        $('.foursquare').append(renderFoursquarePill(responseJson.response.groups[0].items[i], i)

        )
      };
      $('.foursquare').append(
        `<pre>${JSON.stringify(responseJson, null, 4)}</pre>`
      );
    })
}

function getWeatherForecast(weatherParams) {
  console.log('weather forecast response:');
  let weatherForecastRequest = weatherURL + 'forecast?' + formatQueryParams(weatherParams);
  fetch(weatherForecastRequest)
    .then(response => response.json())
    .then(responseJson => {
      console.log(responseJson);

      $('.weather').append(
        `<p class="section-header">Weather Forecast</p>`);
      for (let i = 0; i < responseJson.list.length; i++) {
        debugger;
        $('.weather').append(renderWeatherForecast(responseJson.list[i]))
      };
      //$('.weather').append(`<pre>${JSON.stringify(responseJson, null, 4)}</pre>`)
    })
    .catch();
}

function renderWeatherForecast(element) {
  let result = '';
  result += `<div class="weather-forecast-pill weather-container">
        <p class="weather-date">${element.dt_txt}</p>
        <img class="weather-icon" src="http://openweathermap.org/img/w/${element.weather[0].icon}.png">
        <p class="weather-icon-details">${element.weather[0].main} - ${element.weather[0].description}</p>
        <p class="weather-details">Temp: ${Math.round(element.main.temp)} Humidity: ${element.main.humidity} </p>      </div>`;
  return result;
}

function getWeatherCurrent(weatherParams) {
  console.log('weather current response:');
  let weatherCurrentRequest = weatherURL + 'weather?' + formatQueryParams(weatherParams);
  fetch(weatherCurrentRequest)
    .then(response => response.json())
    .then(responseJson => {
      console.log(responseJson);
      $('.weather').append(
        `<p class="section-header">Weather Current</p>
        <div class="weather-current-container">
                <div class="weather-container"> <img class="weather-icon" src="http://openweathermap.org/img/w/${responseJson.weather[0].icon}.png"> <p class="weather-icon-details">${responseJson.weather[0].main} - ${responseJson.weather[0].description}</p>
                <p class="weather-details">Current temp: ${Math.round(responseJson.main.temp)}</>  <p class="weather-details">Current humidity: ${responseJson.main.humidity}</p>
        </div>`);
        // $('.weather').append(`
        //   Weather Current Response:
        // <pre>${JSON.stringify(responseJson, null, 4)}</pre>
        // `
      // );
    })
    .catch();
}




// let map;
//
// function initMap() {
//   map = new google.maps.Map(document.getElementById('map'), {
//     center: {
//       lat: -34.397,
//       lng: 150.644
//     },
//     zoom: 8
//   });
// }

/*
var xhr = new XMLHttpRequest();
*/

/*
let distanceMatrixURL = 'https://maps.googleapis.com/maps/api/distancematrix/json?';
function getDistanceMatrix(distanceMatrixParams) {
  console.log('getting distance matrix');
  let distanceMatrixRequest = distanceMatrixURL + formatQueryParams(distanceMatrixParams);
  fetch(distanceMatrixRequest)
  .then(response => response.json())
  .then(responseJson => {
    console.log(responseJson);
    $('.maps').append(
      `<h2>Distance Matrix</h2>
      <pre>${JSON.stringify(responseJson, null, 4)}</pre>`)
  })
}*/

function displayResults() {
  $('.results').removeClass("hidden");
}

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    $('.error-msg').append("Geolocation is not supported by this browser.");
  }
}

function showPosition(position) {
  $('.current-position').append(`Latitude: ${position.coords.latitude}
  Longitude: ${position.coords.longitude}`);
}


function watchCurrentLocation() {
  console.log('use current loc');
  $('#use-current-loc').click(e => {
    e.preventDefault();
    getLocation();
  })
}

function watchSubmit() {
  $('#button-start-search').click(e => {
    e.preventDefault();
    $('.weather').empty();
    $('.foursquare').empty();
    // $('.maps').empty();
    $('.error-msg').empty();
    console.log($('input[name="current-loc"]').val());
    console.log($('input[name="destination-loc"]').val());
    let startLoc = $('input[name="current-loc"]').val();
    destLoc = 'goleta'; //$('input[name="destination-loc"]').val();
    const fourParams = {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      near: destLoc,
      section: 'topPicks',
      //query: 'things to do',
      v: '20190228'
    };
    const weatherParams = {
      q: destLoc,
      units: 'imperial', //imperial-f, metric-c, standard-k
      APPID: weatherAPI
    };
    // const directionsParams = {
    //   origin: startLoc,
    //   destination: destLoc,
    //   key: mapsAPI
    // };
    // const distanceMatrixParams = {
    //   origins: startLoc,
    //   destinations: destLoc,
    //   key: mapsAPI,
    //   units: 'imperial'
    // };
    getWeatherCurrent(weatherParams);
    getWeatherForecast(weatherParams);
    getFoursquare(fourParams);
    // cleanMarkers();
    initialize();
    // centerMapToLocation(destLoc);
    //  getDistanceMatrix(distanceMatrixParams);
    // let fourRequest = fourURL + formatQueryParams(fourParams);
    // // let fourRequest = `https://api.foursquare.com/v2/venues/search?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&query=coffee&near=Goleta&v=20190228`
    //
    // fetch(fourRequest)
    //   .then(response => response.json())
    //   .then(responseJson => console.log(responseJson));
    //
    // let weatherRequest = weatherURL + formatQueryParams(weatherParams);
    // fetch(weatherRequest)
    //   .then(response => response.json())
    //   .then(responseJson => console.log(responseJson));
  })
}

$(function() {
  console.log('app loaded');
  watchSubmit();
  watchCurrentLocation();
});
