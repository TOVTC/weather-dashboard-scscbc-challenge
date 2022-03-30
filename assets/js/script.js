//add HTML elements
var selectedCityEl = document.querySelector("#city-name");
var searchFormEl = document.querySelector("#search-form");
var submitButtonEl = document.querySelector("#submit-button");
var currentTitleEl = document.querySelector("#current-title");
var currentWeatherEl = document.querySelector("#current-weather");
var forecastWeatherEl = document.querySelector("#forecast-weather");
var searchHistoryEl = document.querySelector("#search-history");

//universal button class
var buttonClass = "btn btn-secondary btn-block btn-lg my-3";

//reset divs
var resetDivs = function() {
    currentWeatherEl.innerHTML = "";
    forecastWeatherEl.innerHTML = "";
}

//on click, capture text value of form element
var citySubmitHandler = function(event) {
    event.preventDefault();
    //trim input and send to geolocation API to get lat and lon values
    var cityName = selectedCityEl.value.trim();
    if (selectedCityEl.value) {
        //reset form
        selectedCityEl.value = "";
        getLatLon(cityName);
    } else {
        alert("Error: You need to enter a city");
        return;
    }
}

//button for saved city clicked
var clickHandler = function(event) {
    if (event.target.className === buttonClass) {
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
                //reset divs
                resetDivs();
                //add header text
                var formatDate = moment.unix(response.current.dt).format("(YYYY/MM/DD)");
                var currentTitleEl = document.createElement("h2");
                currentTitleEl.className = "card-title mb-0 bold";
                currentTitleEl.innerHTML = data[0].name + " " + formatDate + " " + "<img src='http://openweathermap.org/img/wn/" + response.current.weather[0].icon + "@2x.png' alt='weather icon'/>";
                currentWeatherEl.appendChild(currentTitleEl);
                //handle repeat and new searches, display current and forecast weather
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

//upload searches to localStorage
var uploadSearch = function(savedHistory) {
    localStorage.setItem("savedHistory", JSON.stringify(savedHistory));
}

//download searches from localStorage
var downloadSearch = function() {
    var savedHistory = JSON.parse(localStorage.getItem("savedHistory"));
    return savedHistory;
}

//search for repeats in search history
var searchRepeats = function(cityName) {
    var savedHistory = downloadSearch();
    for (var i = 0; i <= savedHistory.length; i++) {
        if (savedHistory[i] === cityName) {
            //remove repeated entry from saved history
            savedHistory.splice(i, 1);
            //remove repeated button
            var buttonEl = document.querySelector("#" + cityName.split(" ").join(""));
            buttonEl.remove();
        }
    }
    uploadSearch(savedHistory);
}

//function to create buttons
var createCityButton = function(cityName) {
    var buttonEl = document.createElement("button");
    buttonEl.textContent = cityName;
    buttonEl.className = buttonClass;
    buttonEl.setAttribute("data-city", cityName);
    buttonEl.setAttribute("id", cityName.split(" ").join(""));
    searchHistoryEl.insertBefore(buttonEl, searchHistoryEl.firstChild);
}

//handles button creation and localStorage updates - avoids repeats and sets a max length for search history
var dynamicHistory = function(cityName) {
    var savedHistory = downloadSearch();
    //limit update localStorage, but limit its length to 7 values - the eighth value is current location, create button
    if (savedHistory.length === 8) {
        savedHistory.shift();
        savedHistory.push(cityName);
        uploadSearch(savedHistory);
        searchHistoryEl.removeChild(searchHistoryEl.lastChild);
        createCityButton(cityName);
    //update localStorage, create button
    } else {
        savedHistory.push(cityName);
        uploadSearch(savedHistory);
        createCityButton(cityName);
    }
}

//load search history
var loadHistory = function() {
    var savedHistory = downloadSearch();
    //update localStorage if no entry currently exists
    if (!savedHistory) {
        savedHistory = [];
        uploadSearch(savedHistory);
    }
    //create buttons from localStorage
    for (i = 0; i < savedHistory.length; i ++) {
        createCityButton(savedHistory[i]);
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
        listEl.innerHTML = condition;
        listEl.className = "list-group-item border-0 font-size";
        currentConditionsEl.appendChild(listEl);
    }
    //create list elements for current weather conditions
    createCurrentLiEl("Temp: " + response.current.temp + "°C");
    createCurrentLiEl("Wind: " + response.current.wind_speed + " MPS");
    createCurrentLiEl("Humidity: " + response.current.humidity + "%");
    //create dynamic UV element
    if (response.current.uvi <= 2) {
        createCurrentLiEl("UV Index: <span class='green'>" + response.current.uvi + "</span>");
    } else if (response.current.uvi <= 7) {
        createCurrentLiEl("UV Index: <span class='yellow'>" + response.current.uvi + "</span>");
    } else if (response.current.uvi > 8) {
        createCurrentLiEl("UV Index: <span class='red'>" + response.current.uvi + "</span>");
    }
}

//load weather forecast
var forecastWeather = function(response) {
    for (i = 0; i < 5; i++) {
        //create a card div to hold forecast information for each day
        var cardEl = document.createElement("div");
        cardEl.className = "card p-3 border-0 m-3 card-style";
        forecastWeatherEl.appendChild(cardEl);
        //add date title to each card
        var forecastTitle = document.createElement("h4");
        var formatDate = moment.unix(response.daily[i].dt).format("YYYY/MM/DD");
        forecastTitle.className = "card-title";
        forecastTitle.textContent = formatDate;
        cardEl.appendChild(forecastTitle);
        //create a ul element to hold weather conditions
        var forecastConditions = document.createElement("ul");
        forecastConditions.className = "list-group list-group-flush card-text card-style";
        cardEl.appendChild(forecastConditions);
        //function to create list elements out of weather conditions
        var createForecastLiEl = function(condition){
            var listEl = document.createElement("li");
            listEl.innerHTML = condition;
            listEl.className = "list-group-item border-0 font-size card-style";
            forecastConditions.appendChild(listEl);
        }
        //create list elements
        createForecastLiEl("<img src='http://openweathermap.org/img/wn/" + response.daily[i].weather[0].icon + ".png' alt='weather icon'/>");
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