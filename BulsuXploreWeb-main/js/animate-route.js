function animateRoute(polyline, duration) {
    var polylinePoints = polyline.getLatLngs();
    var distance = 0;
    var previousTime = performance.now();

    // Calculate the total distance of the route
    for (var i = 1; i < polylinePoints.length; i++) {
        distance += polylinePoints[i - 1].distanceTo(polylinePoints[i]);
    }

    // Calculate the speed based on duration and distance
    var speed = distance / duration;

    // Animate the polyline
    var animation = L.polyline([], { color: 'red' }).addTo(map);

    function animate(currentTime) {
        var elapsedTime = currentTime - previousTime;
        var distanceToTravel = speed * (elapsedTime / 1000);

        // Traverse the route
        for (var i = 0; i < polylinePoints.length - 1; i++) {
            var segmentDistance = polylinePoints[i].distanceTo(polylinePoints[i + 1]);
            if (distanceToTravel <= segmentDistance) {
                var fraction = distanceToTravel / segmentDistance;
                var lat = polylinePoints[i].lat + fraction * (polylinePoints[i + 1].lat - polylinePoints[i].lat);
                var lng = polylinePoints[i].lng + fraction * (polylinePoints[i + 1].lng - polylinePoints[i].lng);
                animation.addLatLng([lat, lng]);
                return;
            } else {
                distanceToTravel -= segmentDistance;
            }
        }
        // Animation completed
        return;
    }

    function frame() {
        var currentTime = performance.now();
        var elapsedTime = currentTime - previousTime;
        previousTime = currentTime;

        animate(currentTime);

        if (animation.getLatLngs().length < polylinePoints.length) {
            requestAnimationFrame(frame);
        }
    }

    frame();
}
