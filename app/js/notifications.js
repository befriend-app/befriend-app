befriend.notifications = {
    data: {
        all: {},
        current: null,
    },
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
    showActivity: async function (notification, on_launch) {
        if(!notification?.activity_token || !notification.network_token) {
            return;
        }

        if(!on_launch) {
            fireClick(document.getElementById('create-activity-back'));
        }

        //navigate to activities view
        befriend.navigateToView('activities', true);

        //get activity data
        try {
             let r = await befriend.auth.get(`/activities/${notification.activity_token}`, {
                 network_token: notification.network_token
             });

             befriend.notifications.data.current = r.data;

             befriend.notifications.data.all[notification.activity_token] = r.data;

             let html = this.getViewHtml(r.data);

             let view_el = befriend.els.activities.querySelector('.notification-view').querySelector('.container');

             view_el.innerHTML = html;

             //position accept-decline
            // let accept_decline_el = befriend.els.activities.querySelector('.accept-decline');

            // let footer_box = befriend.els.footer.getBoundingClientRect();
            //
            // accept_decline_el.style.bottom = `${footer_box.top}px`;

             befriend.activities.views.showView('notification-view');
        } catch(e) {
            console.error(e);
        }
    },
    getViewHtml: function (data) {
        let html = '';

        console.log(data);

        let invite_html = `<div class="invite">
                                <div class="image">
                                    ${data.activity?.activity_type?.activity_image}
                                </div>
                                <div class="name">
                                    ${data.activity?.activity_type?.activity_name} at ${data.activity?.human_time}
                                </div>
                            </div>`;

        let rating_price = `
        <div class="rating-price">
            <div class="rating">${befriend.places.activity.html.getRating(data.activity.place)}</div>
            <div class="price">${befriend.places.activity.html.getPrice(data.activity.place)}</div>
        </div>`;

        let distance_km = calculateDistance(
            befriend.location.device,
            {
                lat: data.activity.location_lat,
                lon: data.activity.location_lon
            },
            true
        );

        let distance_miles = distance_km * kms_per_mile;

        let distance_str = '';

        if(useKM()) {
            distance_str = `${formatRound(distance_km)} km`;
        } else {
            distance_str = `${formatRound(distance_miles)} m`;
        }

        let place_html = `<div class="place section">
                                <div class="label">Place 
                                    <div class="distance">
                                        (${distance_str})
                                    </div>
                                </div>
                                
                                <div class="info">
                                    <div class="name">${data.activity?.location_name}</div>
                                    
                                    ${rating_price}
                                    
                                    <div class="address-container">
                                        ${befriend.places.getPlaceLocation(data.activity)}
                                    </div>
                                </div>
                           </div>`;

        return `<div class="notification">
                    <h2>Invitation <div class="date">${getFriendlyDateFromString(data.activity.human_date)}</div></h2>
                    
                    <div class="accept-decline">
                        <div class="button accept">Accept</div>
                        <div class="button decline">Decline</div>
                    </div>
                    
                    ${invite_html}
                    
                    <div class="details">
                        ${place_html}
                    </div>
                </div>`;
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

                    if (notification?.type === 'click') {
                        befriend.notifications.showActivity(notification.notification);
                    } else {
                        //show in-app notification
                        befriend.notifications.showNotificationBar();

                        //tmp - todo remove
                        befriend.notifications.showActivity(notification);
                    }
                });
            } catch (e) {
                console.error(e);
            }
        },
    },
};
