'use strict';

//dotenv, express cors
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');

const { response } = require('express');

const PORT = process.env.PORT;

//get an 'instance' of express as our app

const app = express();
const client = new pg.Client(process.env.POSTGRES);

//this allows us to use cors for security? it throws the following error if you forget to type this:
//Access to XMLHttpRequest at 'http://localhost:3000/location' from origin 'http://127.0.0.1:8080' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.

app.use( cors() );




//routes
app.get('/', homepageHandler);
app.get('/location', fetchFromDb);
app.get('/weather', weatherHandler);
app.get('/trails', trailsHandler);
app.get('/movies', moviesHandler);
app.get('/yelp', yelpHandler);
// app.get('/add', addHandler);


//create a datacache
let dataCache = {};

function homepageHandler (request, response){
    response.status(200).send('in the pipe 5 by 5');
};

function locationHandler(dbresult, request, response){

    // write a function to return all the data from the db
    // console.log('THIS IS THE CONSOLE FROM LINE42');
    // let dataCache = fetchFromDb(request, response);
    // console.log(dataCache);
    // response.status(200).json(datacache)
    // console.log('line 46 cl', dbresult.rows[0]);
    // console.log(request.query.city);
    if (dbresult.rows[0]){
        console.log('we used the db!!!');
        response.status(200).json(dbresult.rows[0])
    }
    else{
        fetchFromApi(request.query.city, response);
    }
    
};



function fetchFromDb(request, response){

    // write logic to only select objects that match search query
    const SQL = `SELECT * FROM locationdb WHERE search_query = '${request.query.city}' LIMIT 1;`

    //give our SQL query to our pg 'agent'
    return client.query(SQL)
        .then (results => locationHandler(results, request, response)
            // console.log(`THIS IS THE CONSOLE LOG ON 59`);
            // console.log(results);
            // return results;
            // console.log(results.rows[request.query.city]);
        )
        .catch(error => {
            console.log(error.message);
            response.status(500).send(error)});

};



function fetchFromApi(city, response){
    const API = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEOCODE}&q=${city}&format=json`
    
    superagent.get(API)
    .then(data => {
        let location = new Location(data.body[0], city);
        //dataCache[city] = location;
        insertDatabase(location);
        console.log('we used the API');
        currentLocation = location;
        response.status(200 ).json(location);
    })
}


function insertDatabase(obj){
    const latitude = obj.latitude;
    const longitude = obj.longitude;
    const formatted_query = obj.formatted_query;
    const search_query = obj.search_query;
    const safeQuery = [latitude, longitude, formatted_query, search_query];

    //TODO: write logic to ONLY write into db if there is an API call, to prevent duplicate

    //create SQL query
    const SQL = 'INSERT INTO locationdb (latitude, longitude, formatted_query, search_query) VALUES ($1, $2, $3, $4) RETURNING *'

    //give our SQL query to our pg 'agent'

    client.query(SQL, safeQuery)
        .then (results => {
            response.status(200).json(results);
            //console.log(results);
        })
        .catch(error => {response.status(500).send(error)});
}

function Location(obj, city) {
    this.latitude = obj.lat;
    this.longitude = obj.lon;
    this.formatted_query = obj.display_name;
    this.search_query = city;
}

function moviesHandler(request, response) {
    // console.log(`line 127 ${request.query.search_query}`);
    let locationMovieArr = [];
    const API = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIE_API_KEY}&query=${request.query.search_query}`
    superagent.get(API)
        .then(obj =>{
            obj.body.results.forEach(movie =>{
                let movieObj = new Movie(movie);
                locationMovieArr.push(movieObj);   
            })
        response.status(200).json(locationMovieArr);
        // console.log(locationMovieArr);
        })
        .catch(error => {
            console.log(`error with MoviesHandler: ${error}`)
            response.status(500).send(error)});
}

function weatherHandler(request, response){
    let lat = request.query.latitude;
    let lon = request.query.longitude;
    const API = `https://api.weatherbit.io/v2.0/forecast/daily?&lat=${lat}&lon=${lon}&key=${process.env.WEATHERBIT}`;
    superagent.get(API)
    .then(results =>{
        //weather array info is stored in array named 'data'\
        let data = results.body.data;
        response.status(200).json(getWeather(data));
    });
    
};

function Movie(obj) {
    this.title = obj.title;
    this.overview = obj.overview;
    this.average_votes = obj.vote_average;
    this.total_votes = obj.vote_count;
    this.image_url = `https://image.tmdb.org/t/p/original/${obj.poster_path}`;
    this.popularity = obj.popularity;
    this.released_on = obj.release_date;

}

function yelpHandler (request, response){
 console.log(`LINE 173 ${request.query.latitude}`)

 //latitude=${request.query.latitude}&longitude=${request.query.longitude}
    let queryObject = {
        Authorization: `Bearer ${process.env.YELP_API_KEY}`,
        format: 'json'
      }
    let page = request.query.page;
    console.log(page);
    let yelpArr = [];
    const API = `https://api.yelp.com/v3/businesses/search?latitude=${request.query.latitude}&longitude=${request.query.longitude}`
    superagent.get(API)
    .set(queryObject)
    .then(results =>{
        results.body.businesses.forEach(business => {
            let businessObj = new Yelp(business);
            yelpArr.push(businessObj);
        });
        let pageArr = yelpArr.slice((page-1),page+4);
        for (let j = 0; j < 4; j++){
            yelpArr.shift()
        };
        response.status(200).json(pageArr);          
        //oh my god this is the dumbest way possible to paginate and it doesn't even work
        //what I just coded is one of the most insanely idiotic things I have ever seen. At no point in my rambling, incoherent response, was I
        // even close to anything that could be considered a rational thought. Everyone in this room is now dumber for having experienced it. 
        //I award myself no points, and may God have mercy on my soul.
        
        // console.log(yelpArr);
        // console.log(results.body)
        // response.status(200).json(results.body);
    })
    .catch(error => {
        console.log(`error with YelpHandler: ${error}`)
        response.status(500).send(error)});

};
function yelpPagina(objArr, page){
    let yelpsPerPage = 5;
    //when page = 1, show 1-5,
    //when page =2, show 6-10


}

function Yelp(obj){
    this.name = obj.name;
    this.image_url = obj.image_url;
    this.price = obj.price;
    this.rating = obj.rating;
    this.url = obj.url;
};

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

function trailsHandler (request, response) {
    let lat = request.query.latitude;
    let lon = request.query.longitude;
    const API = `https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lon}&key=${process.env.HIKING}`
    // console.log(API);
    superagent.get(API)
    .then(results => {
        let data = results.body.trails;
        // console.log(data);
        response.status(200).json(getTrails(data));
    });
};

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
    // console.log(normRest);
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

app.get('/retrieve', (request, response) => {
    //create query
    const SQL = 'SELECT * from locationdb';

    //give our SQL query to our pg 'agent'
    client.query(SQL)
        .then (results => {
            response.status(200).json(results);
        })
        .catch(error => {response.status(500).send(error)});

})

app.use((error,request, response, next)=>{
    console.log(error);
    response.status(500).send('NERO FIDDLES, THE SERVERS BURN');
    
});

client.connect()
    .then( () => {
    app.listen(PORT, ()=> console.log('server running on port', PORT));
    })
    .catch(err => {
        throw `PG startuperror: ${err.message}`;
    });

//start our server only if 
// client.connect()
//     .then( () => {
//         app.listen(PORT, () => {

//          console.log('server running on port', PORT);
//         });
//     })
//     .catch(err => {
//         throw `PG startup error: ${err.message}`
//     });

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
