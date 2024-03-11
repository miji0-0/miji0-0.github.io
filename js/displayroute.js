// Function to display route on map
function displayRoute(data) {
    // Extract route geometry from the response
    var routeGeometry = data.trip.legs[0].shape;

    // Check if routeGeometry is an array or an object
    if (Array.isArray(routeGeometry)) {
        // Parse route geometry into an array of latitudes and longitudes
        var routeCoordinates = routeGeometry.map(function(point) {
            return [point[1], point[0]]; // GeoJSON uses [longitude, latitude]
        });
    } else if (typeof routeGeometry === 'object') {
        // Parse route geometry from object into an array of latitudes and longitudes
        var routeCoordinates = [routeGeometry.coordinates.map(function(point) {
            return [point[1], point[0]]; // GeoJSON uses [longitude, latitude]
        })];
    } else {
        console.error('Invalid route geometry:', routeGeometry);
        return;
    }

    // Create a Leaflet map centered on the first point of the route
    var map = L.map('map').setView(routeCoordinates[0][0], 13);

    // Create a polyline using the route coordinates and add it to the map
    var routePolyline = L.polyline(routeCoordinates, {color: 'blue'}).addTo(map);

    // Fit the map to the bounds of the route polyline
    map.fitBounds(routePolyline.getBounds());
}
