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

var selectedCityEl = document.querySelector("#city-name")
var submitButtonEl = document.querySelector("#submit-button")
var currentTitleEl = document.querySelector("#current-title");
var currentWeatherEl = document.querySelector("#current-weather");
var forecastWeatherEl = document.querySelector("#forecast-weather")

var citySubmitHandler = function(event) {
    event.preventDefault();
    currentWeatherEl.innerHTML = "";
    forecastWeatherEl.innerHTML = "";
    var cityName = selectedCityEl.value.trim();
    if (selectedCityEl.value) {
        getLatLon(cityName);
    } else {
        alert("Error: You need to enter a city")
    }
}

//geolocation API request
var getLatLon = function(cityName) {
    var apiUrl = "https://api.openweathermap.org/geo/1.0/direct?q=" + cityName + "&appid=6b2366660c4d73ceba774993533fef58"; //don't forget to make city dynamic for user input
    fetch(apiUrl)
        .then(function(response) {
            if (response.ok) {
                response.json().then(function(data) {
                    if (data.length !== 0) {
                        getWeather(data);
                    } else {
                        alert("Error: Invalid city")
                    }
                })
            } else {
                alert("Error: Unable to retrieve weather data")
            }
        })
        .catch(function(error) {
            alert("Unable to connect with Weather API")
        })
}

//test API request
var getWeather = function(data) {
    var apiUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + data[0].lat + "&lon=" + data[0].lon + "&exclude=minutely,hourly&appid=6b2366660c4d73ceba774993533fef58&units=metric";
    fetch(apiUrl).then(function(response) {
        if (response.ok) {
            response.json().then(function(response) {
                //add header text
                var currentTitleEl = document.createElement("h2");
                currentTitleEl.className = "card-title";
                currentTitleEl.textContent = data[0].name + " " + response.current.dt + " " + response.current.weather[0].icon;
                currentWeatherEl.appendChild(currentTitleEl);
                //call two separate functions - one for current and one for future
                currentWeather(response);
                forecastWeather(response);
            })
        } else {
            alert("Error: Unable to retrieve weather data")
        }
    })
    .catch(function(error) {
        alert("Unable to connect with Weather API")
    })
}

var currentWeather = function(response) {
    //create ul element to hold weather conditions
    var currentConditionsEl = document.createElement("ul");
    currentConditionsEl.className = "card-text list-group list-group-flush";
    currentWeatherEl.appendChild(currentConditionsEl);
    //function to create list elements
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
        //create a card div to hold forecast information for each day
        var cardEl = document.createElement("div");
        cardEl.className = "card";
        forecastWeatherEl.appendChild(cardEl);
        //add date title to each card
        var forecastTitle = document.createElement("h4")
        forecastTitle.className = "card-title"
        forecastTitle.textContent = response.daily[i].dt;
        cardEl.appendChild(forecastTitle);
        //create a ul element to hold weather conditions
        var forecastConditions = document.createElement("ul")
        forecastConditions.className = "list-group list-group-flush card-text"
        cardEl.appendChild(forecastConditions);
        //function to create list elements out of weather conditions
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

submitButtonEl.addEventListener("click", citySubmitHandler);

getLatLon("Toronto");