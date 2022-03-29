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
        //reset divs
        selectedCityEl.value = "";
        currentWeatherEl.innerHTML = "";
        forecastWeatherEl.innerHTML = "";
        getLatLon(cityName);
    } else {
        alert("Error: You need to enter a city");
        return;
    }
}

//button for saved city clicked
var clickHandler = function(event) {
    if (event.target.className === "btn btn-secondary btn-block") {
        //reset divs 
        currentWeatherEl.innerHTML = "";
        forecastWeatherEl.innerHTML = "";
        //get data attribute, set as cityName
        var cityName = event.target.getAttribute("data-city");
        getLatLon(cityName);
    } else {
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
                    //if invalid string of text entered, API status is still 200, but with empty array of data, so check length of array returned
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
                var formatDate = moment.unix(response.current.dt).format("(YYYY/MM/DD)");
                var currentTitleEl = document.createElement("h2");
                currentTitleEl.className = "card-title";
                currentTitleEl.textContent = data[0].name + " " + formatDate + " ";
                var weatherIcon = document.createElement("img");
                weatherIcon.src = "http://openweathermap.org/img/wn/" + response.current.weather[0].icon + "@2x.png";
                weatherIcon.alt = "weather icon";
                currentTitleEl.appendChild(weatherIcon);
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

//handles button creation and localStorage updates - avoids repeats and sets a max length for search history
var dynamicHistory = function(cityName) {
    var savedHistory = JSON.parse(localStorage.getItem("savedHistory"));
    //function to create buttons
    var createCityButton = function(cityName) {
        var buttonEl = document.createElement("button");
        buttonEl.textContent = cityName;
        buttonEl.className = "btn btn-secondary btn-block";
        buttonEl.setAttribute("data-city", cityName);
        buttonEl.setAttribute("id", cityName.split(" ").join(""));
        searchHistoryEl.insertBefore(buttonEl, searchHistoryEl.firstChild);
    }
    //limit update localStorage, but limit its length to 7 values - the eighth value is current location, create button
    if (savedHistory.length === 8) {
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
        buttonEl.setAttribute("data-city", savedHistory[i]);
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
    var listEl = document.createElement("li");
    listEl.textContent = "UV Index: " + response.current.uvi;
    if (response.current.uvi < 2) {
        listEl.className = "list-group-item green";
    } else if (response.current.uvi < 7) {
        listEl.className = "list-group-item yellow";
    } else if (response.current.uvi > 7) {
        listEl.className = "list-group-item red";
    }
    currentConditionsEl.appendChild(listEl);
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
        var formatDate = moment.unix(response.daily[i].dt).format("YYYY/MM/DD");
        forecastTitle.className = "card-title";
        forecastTitle.textContent = formatDate;
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
        //add weather icon
        var listEl = document.createElement("li");
        listEl.className = "list-group-item";
        var weatherIcon = document.createElement("img");
        weatherIcon.src = "http://openweathermap.org/img/wn/" + response.daily[i].weather[0].icon + ".png";
        weatherIcon.alt = "weather icon";
        listEl.appendChild(weatherIcon);
        forecastConditions.appendChild(listEl);
        //create remaining weather elements
        createForecastLiEl("Temp: " + response.daily[i].temp.day + "°C");
        createForecastLiEl("Wind: " + response.daily[i].wind_speed + " MPS");
        createForecastLiEl("Humidity: " + response.daily[i].humidity + "%");
    }
}

searchFormEl.addEventListener("submit", citySubmitHandler);
submitButtonEl.addEventListener("click", citySubmitHandler);
searchHistoryEl.addEventListener("click", clickHandler);

loadHistory();
getLatLon("Toronto");