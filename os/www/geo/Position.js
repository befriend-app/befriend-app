const Coordinates = require('./Coordinates');

const Position = function (coords, timestamp) {
    if (coords) {
        this.coords = new Coordinates(
            coords.latitude,
            coords.longitude,
            coords.altitude,
            coords.accuracy,
            coords.heading,
            coords.velocity,
            coords.altitudeAccuracy,
        );
    } else {
        this.coords = new Coordinates();
    }
    this.timestamp = timestamp !== undefined ? timestamp : new Date().getTime();
};

module.exports = Position;
