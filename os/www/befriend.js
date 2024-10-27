const exec = require('cordova/exec');

const geo = require('./GeoLocation');

var Befriend = {
    statusBar: {
        setBorder: function(px, color, successCallback, errorCallback) {
            exec(successCallback, errorCallback, "Befriend", "setStatusBarBorder", [px, color]);
        },
        transform: function(yOffset, duration, successCallback, errorCallback) {
            exec(successCallback, errorCallback, "Befriend", "transformStatusBar", [yOffset, duration]);
        },
        getHeight: function (success, error) {
            exec(success, error, 'Befriend', 'getStatusBarHeight', []);
        },
        setBackgroundTransparency: function(alpha, transition, success, error) {
            if(!transition) {
                transition = .3;
            } else if(transition > 1) {
                transition = transition / 100; //ms to seconds
            }
            exec(success, error, "Befriend", "setBackgroundTransparency", [alpha, transition]);
        },
    },
    geo: geo
};

module.exports = Befriend;