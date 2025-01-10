befriend.notifications = {
    current: null,
    setDeviceToken: async function (token) {
        //save on server if new device token
        if (!befriend.user.sameDeviceToken(token)) {
            let platform = null;

            if (is_ios) {
                platform = 'ios';
            } else if (is_android) {
                platform = 'android';
            }

            try {
                let r = await befriend.auth.post(`/devices`, {
                    device_token: token,
                    platform: platform,
                });

                befriend.user.setDeviceToken(token);
            } catch (e) {
                console.error(e);
            }
        }
    },
    init: function () {
        return new Promise(async (resolve, reject) => {
            try {
                befriend.plugins.notifications.registerForPushNotifications(
                    function (token) {
                        befriend.notifications.setDeviceToken(token);
                        resolve();
                    },
                    function (err) {
                        console.error(err);
                        reject(err);
                    },
                );
            } catch (e) {
                console.error(e);
                return reject();
            }
        });
    },
    showActivity: function (notification, on_launch) {
        if(!on_launch) {
            fireClick(document.getElementById('create-activity-back'));
        }

        //navigate to activities view
        befriend.navigateToView('activities', true);

        //get activity data

    },
    showNotificationBar: function () {

    },
    events: {
        init: function () {
            return new Promise(async (resolve, reject) => {
                befriend.notifications.events.onLaunched();
                befriend.notifications.events.onNotification();
                resolve();
            });
        },
        onLaunched: function () {
            try {
                befriend.plugins.notifications.onLaunchNotification(async function (notification) {
                    window.launched_from_notification = true;

                    befriend.notifications.current = notification;

                    //wait for init to be finished
                    await befriend.initFinished();

                    console.log("after init finished")

                    befriend.notifications.showActivity(notification, true);

                    removeClassEl('loading', document.body);

                    if (notification) {
                        console.log('App was launched from notification:', notification);
                    }
                });
            } catch (e) {
                console.error(e);
            }
        },
        onNotification: function () {
            try {
                befriend.plugins.notifications.onNotificationReceived(function (notification) {
                    console.log('Received notification:', notification);

                    befriend.notifications.current = notification.notification;

                    if (notification?.type === 'click') {
                        befriend.notifications.showActivity(notification.notification);
                    } else {
                        //show in-app notification
                        befriend.notifications.showNotificationBar();
                    }
                });
            } catch (e) {
                console.error(e);
            }
        },
    },
};
