const argscheck = require('cordova/argscheck');
const utils = require('cordova/utils');
const exec = require('cordova/exec');
const PositionError = require('./PositionError');
const Position = require('./Position');

const timers = {}; // list of timers in use

// Returns default params, overrides if provided with values
function parseParameters(options) {
    const opt = {
        maximumAge: 0,
        enableHighAccuracy: false,
        timeout: Infinity,
    };

    if (options) {
        if (
            options.maximumAge !== undefined &&
            !isNaN(options.maximumAge) &&
            options.maximumAge > 0
        ) {
            opt.maximumAge = options.maximumAge;
        }
        if (options.enableHighAccuracy !== undefined) {
            opt.enableHighAccuracy = options.enableHighAccuracy;
        }
        if (options.timeout !== undefined && !isNaN(options.timeout)) {
            if (options.timeout < 0) {
                opt.timeout = 0;
            } else {
                opt.timeout = options.timeout;
            }
        }
    }

    return opt;
}

// Returns a timeout failure, closed over a specified timeout value and error callback.
function createTimeout(errorCallback, timeout) {
    let t = setTimeout(function () {
        clearTimeout(t);
        t = null;
        errorCallback({
            code: PositionError.TIMEOUT,
            message: 'Position retrieval timed out.',
        });
    }, timeout);
    return t;
}

const geolocation = {
    nameSpace: 'Location',
    lastPosition: null, // reference to last known (cached) position returned
    getCurrentPosition: function (successCallback, errorCallback, options) {
        argscheck.checkArgs('fFO', 'befriend.plugins.geo.getCurrentPosition', arguments);
        options = parseParameters(options);

        const timeoutTimer = { timer: null };

        const win = function (p) {
            clearTimeout(timeoutTimer.timer);
            if (!timeoutTimer.timer) {
                // Timeout already happened, or native fired error callback for
                // this geo request.
                // Don't continue with success callback.
                return;
            }
            const pos = new Position(
                {
                    latitude: p.latitude,
                    longitude: p.longitude,
                    altitude: p.altitude,
                    accuracy: p.accuracy,
                    heading: p.heading,
                    velocity: p.velocity,
                    altitudeAccuracy: p.altitudeAccuracy,
                },
                p.timestamp,
            );
            geolocation.lastPosition = pos;
            successCallback(pos);
        };
        const fail = function (e) {
            clearTimeout(timeoutTimer.timer);
            timeoutTimer.timer = null;
            const err = new PositionError(e.code, e.message);
            if (errorCallback) {
                errorCallback(err);
            }
        };

        // Check our cached position, if its timestamp difference with current time is less than the maximumAge, then just
        // fire the success callback with the cached position.
        if (
            geolocation.lastPosition &&
            options.maximumAge &&
            new Date().getTime() - geolocation.lastPosition.timestamp <= options.maximumAge
        ) {
            successCallback(geolocation.lastPosition);
            // If the cached position check failed and the timeout was set to 0, error out with a TIMEOUT error object.
        } else if (options.timeout === 0) {
            fail({
                code: PositionError.TIMEOUT,
                message:
                    "timeout value in PositionOptions set to 0 and no cached Position object available, or cached Position object's age exceeds provided PositionOptions' maximumAge parameter.",
            });
            // Otherwise we have to call into native to retrieve a position.
        } else {
            if (options.timeout !== Infinity) {
                // If the timeout value was not set to Infinity (default), then
                // set up a timeout function that will fire the error callback
                // if no successful position was retrieved before timeout expired.
                timeoutTimer.timer = createTimeout(fail, options.timeout);
            } else {
                // This is here so the check in the win function doesn't mess stuff up
                // may seem weird but this guarantees timeoutTimer is
                // always truthy before we call into native
                timeoutTimer.timer = true;
            }
            exec(win, fail, 'Location', 'getLocation', [
                options.enableHighAccuracy,
                options.maximumAge,
            ]);
        }
        return timeoutTimer;
    },
    watchPosition: function (successCallback, errorCallback, options) {
        argscheck.checkArgs('fFO', 'befriend.plugins.geo.getCurrentPosition', arguments);
        options = parseParameters(options);

        const id = utils.createUUID();

        // Tell device to get a position ASAP, and also retrieve a reference to the timeout timer generated in getCurrentPosition
        timers[id] = geolocation.getCurrentPosition(successCallback, errorCallback, options);

        const fail = function (e) {
            clearTimeout(timers[id].timer);
            const err = new PositionError(e.code, e.message);
            if (errorCallback) {
                errorCallback(err);
            }
        };

        const win = function (p) {
            clearTimeout(timers[id].timer);
            if (options.timeout !== Infinity) {
                timers[id].timer = createTimeout(fail, options.timeout);
            }
            const pos = new Position(
                {
                    latitude: p.latitude,
                    longitude: p.longitude,
                    altitude: p.altitude,
                    accuracy: p.accuracy,
                    heading: p.heading,
                    velocity: p.velocity,
                    altitudeAccuracy: p.altitudeAccuracy,
                },
                p.timestamp,
            );
            geolocation.lastPosition = pos;
            successCallback(pos);
        };

        exec(win, fail, 'Location', 'addWatch', [id, options.enableHighAccuracy]);

        return id;
    },
    clearWatch: function (id) {
        if (id && timers[id] !== undefined) {
            clearTimeout(timers[id].timer);
            timers[id].timer = false;
            exec(null, null, 'Location', 'clearWatch', [id]);
        }
    },
};

module.exports = geolocation;
