const fourURL = 'https://api.foursquare.com/v2/venues/explore?';
const CLIENT_ID = 'KL5BWO4QF221XC3CFHVUQLRMKPOR3SE0USF5BOMVDI50F5RL';
const CLIENT_SECRET = 'JQRUBFHSM1CGAANS1WXC3XFJ4NTUFITH3AN1UEYCVDHXGQBY';
const weatherAPI = '263c0d85b560ada9a7be4fc958bb6f90';
// api.openweathermap.org/data/2.5/forecast?q={city name},{country code}
// api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}

const weatherURL = 'https://api.openweathermap.org/data/2.5/'
const directionsURL = 'https://maps.googleapis.com/maps/api/directions/json?';
const mapsAPI = 'AIzaSyDf4F76gQQxbu-fpuGgWklK72LdZoWF4Vg';

function formatQueryParams(params) {
  const queryItems = Object.keys(params).map(key =>
    `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
  return queryItems.join('&');
}


function renderFoursquarePillCategories(elements) {
  let result = '';
  for (let i=0; i<elements.length; i++) {
    result += `<div>${elements[i].name}</div>`
  };
  return result;
}

function renderFoursquarePill(element, index) {
  return   `<div class="foursquare-page">
      <p class="pill-title"><span>${index+1}.</span> ${element.venue.name} </p>
      <p class="pill-description">${element.venue.categories[0].name}</p>
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

function getFoursquare(fourParams) {
  console.log('foursquare response:');
  let fourRequest = fourURL + formatQueryParams(fourParams);
  fetch(fourRequest)
    .then(response => response.json())
    .then(responseJson => {
      console.log(responseJson);
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
        `<h2>Weather Forecast</h2>

        <pre>${JSON.stringify(responseJson, null, 4)}</pre>`
      );
    })
    .catch();
}

function getWeatherCurrent(weatherParams) {
  console.log('weather current response:');
  let weatherCurrentRequest = weatherURL + 'weather?' + formatQueryParams(weatherParams);
  fetch(weatherCurrentRequest)
    .then(response => response.json())
    .then(responseJson => {
      console.log(responseJson);
      $('.weather').append(
        `<h2>Weather Current</h2>
                <p><img src="http://openweathermap.org/img/w/${responseJson.weather[0].icon}.png"> ${responseJson.weather[0].main} - ${responseJson.weather[0].description}</p>
                <p>Current temp: ${responseJson.main.temp}  Current humidity: ${responseJson.main.humidity}
        <pre>${JSON.stringify(responseJson, null, 4)}</pre>`
      );
    })
    .catch();
}

let map;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {
      lat: -34.397,
      lng: 150.644
    },
    zoom: 8
  });
}

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
    $('.maps').empty();
    $('.error-msg').empty();
    console.log($('input[name="current-loc"]').val());
    console.log($('input[name="destination-loc"]').val());
    let startLoc = $('input[name="current-loc"]').val();
    let destLoc = 'goleta';//$('input[name="destination-loc"]').val();
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
    const directionsParams = {
      origin: startLoc,
      destination: destLoc,
      key: mapsAPI
    };
    const distanceMatrixParams = {
      origins: startLoc,
      destinations: destLoc,
      key: mapsAPI,
      units: 'imperial'
    };
    getWeatherCurrent(weatherParams);
    getWeatherForecast(weatherParams);
    getFoursquare(fourParams);
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
