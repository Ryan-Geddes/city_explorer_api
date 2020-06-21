'use strict';

// Event Listener on the search button
$('form').on('submit', getLocation);

function getLocation(e) {
    e.preventDefault();
    //1 get the word(city) user searches for
    
    let city = $('#city-name').val();
    console.log('you searched for', city);
    
    // 2 $.ajax() to our server, asking for location and sending the city
    //`http://localhost:3000/location?city=${city}`
    $.ajax('http://localhost:3000/location')
        .then (locationData => {
            console.log('ajax pulled from server', locationData);
        
        // 3. render the map using renderMap(lat, long) (or just obj)
        
        renderMap(locationData);
        renderHeading(locationData);
        
        // 4. Get Restuarant Data
        getRestauarants(locationData);
        
    });
};

function renderMap(location){
    let template = $('#map-template').html();
    let mapHTML = Mustache.render(template,location);
    $('#map').html(mapHTML);
}

function renderHeading(location){
    let template = $('#heading-template').html();
    let headingHTML = Mustache.render(template, location);
    $('#heading').html(headingHTML);
}

function getRestauarants(location){
//$.ajax call
    $.ajax('http://localhost:3000/restaurants')
        .then(restaurants =>{
        console.log(restaurants);
        renderRestaurants(restaurants);
        }
)};

function renderRestaurants(restaurants){
    // take the list and render them with Mustache
    let $template = $('#restaurants-template').html();
    let $target = $('#restaurants');
    $target.empty();
    restaurants.forEach((r) =>{
        let rHTML = Mustache.render($template, r);
        $target.append(rHTML);
    });

}