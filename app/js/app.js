window['befriend'] = {
    init_finished: false,
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
    navigationClassMap: {
        home: 'view-home',
        friends: 'view-friends',
        activities: 'view-activities',
        filters: 'view-filters',
        me: 'view-me',
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
    modes: null,
    filters: null,
    me: null,
    places: null,
    friends: null,
    when: null,
    maps: null,
    notifications: null,
    modals: null,
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

            //handle app start on notification
            await befriend.notifications.events.init();

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

            //me
            try {
                await befriend.me.init();
            } catch (e) {
                console.error(e);
            }

            //filters
            try {
                await befriend.filters.init();
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

            befriend.init_finished = true;

            //todo remove
            setTimeout(function () {
                // befriend.navigateToView('filters');
            }, 50);

            resolve();
        });
    },
    navigateToView: function (view, skip_transition) {
        let nav_items = befriend.els.footer.getElementsByClassName('nav-item');
        let views = befriend.els.views.getElementsByClassName('view');

        let view_name = befriend.navigationClassMap[view];

        let viewEl = befriend.els.views.querySelector(`.${view_name}`);
        let navEl = Array.from(nav_items).find(item => item.getAttribute('data-nav') === view);

        removeElsClass(nav_items, 'active');
        removeElsClass(views, 'active');

        if(skip_transition) {
            addElsClass(nav_items, 'no-transition');
        }

        addClassEl('active', navEl);
        addClassEl('active', viewEl);

        requestAnimationFrame(function () {
            removeElsClass(nav_items, 'no-transition');
        });

        //hide any overlays on footer nav
        befriend.places.search.toggleAutoComplete(false);
        befriend.places.activity.toggleDisplayPlaces(false);
        befriend.me.toggleSectionOptions(false);

        befriend.me.toggleAutoComplete(null, false);

        befriend.filters.hideActiveSecondaryIf();
        befriend.filters.hideActiveAutoCompleteIf();
        befriend.filters.hideActiveAutoCompleteSelectIf();
        befriend.filters.networks.toggleDropdown(false);
        befriend.me.hideActiveSecondaryIf();

        //view specific logic
        if(view === 'home') {
            if(befriend.maps.needsResize) {
                requestAnimationFrame(function () {
                    befriend.maps.maps.activities.resize();
                    befriend.maps.needsResize = false;
                });
            }
        } else if (view === 'filters') {
            requestAnimationFrame(function () {
                befriend.filters.updateSectionHeights(true);

                //update slider control positions
                befriend.filters.positionSliders();
            });
        } else if (view === 'me') {
            befriend.me.updateCollapsed(true);
            befriend.me.modes.updateModeHeight(true);
            befriend.me.account.setView('profile');
        }

        if(befriend.filters.matches.needsUpdate) {
            befriend.filters.matches.updateCounts();
            befriend.filters.matches.needsUpdate = false;
        }
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
    toggleSpinner: function (show, timeout_ms) {
        if (show) {
            addClassEl('show', befriend.els.viewSpinner);
        } else {
            if (timeout_ms) {
                setTimeout(function () {
                    removeClassEl('show', befriend.els.viewSpinner);
                }, timeout_ms);
            } else {
                removeClassEl('show', befriend.els.viewSpinner);
            }
        }
    },
    isViewShown: function (view_name) {
        let view_el = document.querySelector(`.view-${view_name}`);

        return elHasClass(view_el, 'active');
    },
    processWS: function (message) {
        if (!message || !message.namespace) {
            return;
        }

        console.log(message);

        if (message.namespace === 'notifications') {
            befriend.notifications.updateAvailableSpots(message.data?.activity_token, message.data?.spots?.available);
        }
    },
    initFinished: function () {
        return new Promise(async (resolve, reject) => {
            console.log("init finished check")

            if(befriend.init_finished) {
                return resolve(true);
            }

            await rafAwait();

            resolve(await befriend.initFinished());
        });
    },
};
