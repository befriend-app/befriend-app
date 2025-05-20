const exec = require('cordova/exec');

const geo = require('./GeoLocation');

var Befriend = {
    geo: geo,
    statusBar: {
        nameSpace: 'StatusBar',
        setBorder: function (px, color, successCallback, errorCallback) {
            exec(
                successCallback,
                errorCallback,
                Befriend.statusBar.nameSpace,
                'setStatusBarBorder',
                [px, color],
            );
        },
        transform: function (yOffset, duration, successCallback, errorCallback) {
            exec(
                successCallback,
                errorCallback,
                Befriend.statusBar.nameSpace,
                'transformStatusBar',
                [yOffset, duration],
            );
        },
        getHeight: function (success, error) {
            exec(success, error, Befriend.statusBar.nameSpace, 'getStatusBarHeight', []);
        },
        setBackgroundTransparency: function (alpha, transition, success, error) {
            if (!transition) {
                transition = 0.3;
            } else if (transition > 1) {
                transition = transition / 100; //ms to seconds
            }
            exec(success, error, Befriend.statusBar.nameSpace, 'setBackgroundTransparency', [
                alpha,
                transition,
            ]);
        },
    },
    notifications: {
        nameSpace: 'Notifications',
        getToken: function (success, error) {
            exec(success, error, Befriend.notifications.nameSpace, 'getToken', []);
        },
        registerForPushNotifications: function (success, error) {
            exec(
                success,
                error,
                Befriend.notifications.nameSpace,
                'registerForPushNotifications',
                [],
            );
        },
        onNotificationReceived: function (callback) {
            exec(callback, null, Befriend.notifications.nameSpace, 'onNotificationReceived', []);
        },
        onLaunchNotification: function (callback) {
            exec(callback, null, Befriend.notifications.nameSpace, 'onLaunchNotification', []);
        },
        setBadgeNumber: function (number, success, error) {
            exec(success, error, Befriend.notifications.nameSpace, 'setBadgeNumber', [number]);
        },
    },
    fileSystem: {
        nameSpace: 'FileSystem',
        getFile: function (path, options, success, error) {
            exec(success, error, 'FileSystem', 'getFile', [path, options]);
        },
        readFile: function (path, success, error) {
            exec(success, error, 'FileSystem', 'readFile', [path]);
        },
        writeFile: function (path, data, success, error) {
            exec(success, error, 'FileSystem', 'writeFile', [path, data]);
        },
        getDataDirectory: function (success, error) {
            exec(success, error, 'FileSystem', 'getDataDirectory', []);
        },
    },
    camera: {
        takePicture: function(successCallback, errorCallback, options) {
            options = options || {};
            exec(successCallback, errorCallback, "Camera", "takePicture", [options]);
        },
        getPicture: function(successCallback, errorCallback, options) {
            options = options || {};
            exec(successCallback, errorCallback, "Camera", "getPicture", [options]);
        },
        cleanup: function(successCallback, errorCallback) {
            exec(successCallback, errorCallback, "Camera", "cleanup", []);
        }
    }
};

module.exports = Befriend;
