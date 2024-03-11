document.getElementById('route-button').addEventListener('click', function() {
    var originName = document.getElementById('origin-input').value;
    var destinationName = document.getElementById('destination-input').value;
    var origin = getPOICoordinates(originName);
    var destination = getPOICoordinates(destinationName);
    fetchValhallaRoute(origin, destination);
});