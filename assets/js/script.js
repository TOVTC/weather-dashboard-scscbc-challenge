//set up buttons for search history using data-* property
//set up function to choose from a list of icons depending on the type of weather returned
//add momentJS to format dates
//add finishing touches with Bootstrap/custom CSS

//add HTML elements
var selectedCityEl = document.querySelector("#city-name");
var searchFormEl = document.querySelector("#search-form");
var submitButtonEl = document.querySelector("#submit-button");
var currentTitleEl = document.querySelector("#current-title");
var currentWeatherEl = document.querySelector("#current-weather");
var forecastWeatherEl = document.querySelector("#forecast-weather");
var searchHistoryEl = document.querySelector("#search-history");

//on click, capture text value of form element
var citySubmitHandler = function(event) {
    event.preventDefault();
    //trim input and send to geolocation API to get lat and lon values
    var cityName = selectedCityEl.value.trim();
    if (selectedCityEl.value) {
        //reset divs on screen
        selectedCityEl.value = "";
        currentWeatherEl.innerHTML = "";
        forecastWeatherEl.innerHTML = "";
        getLatLon(cityName);
    } else {
        alert("Error: You need to enter a city");
        return;
    }
}

//geolocation API request
var getLatLon = function(cityName) {
    var apiUrl = "https://api.openweathermap.org/geo/1.0/direct?q=" + cityName + "&appid=6b2366660c4d73ceba774993533fef58";
    fetch(apiUrl)
        .then(function(response) {
            if (response.ok) {
                response.json().then(function(data) {
                    if (data.length !== 0) {
                        getWeather(data);
                    } else {
                        alert("Error: Invalid city");
                    }
                })
            } else {
                alert("Error: Unable to retrieve weather data");
            }
        })
        .catch(function(error) {
            alert("Unable to connect with Weather API");
        });
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
                //search for repeats, handle history buttons, load current weather, load weather forecast
                searchRepeats(data[0].name);
                dynamicHistory(data[0].name);
                currentWeather(response);
                forecastWeather(response);
            })
        } else {
            alert("Error: Unable to retrieve weather data");
        }
    })
    .catch(function(error) {
        alert("Unable to connect with Weather API");
    });
}

//set data attribute to be the text content of the button

//search for repeats in search history
var searchRepeats = function(cityName) {
    var savedHistory = JSON.parse(localStorage.getItem("savedHistory"));
    for (var i = 0; i <= savedHistory.length; i++) {
        if (savedHistory[i] === cityName) {
            //remove repeated entry from saved history
            savedHistory.splice(i, 1);
            //remove repeated button
            var buttonEl = document.querySelector("#" + cityName.split(" ").join(""));
            buttonEl.remove();
        }
    }
    localStorage.setItem("savedHistory", JSON.stringify(savedHistory));
}

var dynamicHistory = function(cityName) {
    var savedHistory = JSON.parse(localStorage.getItem("savedHistory"));
    //function to create buttons
    var createCityButton = function(cityName) {
        var buttonEl = document.createElement("button");
        buttonEl.textContent = cityName;
        buttonEl.className = "btn btn-secondary btn-block";
        buttonEl.setAttribute("id", cityName.split(" ").join(""));
        searchHistoryEl.insertBefore(buttonEl, searchHistoryEl.firstChild);
    }
    //limit update localStorage, but limit its length to 7 values - the eighth value is current location, create button
    if (savedHistory.length === 7) {
        savedHistory.shift();
        savedHistory.push(cityName);
        localStorage.setItem("savedHistory", JSON.stringify(savedHistory));
        searchHistoryEl.removeChild(searchHistoryEl.lastChild);
        createCityButton(cityName);
    //update localStorage, create button
    } else {
        savedHistory.push(cityName);
        localStorage.setItem("savedHistory", JSON.stringify(savedHistory));
        createCityButton(cityName);
    }
}

//load search history
var loadHistory = function() {
    var savedHistory = JSON.parse(localStorage.getItem("savedHistory"));
    //update localStorage if no entry currently exists
    if (!savedHistory) {
        savedHistory = [];
        localStorage.setItem("savedHistory", JSON.stringify(savedHistory));
    }
    for (i = 0; i < savedHistory.length; i ++) {
        var buttonEl = document.createElement("button");
        buttonEl.textContent = savedHistory[i];
        buttonEl.className = "btn btn-secondary btn-block";
        buttonEl.setAttribute("id", savedHistory[i].split(" ").join(""));
        searchHistoryEl.insertBefore(buttonEl, searchHistoryEl.firstChild);
    }
}

//load current weather
var currentWeather = function(response) {
    //create ul element to hold weather conditions
    var currentConditionsEl = document.createElement("ul");
    currentConditionsEl.className = "card-text list-group list-group-flush";
    currentWeatherEl.appendChild(currentConditionsEl);
    //function to create list elements
    var createCurrentLiEl = function(condition){
        var listEl = document.createElement("li");
        listEl.textContent = condition;
        listEl.className = "list-group-item";
        currentConditionsEl.appendChild(listEl);
    }
    createCurrentLiEl("Temp: " + response.current.temp + "°C");
    createCurrentLiEl("Wind: " + response.current.wind_speed + " MPS");
    createCurrentLiEl("Humidity: " + response.current.humidity + "%");
    createCurrentLiEl("UV Index: " + response.current.uvi);
}

//load weather forecast
var forecastWeather = function(response) {
    for (i = 0; i < 5; i++) {
        //create a card div to hold forecast information for each day
        var cardEl = document.createElement("div");
        cardEl.className = "card";
        forecastWeatherEl.appendChild(cardEl);
        //add date title to each card
        var forecastTitle = document.createElement("h4");
        forecastTitle.className = "card-title";
        forecastTitle.textContent = response.daily[i].dt;
        cardEl.appendChild(forecastTitle);
        //create a ul element to hold weather conditions
        var forecastConditions = document.createElement("ul");
        forecastConditions.className = "list-group list-group-flush card-text";
        cardEl.appendChild(forecastConditions);
        //function to create list elements out of weather conditions
        var createForecastLiEl = function(condition){
            var listEl = document.createElement("li");
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

searchFormEl.addEventListener("submit", citySubmitHandler);
submitButtonEl.addEventListener("click", citySubmitHandler);

loadHistory();
getLatLon("Toronto");