console.log('Routing.js loaded');
var route; 
// Parse the JSON data for POIs
var poiLocations = BSX_POIs_JSON.locations;

// Function to filter POIs based on user input
function filterPOIs(keyword) {
    return poiLocations.filter(function(location) {
        return location.name.toLowerCase().includes(keyword.toLowerCase());
    });
}

// Function to get coordinates of POIs by name
function getPOICoordinates(poiName) {
    // Filter the POIs to find the one with matching name
    var poi = poiLocations.find(function(location) {
        return location.name.toLowerCase() ===  poiName.toLowerCase();
    });

    // If a matching POI is found, return its coordinates
    if (poi) {
        return {
            lat: poi.lat, // Latitude
            lon: poi.lon, // Longitude
            name: poi.name // POI name (optional)
        };
    } else {
        console.error('POI not found:', poiName);
        return null;
    }
}

// Function to prepare locations array for API request
function prepareLocations(originName, destinationName) {
    var origin = getPOICoordinates(originName);
    var destination = getPOICoordinates(destinationName);

    // Check if both origin and destination were found
    if (origin && destination) {
        return [origin, destination];
    } else {
        console.error('Invalid origin or destination');
        return null;
    }
}

// Event listener for route button click
document.getElementById('getdirection-button').addEventListener('click', async function() {
    var originName = document.getElementById('origin-input').value;
    var destinationName = document.getElementById('destination-input').value;

    // Prepare locations array
    var locations = prepareLocations(originName, destinationName);

    if (locations) {
        // Construct the request data
        var requestData = {
            locations: locations,
            costing: BSX_POIs_JSON.costing,
            costing_options: BSX_POIs_JSON.costing_options
        };

        // Make the API request
        try {

          var apiUrl = 'https://interline-global-valhalla-navigation-and-routing-engine.p.rapidapi.com/route';
var apiKey = '9f75e5b0c5msh7d0948e8906bcf9p1f4b0cjsn3b4b4bbdf497';
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-RapidAPI-Key': apiKey,
                    'X-RapidAPI-Host': 'interline-global-valhalla-navigation-and-routing-engine.p.rapidapi.com'
                },
                body: JSON.stringify(requestData)
            });
            const data = await response.json();

            // Handle the API response
            console.log('Response from Valhalla API:', data);
            // Process the response further as needed
            displayRoute(data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }
});

// Rest of the code remains unchanged

// Function to decode polyline
function decodePolyline(str, precision) {
    var index = 0,
        lat = 0,
        lng = 0,
        coordinates = [],
        shift = 0,
        result = 0,
        byte = null,
        latitude_change,
        longitude_change,
        factor = Math.pow(10, precision || 6);

    // Coordinates have variable length when encoded, so just keep
    // track of whether we've hit the end of the string. In each
    // loop iteration, a single coordinate is decoded.
    while (index < str.length) {
        // Reset shift, result, and byte
        byte = null;
        shift = 0;
        result = 0;

        do {
            byte = str.charCodeAt(index++) - 63;
            result |= (byte & 0x1f) << shift;
            shift += 5;
        } while (byte >= 0x20);

        latitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

        shift = result = 0;

        do {
            byte = str.charCodeAt(index++) - 63;
            result |= (byte & 0x1f) << shift;
            shift += 5;
        } while (byte >= 0x20);

        longitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

        lat += latitude_change;
        lng += longitude_change;

        coordinates.push([lat / factor, lng / factor]);
    }

    return coordinates;
}
    // function decodePolyline(polyline) {
    //     if (polyline && polyline.length > 0 && Array.isArray(polyline[0])) {
    //         return polyline.map(function(point) {
    //             return [point[0] / 10, point[1] / 10]; // Divide by 10 to adjust decimal placement
    //         });
    //     } else {
    //         console.error('Invalid polyline data. Expected an array of coordinates.');
    //         return [];
    //     }
    // }


    function displayRoute(data) {
        // Remove existing polyline if it exists
        if (map.hasLayer(route)) {
            map.removeLayer(route);
        }

        var routeGeometry = data.trip.legs[0].shape;
        console.log(routeGeometry); // Log the route geometry data
        var decodedPolyline = decodePolyline(routeGeometry);
        console.log(decodedPolyline); 
        route = L.polyline(decodedPolyline, { color: 'blue', zIndex: 1000 }).addTo(map); // Adjust zIndex as needed
        map.fitBounds(route.getBounds());
        animateRoute(route, 30000);
    }
    

// function displayRoute(data) {
// var routeGeometry = data.trip.legs[0].shape;
// var decodedPolyline = decodePolyline(routeGeometry);
// var route = L.polyline(decodedPolyline, { color: 'blue' }).addTo(map);

// }





// // Function to display the route on the map
// function displayRoute(data) {
//     // Extract route geometry
//     var routeGeometry = data.trip.legs[0].shape;
//     var decodedPolyline = decodePolyline(routeGeometry);


//     console.log(decodedPolyline);


//     // Add route to the map
//     var route = L.polyline(decodedPolyline, { color: 'red' }).addTo(map);
//     route.addTo(map);
    
//     // Fit map to route bounds

// }

// Event listener for input field to display suggestions
document.getElementById('origin-input').addEventListener('input', function() {
    var inputText = this.value.toLowerCase();
    var suggestionsList = document.getElementById('origin-suggestions');
    suggestionsList.innerHTML = ''; // Clear previous suggestions

    var filteredPOIs = filterPOIs(inputText);

    // Display filtered POIs as suggestions
    filteredPOIs.forEach(function(location) {
        var listItem = document.createElement('li');
        listItem.textContent = location.name;
        listItem.addEventListener('click', function() {
            document.getElementById('origin-input').value = location.name;
            suggestionsList.innerHTML = ''; // Clear suggestions after selection
        });
        suggestionsList.appendChild(listItem);
    });
});

// Event listener for input field to display suggestions for destination
document.getElementById('destination-input').addEventListener('input', function() {
    var inputText = this.value.toLowerCase();
    var suggestionsList = document.getElementById('destination-suggestions');
    suggestionsList.innerHTML = ''; // Clear previous suggestions

    var filteredPOIs = filterPOIs(inputText);

    // Display filtered POIs as suggestions
    filteredPOIs.forEach(function(location) {
        var listItem = document.createElement('li');
        listItem.textContent = location.name;
        listItem.addEventListener('click', function() {
            document.getElementById('destination-input').value = location.name;
            suggestionsList.innerHTML = ''; // Clear suggestions after selection
        });
        suggestionsList.appendChild(listItem);
    });
});
