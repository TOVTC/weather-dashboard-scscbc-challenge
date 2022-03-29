//start basic structure using Boostrap grid
//send API requests to get location, (date?), current weather, weather for the next five days

//set up API request function
    //send an initial request and parse with JSON to determine what values are returned by general request (and how to access)
    //set up function to retrieve the hardcoded locations on the left (to practice how to retrieve, access, generate values and elements)
    //link to buttons on the left
    //set up function to dynamically retrieve weather data for user input using existing API request function (capture user input, trim text, add as API parameter)
//set up function to generate elements for current weather (for loop)
//set up function to loop through weather for next five days (add as a second parameter?)
//set up buttons for search history using data-* property
//set up ability for user input to be captured in form element and dynamically displayed
//set up geolocation API from the openweather map software
//set up function to choose from a list of icons depending on the type of weather returned
//add finishing touches with Bootstrap/custom CSS

//https://api.openweathermap.org/data/2.5/weather?q={city name}&appid=6b2366660c4d73ceba774993533fef58
//https://api.openweathermap.org/data/2.5/onecall?lat={lat}&lon={lon}&exclude={part}&appid=6b2366660c4d73ceba774993533fef58
//http://api.openweathermap.org/geo/1.0/direct?q={city name},{state code},{country code}&limit={limit}&appid=6b2366660c4d73ceba774993533fef58

var currentTitleEl = document.querySelector("#current-title");
var currentWeatherEl = document.querySelector("#current-weather");
var forecastWeatherEl = document.querySelector("#forecast-weather")

//geolocation API request
var apiLatLon = function() {
    var apiUrl = "https://api.openweathermap.org/geo/1.0/direct?q=toronto&appid=6b2366660c4d73ceba774993533fef58"; //don't forget to make city dynamic for user input
    fetch(apiUrl)
        .then(function(response) {
            response.json().then(function(data) {
                console.log(data[0].lat, data[0].lon)
                getWeather(data);
            })
        })
}

//test API request
var getWeather = function(data) {
    var apiUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + data[0].lat + "&lon=" + data[0].lon + "&exclude=minutely,hourly&appid=6b2366660c4d73ceba774993533fef58&units=metric";
    fetch(apiUrl).then(function(response) {
        // console.log(response.json())
        response.json().then(function(response) {
            var currentTitleEl = document.createElement("h2");
            currentTitleEl.className = "card-title";
            currentTitleEl.textContent = data[0].name + " " + response.current.dt + " " + response.current.weather[0].icon;
            currentWeatherEl.appendChild(currentTitleEl);
            //call two separate functions - one for current and one for future
            currentWeather(response);
            forecastWeather(response);
        })
    })
}

var currentWeather = function(response) {
    var currentConditionsEl = document.createElement("ul");
    currentConditionsEl.className = "card-text list-group list-group-flush";
    currentWeatherEl.appendChild(currentConditionsEl);
    //create any button in the quiz element
    var createCurrentLiEl = function(condition){
        var listEl = document.createElement("li")
        listEl.textContent = condition;
        listEl.className = "list-group-item";
        currentConditionsEl.appendChild(listEl);
    }
    createCurrentLiEl("Temp: " + response.current.temp + "°C");
    createCurrentLiEl("Wind: " + response.current.wind_speed + " MPS");
    createCurrentLiEl("Humidity: " + response.current.humidity + "%");
    createCurrentLiEl("UV Index: " + response.current.uvi);
}

var forecastWeather = function(response) {
    for (i = 0; i < 5; i++) {
        var cardEl = document.createElement("div");
        cardEl.className = "card";
        forecastWeatherEl.appendChild(cardEl);
        var forecastTitle = document.createElement("h4")
        forecastTitle.className = "card-title"
        forecastTitle.textContent = response.daily[i].dt;
        cardEl.appendChild(forecastTitle);
        var forecastConditions = document.createElement("ul")
        forecastConditions.className = "list-group list-group-flush card-text"
        cardEl.appendChild(forecastConditions);
        var createForecastLiEl = function(condition){
            var listEl = document.createElement("li")
            listEl.textContent = condition;
            listEl.className = "list-group-item";
            forecastConditions.appendChild(listEl);
        }
        createForecastLiEl(response.daily[i].weather[0].icon);
        createForecastLiEl("Temp: " + response.daily[i].temp.day + "°C");
        createForecastLiEl("Wind: " + response.daily[i].wind_speed + " MPS");
        createForecastLiEl("Humidity: " + response.daily[i].humidity + "%");
    }
}

apiLatLon();