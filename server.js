'use strict';

//dotenv, express cors
require('dotenv').config();
const express = require('express');
const cors = require('cors');

//THIS IS MAGIC
const PORT = process.env.PORT;

//get an 'instance' of express as our app

const app = express();

//this allows us to use cors for security? it throws the following error if you forget to type this:
//Access to XMLHttpRequest at 'http://localhost:3000/location' from origin 'http://127.0.0.1:8080' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.

app.use( cors() );

//.listen expects a PORT and a callback function

app.listen(PORT, () => console.log('server running on port', PORT));

// route on the '/' in the URL bar of the browser
app.get('/', (request, response) =>{
    response.send('testing123');
});

app.get('/location', (request, response)=>{
    let data = require('./data/location.json');
    let newData = new Location(data[0]);
    console.log(newData);
    response.status(200).json(newData);
});

//constructor to normalize data pulled from API
//Location Constructor function
//take in some big obj and turn it into something that matches the contract

function Location(obj) {
    this.latitude = obj.lat;
    this.longitude = obj.lon;
    this.formatted_query = obj.display_name;
}

//write a route for restaurants

app.get('/weather', (request, response)=>{

    let json = require('./data/weather.json');
    let forecast = [];
    json.data.forEach(weatherObj => {
        console.log(weatherObj);
        let dayWeather = new Weather(weatherObj);
        forecast.push(dayWeather);
        console.log(dayWeather);
    });
    
    console.log(forecast);
response.status(200).json(forecast);
});

function Weather(obj) {
    this.forecast = obj.weather.description;
    let result = new Date(obj.valid_date);
    this.time = result.toDateString();
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