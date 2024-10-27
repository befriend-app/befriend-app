befriend.notifications = {
    events: {
        init: function () {
            return new Promise(async (resolve, reject) => {
                // befriend.notifications.events.onLaunched();
                // befriend.notifications.events.onNotification();
                resolve();
            });
        },
        onLaunched: function() {
            try {
                PushTokenPlugin.onLaunchNotification(function(notification) {
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
                PushTokenPlugin.onNotificationReceived(function(notification) {
                    console.log('Received notification:', notification);
                    if (notification.type === 'click') {
                        // Notification was clicked
                        console.log('User clicked notification:', notification.notification);
                    } else {
                        // Regular notification received
                        console.log('Received notification data:', notification);
                    }
                });
            } catch(e) {
                console.error(e);
            }
        }
    }
};