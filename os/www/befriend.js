const exec = require('cordova/exec');

const geo = require('./GeoLocation');

var Befriend = {
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
    geo: geo,
};

module.exports = Befriend;
