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

//geolocation API request
var apiLatLon = function() {
    var apiUrl = "https://api.openweathermap.org/geo/1.0/direct?q=toronto&appid=6b2366660c4d73ceba774993533fef58"; //don't forget to make city dynamic for user input
    fetch(apiUrl)
        .then(function(response) {
            response.json().then(function(data) {
                console.log(data[0].lat, data[0].lon)
                getWeather(data);
                //also write a line of code to change the text of the heading to the name of the city
            })
        })
}

//test API request
var getWeather = function(data) {
    var apiUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + data[0].lat + "&lon=" + data[0].lon + "&exclude=minutely,hourly&appid=6b2366660c4d73ceba774993533fef58&units=metric";
    fetch(apiUrl).then(function(response) {
        // console.log(response.json())
        response.json().then(function(response) {
            //call two separate functions - one for current and one for future
            currentWeather(response);
            forecastWeather(response);
        })
    })
}

var currentWeather = function(response) {
    console.log(response.current.dt)
    console.log(response.current.weather[0].icon);
    console.log(response.current.temp);
    console.log(response.current.wind_speed);
    console.log(response.current.humidity);
    console.log(response.current.uvi);
}

var forecastWeather = function(response) {
    for (i = 0; i < 5; i++) {
        console.log("***");
        console.log(response.daily[i].dt);
        console.log(response.daily[i].weather[0].icon);
        console.log(response.daily[i].temp.day);
        console.log(response.daily[i].wind_speed);
        console.log(response.daily[i].humidity);
    }
}

apiLatLon();