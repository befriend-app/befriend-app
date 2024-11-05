window['befriend'] = {
    is_paused: false,
    classes: {
        placesShown: 'display-places',
        changeLocationShown: 'display-change-location',
        placesSuggestShown: 'show-suggestions',
        createActivityShown: 'create-activity',
        availableMeSections: 'display-available-me-sections',
        confirmMeAction: 'confirm-me-action',
        autoCompleteMe: 'show-auto-complete',
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
    me: null,
    location: null,
    activities: null,
    places: null,
    friends: null,
    when: null,
    maps: null,
    notifications: null,
    ws: null,
    variables: null,
    els: {},
    timeouts: {},
    plugins: {},
    init: function () {
        console.log('Befriend: [init]');

        return new Promise(async (resolve, reject) => {
            dayjs.extend(dayjs_plugin_advancedFormat);

            //plugins
            if (typeof BefriendPlugin !== 'undefined') {
                befriend.plugins = BefriendPlugin;
            }

            //user
            try {
                await befriend.user.init();
            } catch (e) {
                console.error(e);
            }

            //html
            try {
                await befriend.html.appInit();
            } catch (e) {
                console.error(e);
            }

            //styles
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

            //notifications
            try {
                await befriend.notifications.init();
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

            try {
                await befriend.me.init();
            } catch (e) {
                console.error(e);
            }

            //app events
            try {
                await befriend.events.init();
            } catch (e) {
                console.error(e);
            }

            //ws
            try {
                befriend.ws.init();
            } catch (e) {
                console.error(e);
            }

            fireClick(befriend.els.footer.querySelector('.nav-item.me'));

            resolve();
        });
    },
    api: {
        get: function (route) {
            return new Promise(async (resolve, reject) => {
                try {
                    let r = await axios.get(joinPaths(api_domain, route));

                    resolve(r);
                } catch (e) {
                    console.error(e);
                    return reject(e);
                }
            });
        },
        post: function (route, data) {
            return new Promise(async (resolve, reject) => {
                try {
                    let r = await axios.post(joinPaths(api_domain, route), data);

                    resolve(r);
                } catch (e) {
                    console.error(e);
                    return reject(e);
                }
            });
        },
        put: function (route, data) {
            return new Promise(async (resolve, reject) => {
                try {
                    let r = await axios.put(joinPaths(api_domain, route), data);

                    resolve(r);
                } catch (e) {
                    console.error(e);
                    return reject(e);
                }
            });
        },
    },
    auth: {
        get: function (route, data) {
            return new Promise(async (resolve, reject) => {
                let loginObj = {
                    person_token: befriend.user.person.token,
                    login_token: befriend.user.login.token,
                };

                let requestData = {};

                if (data && typeof data === 'object') {
                    requestData = { ...loginObj, ...data };
                } else {
                    requestData = { ...loginObj };
                }

                try {
                    let r = await axios.get(joinPaths(api_domain, route), {
                        params: requestData,
                    });

                    resolve(r);
                } catch (e) {
                    console.error(e);
                    return reject(e);
                }
            });
        },
        post: function (route, data) {
            return new Promise(async (resolve, reject) => {
                let requestData = {};

                let loginObj = {
                    person_token: befriend.user.person.token,
                    login_token: befriend.user.login.token,
                };

                if (data && typeof data === 'object') {
                    requestData = { ...loginObj, ...data };
                } else {
                    requestData = { ...loginObj };
                }

                try {
                    let r = await axios.post(joinPaths(api_domain, route), requestData);

                    resolve(r);
                } catch (e) {
                    console.error(e);
                    return reject(e);
                }
            });
        },
        put: function (route, data) {
            return new Promise(async (resolve, reject) => {
                let requestData = {};

                let loginObj = {
                    person_token: befriend.user.person.token,
                    login_token: befriend.user.login.token,
                };

                if (data && typeof data === 'object') {
                    requestData = { ...loginObj, ...data };
                } else {
                    requestData = { ...loginObj };
                }

                try {
                    let r = await axios.put(joinPaths(api_domain, route), requestData);

                    resolve(r);
                } catch (e) {
                    console.error(e);
                    return reject(e);
                }
            });
        },
        delete: function (route, data) {
            return new Promise(async (resolve, reject) => {
                let requestData = {};

                let loginObj = {
                    person_token: befriend.user.person.token,
                    login_token: befriend.user.login.token,
                };

                if (data && typeof data === 'object') {
                    requestData = { ...loginObj, ...data };
                } else {
                    requestData = { ...loginObj };
                }

                try {
                    let r = await axios.delete(joinPaths(api_domain, route), {
                        data: requestData,
                    });

                    resolve(r);
                } catch (e) {
                    console.error(e);
                    return reject(e);
                }
            });
        },
    },
    toggleSpinner: function (show) {
        if (show) {
            addClassEl('show', befriend.els.viewSpinner);
        } else {
            removeClassEl('show', befriend.els.viewSpinner);
        }
    },
    isViewShown: function (view_name) {
        let view_el = document.querySelector(`.view-${view_name}`);

        return elHasClass(view_el, 'active');
    },
    processWS: function (data) {
        if (!data || !data.action) {
            return false;
        }

        console.log('process ws');

        if (data.action === '') {
        }
    },
};
