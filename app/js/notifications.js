befriend.notifications = {
    device: {
        token: null
    },
    setDeviceToken: function (token) {
        befriend.notifications.device.token = token;
    },
    init: function () {
        return new Promise(async (resolve, reject) => {
            try {
                befriend.plugins.notifications.registerForPushNotifications(function (token) {
                    befriend.notifications.setDeviceToken(token);
                    resolve();
                }, function (err) {
                    console.error(err);
                    reject(err);
                });
            } catch(e) {
                console.error(e);
                return reject();
            }
        });
    },
    events: {
        init: function () {
            return new Promise(async (resolve, reject) => {
                befriend.notifications.events.onLaunched();
                befriend.notifications.events.onNotification();
                resolve();
            });
        },
        onLaunched: function() {
            try {
                befriend.plugins.notifications.onLaunchNotification(function(notification) {
                    if (notification) {
                        window.launched_from_notify = true;
                        console.log('App was launched from notification:', notification);
                    }
                });
            } catch(e) {
                console.error(e);
            }
        },
        onNotification: function() {
            try {
                befriend.plugins.notifications.onNotificationReceived(function(notification) {
                    console.log('Received notification:', notification);

                    if (document.visibilityState === 'visible') {

                    }
                });
            } catch(e) {
                console.error(e);
            }
        }
    }
};