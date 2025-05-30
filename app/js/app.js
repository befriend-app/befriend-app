window['befriend'] = {
    init_finished: false,
    is_paused: false,
    views: {
        active: 'home',
        scroll: {},
    },
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
    loginSignup: null,
    oauth: null,
    location: null,
    device: null,
    activities: null,
    modes: null,
    filters: null,
    me: null,
    places: null,
    friends: null,
    when: null,
    maps: null,
    notifications: null,
    reviews: null,
    modals: null,
    ws: null,
    variables: null,
    els: {},
    timeouts: {},
    plugins: {},
    getPersonToken: function () {
        return befriend.user.person.token;
    },
    api: {
        url: function (route) {
            return joinPaths(api_domain, route);
        },
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
                    person_token: befriend.getPersonToken(),
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
                    person_token: befriend.getPersonToken(),
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
                    person_token: befriend.getPersonToken(),
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
                    person_token: befriend.getPersonToken(),
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
    networks: {
        get: function (domain, route, data = {}) {
            return new Promise(async (resolve, reject) => {
                try {
                    let params = {
                        ...data,
                    };

                    let r = await axios.get(joinPaths(domain, route), {
                        params,
                    });

                    resolve(r);
                } catch (e) {
                    console.error(e);
                    return reject(e);
                }
            });
        },
        post: function (domain, route, data = {}) {
            return new Promise(async (resolve, reject) => {
                try {
                    let r = await axios.post(joinPaths(domain, route), data);

                    resolve(r);
                } catch (e) {
                    console.error(e);
                    return reject(e);
                }
            });
        },
        put: function (domain, route, data = {}) {
            return new Promise(async (resolve, reject) => {
                try {
                    let r = await axios.put(joinPaths(domain, route), data);

                    resolve(r);
                } catch (e) {
                    console.error(e);
                    return reject(e);
                }
            });
        },
    },
    init: function (afterSignupLogin = false, fromProfileSetup = false) {
        console.log('Befriend: [init]');

        return new Promise(async (resolve, reject) => {
            dayjs.extend(dayjs_plugin_advancedFormat);

            //plugins
            if (typeof BefriendPlugin !== 'undefined') {
                befriend.plugins = BefriendPlugin;
            }

            //handle app start on notification
            await befriend.notifications.events.init();

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

            //oauth
            try {
                await befriend.oauth.init();
            } catch(e) {
                console.error(e);
            }

            //user
            try {
                await befriend.user.init();
            } catch (e) {
                //catch rejection if not logged in
                //show login screen
                befriend.loginSignup.show();

                return resolve();
            }

            //if user missing first name/birthday/picture show post signup screen
            if(!befriend.user.isProfileReady()) {
                befriend.loginSignup.showProfileScreen();
                return resolve();
            }

            if(!afterSignupLogin) {
                //location
                try {
                    await befriend.location.init();
                } catch (e) {
                    console.error(e);
                }

                //device
                try {
                    await befriend.device.init();
                } catch (e) {
                    console.error(e);
                }
            }

            //when
            try {
                await befriend.when.init();
            } catch (e) {
                console.error(e);
            }

            if(!afterSignupLogin) {
                //map
                try {
                    await befriend.maps.init();
                } catch (e) {
                    console.error(e);
                }    
            }

            //me
            try {
                await befriend.me.init();
            } catch (e) {
                console.error(e);
            }

            //activities
            try {
                await befriend.activities.init();
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

            befriend.reviews.init();

            befriend.init_finished = true;
            
            // if after signup/login,
            // init location/device/map after small delay to
            // prevent permission dialogs from being shown during transition to app
            if(afterSignupLogin) {
                setTimeout(async function () {
                    try {
                        await befriend.location.init();
                        await befriend.device.init();
                        await befriend.maps.init();

                        await befriend.filters.matches.init();
                    } catch(e) {
                        console.error(e);
                    }
                }, 1000);
            }

            //todo remove
            setTimeout(function () {
                // befriend.navigateToView('activities');

                //show first activity
                // let activity = befriend.els.mainActivitiesView.querySelector('.activity');

                // if (activity) {
                    // fireClick(activity);
                // }

                // befriend.reviews.showReviewActivities();
            }, 50);

            resolve();
        });
    },
    getPlatform: function () {
        if(is_ios) {
            return 'ios';
        }

        if(is_android) {
            return 'android';
        }
    },
    navigateToView: function (view, skip_transition, classes_only) {
        befriend.views.active = view;

        let nav_items = befriend.els.footer.getElementsByClassName('nav-item');
        let views = befriend.els.views.getElementsByClassName('view');

        let view_name = befriend.navigationClassMap[view];

        let viewEl = befriend.els.views.querySelector(`.${view_name}`);
        let prevViewEl = befriend.els.views.querySelector('.view.active');

        let navEl = Array.from(nav_items).find((item) => item.getAttribute('data-nav') === view);

        removeElsClass(nav_items, 'active');
        removeElsClass(views, 'active');

        if (skip_transition) {
            addElsClass(nav_items, 'no-transition');
        }

        addClassEl('active', navEl);
        addClassEl('active', viewEl);

        requestAnimationFrame(function () {
            removeElsClass(nav_items, 'no-transition');
        });

        if (classes_only) {
            return;
        }

        //hide any overlays of footer nav
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
        if (view === 'home') {
            if (befriend.maps.needsResize) {
                requestAnimationFrame(function () {
                    befriend.maps.centerMap();
                    befriend.maps.needsResize = false;
                });
            }
        } else if (view === 'activities') {
            //navigate back to main activities view if current and previous views are the same
            if (prevViewEl === viewEl) {
                viewEl.scrollTop = befriend.activities.scroll.main || 0;

                removeClassEl('show', befriend.els.activityNotificationView);
                removeClassEl('show', befriend.els.currentActivityView);
                addClassEl('show', befriend.els.mainActivitiesView);
            } else {
                if (
                    befriend.activities.displayActivity.currentToken &&
                    elHasClass(befriend.els.currentActivityView, 'show')
                ) {
                    befriend.activities.displayActivity.display(
                        befriend.activities.displayActivity.currentToken,
                        true,
                        true,
                    );
                } else {
                    viewEl.scrollTop = befriend.activities.scroll.main || 0;
                }
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

        if (befriend.filters.matches.needsUpdate) {
            befriend.filters.matches.updateCounts();
            befriend.filters.matches.needsUpdate = false;
        }
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
            befriend.notifications.updateAvailableSpots(
                message.data?.activity_token,
                message.data?.spots?.available,
                message.data?.activity_cancelled_at,
            );
        } else if (message.namespace === 'activities') {
            befriend.activities.displayActivity.updateData(message.data);
        }
    },
    initFinished: function () {
        return new Promise(async (resolve, reject) => {
            console.log('init finished check');

            async function isFinished() {
                if (befriend.init_finished) {
                    return resolve(true);
                }

                await rafAwait();

                await isFinished();
            }

            await isFinished();

            resolve(true);
        });
    },
    preventNavigation: function (prevent) {
        if (prevent) {
            addClassEl('show', 'transition-overlay');
        } else {
            removeClassEl('show', 'transition-overlay');
        }
    },
};
