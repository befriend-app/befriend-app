const Coordinates = function (lat, lng, alt, acc, head, vel, altacc) {
    /**
     * The latitude of the position.
     */
    this.latitude = lat;
    /**
     * The longitude of the position,
     */
    this.longitude = lng;
    /**
     * The accuracy of the position.
     */
    this.accuracy = acc;
    /**
     * The altitude of the position.
     */
    this.altitude = alt !== undefined ? alt : null;
    /**
     * The direction the device is moving at the position.
     */
    this.heading = (typeof head === 'number' && head >= 0 && head <= 360 ? head : null);
    /**
     * The velocity with which the device is moving at the position.
     */
    this.speed = (typeof vel === 'number' && vel >= 0 ? vel : null);

    if (this.speed === 0 || this.speed === null) {
        this.heading = NaN;
    }

    /**
     * The altitude accuracy of the position.
     */
    this.altitudeAccuracy = altacc !== undefined ? altacc : null;
};

module.exports = Coordinates;
