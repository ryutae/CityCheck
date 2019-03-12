let destLoc = '';
let markers = [];

const fourURL = 'https://api.foursquare.com/v2/venues/explore?';
// api.openweathermap.org/data/2.5/forecast?q={city name},{country code}
// api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}

const weatherURL = 'https://api.openweathermap.org/data/2.5/'
const directionsURL = 'https://maps.googleapis.com/maps/api/directions/json?';

function formatQueryParams(params) {
  const queryItems = Object.keys(params).map(key =>
    `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
  return queryItems.join('&');
}

function getWeatherCurrent(weatherParams) {
  console.log('weather current response:');
  let weatherCurrentRequest = weatherURL + 'weather?' + formatQueryParams(weatherParams);
  fetch(weatherCurrentRequest)
    .then(response => response.json())
    .then(responseJson => {
      console.log(responseJson);
      $('.weather-current').append(
        `<p class="section-header">${responseJson.name} Current Weather</p>
                <div class="weather-container"> <img class="weather-icon" src="http://openweathermap.org/img/w/${responseJson.weather[0].icon}.png"> <p class="weather-icon-details">${responseJson.weather[0].main}:  ${responseJson.weather[0].description}</p>
                <p class="weather-details">${Math.round(responseJson.main.temp)}°F,     ${responseJson.main.humidity}% humidity</p>
        </div>`);
      // $('.weather').append(`
      //   Weather Current Response:
      // <pre>${JSON.stringify(responseJson, null, 4)}</pre>
      // `
      // );
    })
    .catch();
}

let forecastResponse = [];

function getWeatherForecast(weatherParams) {
  console.log('weather forecast response:');
  let weatherForecastRequest = weatherURL + 'forecast?' + formatQueryParams(weatherParams);
  fetch(weatherForecastRequest)
    .then(response => response.json())
    .then(responseJson => {
      console.log(responseJson);
      forecastResponse = responseJson;
      $('.weather-forecast').append(
        `<p class="section-header">Weather Forecast</p>`);
      for (let i = 0; i < responseJson.list.length; i += 8) {
        $('.weather-forecast').append(renderWeatherForecast(responseJson.list[i]))
      };
      //$('.weather').append(`<pre>${JSON.stringify(responseJson, null, 4)}</pre>`)
    })
    .catch();
}

const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function renderWeatherForecast(element) {
  let result = '';
  let dateForecast = new Date(element.dt * 1000);
  const dateObject = {
    month: month[dateForecast.getMonth()],
    date: dateForecast.getDate(),
    day: dayOfWeek[dateForecast.getDay()],
    time: dateForecast.getTime()
  };
  let dateForecastReadable = dateForecast.toDateString();
  //let month = dateForecast.getMonth();
  let dateTimeForecast = dateForecast.toLocaleTimeString(undefined, {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
  let dateString = `${dateObject.day},  ${dateObject.month} ${dateObject.date}`;

  result += `<div class="weather-container">
        <p class="weather-date">${dateString}</p>
        <img class="weather-icon" src="http://openweathermap.org/img/w/${element.weather[0].icon}.png">
        <p class="weather-icon-details">${element.weather[0].main} - ${element.weather[0].description}</p>
        <p class="weather-details">${Math.round(element.main.temp)}°F, ${element.main.humidity}% humidity</p>      </div>`;
  return result;
}



function renderFoursquarePillCategories(elements) {
  let result = '';
  for (let i = 0; i < elements.length; i++) {
    result += `<div>${elements[i].name}</div>`
  };
  return result;
}

function renderFoursquarePill(element, index) {
  let address = '';
  if (element.venue.location.address) {
    address = element.venue.location.address
  } else {
    address = 'Address not found'
  };
  return `<div class="foursquare-page">
      <p class="pill-title"><span>${index+1}.</span> <a href="https://foursquare.com/v/${element.venue.id}" target="_blank">${element.venue.name}</a>       <button class="foursquare-pill-button foursquare-pill-button-like">Check Out!</button>
            <button class="foursquare-pill-button foursquare-pill-button-dislike">Dislike</button></p>
      <div class="pill-categories">` +
    renderFoursquarePillCategories(element.venue.categories) +

    `</div>

      <div class="foursquare-pill-address">
      ${address} -
        <a href="https://www.google.com/maps/search/?api=1&query=${element.venue.location.lat},${element.venue.location.lng}" target="_blank">See Map</a>
      </div>
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
      $('.foursquare').append(`<p class="section-header">Foursquare Recommended places at ${responseJson.response.geocode.displayString}</p>`);
      for (let i = 0; i < responseJson.response.groups[0].items.length; i++) {
        $('.foursquare').append(renderFoursquarePill(responseJson.response.groups[0].items[i], i)

        )
      };
      //  $('.foursquare').append(
      //     `<pre>${JSON.stringify(responseJson, null, 4)}</pre>`
      //   );
    });
}

// function watchCurrentLocation() {
//   console.log('use current loc');
//   $('#use-current-loc').click(e => {
//     e.preventDefault();
//     getLocation();
//   })
// }

function watchSubmit() {
  $('.button-start-search').click(e => {
    e.preventDefault();
    $(".set-cities").detach().prependTo(".results");
    $('.start-screen').addClass('hidden');
    $('.weather-current').empty();
    $('.weather-forecast').empty();
    $('.foursquare').empty();
    // $('.maps').empty();
    $('.error-msg').empty();
    console.log($('input[name="current-loc"]').val());
    console.log($('input[name="destination-loc"]').val());
    let startLoc = $('input[name="current-loc"]').val();
    //destLoc = 'goleta'; //$('input[name="destination-loc"]').val();
    destLoc = $('input[name="destination-loc"]').val() ? $('input[name="destination-loc"]').val() : 'goleta';

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

    getWeatherCurrent(weatherParams);
    getWeatherForecast(weatherParams);
    getFoursquare(fourParams);

  })
}

function watchButtonLike() {
  $("body").on("click", ".foursquare-pill-button-like", function(e) {
    e.preventDefault;
    $(this).toggleClass("like-button-selected");
  });
  $("body").on("click", ".foursquare-pill-button-dislike", function(e) {
    e.preventDefault;
    $(this).toggleClass("dislike-button-selected");
  })
}

$(function() {
  console.log('app loaded');
  watchSubmit();
  watchButtonLike();
});
