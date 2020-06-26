'use strict';

//dotenv, express cors
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');

//THIS IS MAGIC
const PORT = process.env.PORT;

//get an 'instance' of express as our app

const app = express();

//this allows us to use cors for security? it throws the following error if you forget to type this:
//Access to XMLHttpRequest at 'http://localhost:3000/location' from origin 'http://127.0.0.1:8080' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.

app.use( cors() );

//.listen expects a PORT and a callback function

app.listen(PORT, () => console.log('server running on port', PORT));

//API Keys




// route on the '/' in the URL bar of the browser
app.get('/', (request, response) =>{
    response.send('testing123');
});

app.get('/location', (request, response)=>{

const API = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEOCODE}&q=${request.query.city}&format=json`

superagent.get(API)
.then(data => {
    let location = new Location(data.body[0], request.query.city);
    response.status(200).json(location);
})
});

//constructor to normalize data pulled from API
//Location Constructor function
//take in some big obj and turn it into something that matches the contract

function Location(obj, city) {
    this.latitude = obj.lat;
    this.longitude = obj.lon;
    this.formatted_query = obj.display_name;
    this.search_query = city;
}

//write a route for restaurants

app.get('/weather', (request, response)=>{
    let lat = request.query.latitude;
    let lon = request.query.longitude;
    const API = `https://api.weatherbit.io/v2.0/forecast/daily?&lat=${lat}&lon=${lon}&key=${process.env.WEATHERBIT}`;
    superagent.get(API)
    .then(results =>{
        //weather array info is stored in array named 'data'\
        let data = results.body.data;
        response.status(200).json(getWeather(data));
    });

});

const getWeather = (arr) => {
    let forecast = arr.map(function(weatherObj){
        let dayWeather = new Weather(weatherObj);
        return dayWeather;
    });
    return forecast;
};


function Weather(obj) {
    this.forecast = obj.weather.description;
    let result = new Date(obj.valid_date);
    this.time = result.toDateString();
}

app.get('/trails', (request,response)=>{
    let lat = request.query.latitude;
    let lon = request.query.longitude;
    const API = `https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lon}&key=${process.env.HIKING}`
    console.log(API);
    superagent.get(API)
        .then(results => {
            let data = results.body.trails;
            console.log(data);
            response.status(200).json(getTrails(data));
        });
});

const getTrails = (arr) => {
    let trailList = arr.map(function(trailObj){
        let normTrail = new Trail (trailObj);
        return normTrail;
    });
    return trailList;

};


function Trail(obj) {
    this.name = obj.name;
    this.location = obj.location;
    this.length = obj.length;
    this.stars = obj.stars;
    this.star_votes = obj.starVotes;
    this.summary = obj.summary;
    this.trail_url = obj.url;
    this.conditions = obj.conditionStatus;
    this.condition_date = obj.conditionDate.slice(0, obj.conditionDate.indexOf(' '));
    this.condition_time = obj.conditionDate.slice(obj.conditionDate.indexOf(' '));
}

app.get('/restaurants', (request, response)=>{

    let data = require('./data/weather.json');
    let allRestaurants = [];

    data.nearby_restaurants.forEach(restObj => {
    let normRest = new Restaurant(restObj);
    allRestaurants.push(normRest);
    });
console.log(normRest);
response.status(200).json(allRestaurants);
});

function Restaurant(obj) {
    this.cuisines = obj.restaurant.cuisines;
    this.restaurant = obj.restaurant.name;
    this.locality = obj.restaurant.location.locality_verbose;
}

app.use('*', (request, response)=>{
    response.status(404).send('I have no idea what you want');
});

app.use((error,request, response, next)=>{
    console.log(error);
    response.status(500).send('NERO FIDDLES, THE SERVERS BURN');

});


//handle a request fror the location data
//et a city from the client
//fetch data from an API
//adapt the data using a constructor function
//send the adapted data to the client


//Location Constructor function
//take in some big obj and turn it into something that matches the contract


//handle a request for restaurant data
//get location info from the client(lat long cityname)
//fetch data from an API
//adapt the data using a constructor function
//send the adapted data to the client