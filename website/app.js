
// Event Listener on the search button
$('form').on('submit', getLocation);

function getLocation(e) {
    e.preventDefault();
    
    //1 get the word(city) user searches for
    
    let city = $('city-name').val;
    console.log('you searched for', city);
    
    // 2 $.ajax() to our server, asking for location and sending the city
    //http://http://localhost:3000/location?city=seattle
    $.ajax(`http://localhost:3000/location?city=${city}`)
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

function renderHeading();

function getRestauarants();

function renderRestaurants();