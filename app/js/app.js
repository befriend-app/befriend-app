window['befriend'] = {
    classes: {
        placesShown: 'display-places',
        changeLocationShown: 'display-change-location',
        placesSuggestShown: 'show-suggestions',
        createActivityShown: 'create-activity',
    },
    timing: {
        showPlaces: null,
        showChangeLocation: null,
        showCreateActivity: null,
    },
    html: null,
    styles: null,
    events: null,
    user: null,
    location: null,
    activities: null,
    places: null,
    friends: null,
    when: null,
    maps: null,
    els: {},
    variables: null,
    timeouts: {},
    init: function () {
        console.log('Befriend: [init]');

        return new Promise(async (resolve, reject) => {
            //user
            try {
                await befriend.user.init();
            } catch(e) {
                console.error(e);
            }

            //html
            try {
                await befriend.html.appInit();
            } catch (e) {
                console.error(e);
            }

            try {
                await befriend.styles.init();
            } catch (e) {
                console.error(e);
            }

            //location
            try {
                await befriend.location.init();
            } catch (e) {
                console.error(e);
            }

            //when
            try {
                await befriend.when.init();
            } catch (e) {
                console.error(e);
            }

            //map
            try {
                await befriend.maps.init();
            } catch (e) {
                console.error(e);
            }

            //activities
            try {
                await befriend.activities.init();
            } catch (e) {
                console.error(e);
            }

            //events
            try {
                await befriend.events.init();
            } catch (e) {
                console.error(e);
            }

            // cordova.plugins.notification.local.addActions('activity-request', [
            //     { id: 'yes', title: 'Accept' },
            //     { id: 'no', title: 'Decline' },
            //     { id: 'view', title: 'View' },
            // ]);
            //
            // cordova.plugins.notification.local.schedule({
            //     title: 'Invite: Coffee with Eugene',
            //     text: '10:30 am at Dolores Park',
            //     actions: [
            //         { id: 'yes', title: 'Yes' },
            //         { id: 'no',  title: 'No' }
            //     ],
            //     foreground: true,
            //     smallIcon: 'res://n_icon.png',
            //     // icon: ''
            // });

            resolve();
        });
    },
    api: {
        post: function (route, data) {
            return new Promise(async (resolve, reject) => {
                let requestData = {};

                let loginObj = {
                    person_token: befriend.user.person.token,
                    login_token: befriend.user.login.token
                };

                if(data && typeof data === 'object') {
                    requestData = {...loginObj, ...data};
                } else {
                    requestData = {...loginObj};
                }

                console.log(requestData);

                try {
                     let r = await axios.post(joinPaths(api_domain, route), requestData);

                     resolve(r);
                } catch(e) {
                    console.error(e);
                    return reject(e);
                }
            });
        }
    }
};
