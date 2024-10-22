function resizeAndRepositionMap(mapEl) {
    return new Promise(async (resolve, reject) => {
        mapEl.style.transition = 'initial';
        mapEl.style.width = '100vw';
        mapEl.style.height = `${befriend.variables.map_create_activity_h}px`;

        const mapBox = mapEl.getBoundingClientRect();

        await rafAwait();

        befriend.maps.maps.activities.resize();

        await rafAwait();

        mapEl.style.position = 'absolute';
        mapEl.style.removeProperty('transition');

        await rafAwait();

        mapEl.style.transform = `translate(${-mapBox.x}px, ${-mapBox.y}px)`;

        await rafAwait();

        resolve();
    });
}

function getPlaceCoordinates(place) {
    return new Promise(async (resolve, reject) => {
        if (!place.location_lat || !place.location_lon) {
            try {
                const addressGeo = await befriend.places.getAddressGeo(place);
                place.location_lat = addressGeo.lat;
                place.location_lon = addressGeo.lon;
            } catch (e) {
                console.error('Error getting address geo:', e);
                return reject();
            }
        }

        resolve({
            lat: place.location_lat,
            lon: place.location_lon,
        });
    });
}

function addPlaceMarkerToMap(to) {
    befriend.maps.addMarker(
        befriend.maps.maps.activities,
        { lat: to.lat, lon: to.lon },
        { is_place: true },
        true,
    );

    // Wait for the place marker to be added
    const startTime = timeNow();

    return new Promise((resolve) => {
        const checkMarker = () => {
            if (befriend.maps.markers.place || timeNow() - startTime > 500) {
                resolve();
            } else {
                requestAnimationFrame(checkMarker);
            }
        };
        checkMarker();
    });
}

befriend.activities = {
    types: {
        data: null,
        colors: [
            '#C70039', // Bold Crimson
            '#FFC300', // Bright Yellow
            '#31a663', // Bold Leaf Green
            '#79A881', // Bold Green
            '#D35400', // Bold Carrot Orange
            '#3498DB', // Bold Sky Blue
            '#2980B9', // Bold Blue
            '#cc6b6b', // Bold Fruit
            '#9B59B6', // Bold Lavender
            '#E74C3C', // Bright Red
            '#F39C12', // Bold Orange
            '#33b1d1', // Light Teal
            '#16A085', // Bold Teal
            '#F1C40F', // Bold Yellow-Green
        ],
    },
    selected: {
        level_1: null,
        level_2: null,
        level_3: null,
    },
    duration: {
        selected: null,
        default: 30, //min
        groups: {
            60: {
                max: 60,
                num: '10 - 60',
                unit: 'minutes',
                options: [
                    [
                        {
                            num: 10,
                            unit: 'min',
                            minutes: 10,
                        },
                    ],
                    [
                        {
                            num: 15,
                            unit: 'min',
                            minutes: 15,
                        },
                    ],
                    [
                        {
                            num: 20,
                            unit: 'min',
                            minutes: 20,
                        },
                    ],
                    [
                        {
                            num: 30,
                            unit: 'min',
                            minutes: 30,
                        },
                    ],
                    [
                        {
                            num: 40,
                            unit: 'min',
                            minutes: 40,
                        },
                    ],
                    [
                        {
                            num: 50,
                            unit: 'min',
                            minutes: 50,
                        },
                    ],
                ],
            },
            120: {
                max: 120,
                num: '1 - 2',
                unit: 'hours',
                options: [
                    [
                        {
                            num: 1,
                            unit: 'hr',
                            minutes: 60,
                        },
                    ],
                    [
                        {
                            num: 1,
                            unit: 'hr',
                            minutes: 70,
                        },
                        {
                            num: 10,
                            unit: 'min',
                            minutes: 70,
                        },
                    ],
                    [
                        {
                            num: 1,
                            unit: 'hr',
                            minutes: 80,
                        },
                        {
                            num: 20,
                            unit: 'min',
                            minutes: 80,
                        },
                    ],
                    [
                        {
                            num: 1,
                            unit: 'hr',
                            minutes: 90,
                        },
                        {
                            num: 30,
                            unit: 'min',
                            minutes: 90,
                        },
                    ],
                    [
                        {
                            num: 1,
                            unit: 'hr',
                            minutes: 100,
                        },
                        {
                            num: 40,
                            unit: 'min',
                            minutes: 100,
                        },
                    ],
                    [
                        {
                            num: 1,
                            unit: 'hr',
                            minutes: 110,
                        },
                        {
                            num: 50,
                            unit: 'min',
                            minutes: 110,
                        },
                    ],
                ],
            },
            240: {
                max: 240,
                num: '2 - 4',
                unit: 'hours',
                options: [
                    [
                        {
                            num: 2,
                            unit: 'hrs',
                            minutes: 120,
                        },
                    ],
                    [
                        {
                            num: 2.5,
                            unit: 'hrs',
                            minutes: 150,
                        },
                    ],
                    [
                        {
                            num: 3,
                            unit: 'hrs',
                            minutes: 180,
                        },
                    ],
                    [
                        {
                            num: 3.5,
                            unit: 'hrs',
                            minutes: 210,
                        },
                    ],
                ],
            },
            360: {
                max: 360,
                num: '4 - 6',
                unit: 'hours',
                options: [
                    [
                        {
                            num: 4,
                            unit: 'hrs',
                            minutes: 240,
                        },
                    ],
                    [
                        {
                            num: 4.5,
                            unit: 'hrs',
                            minutes: 270,
                        },
                    ],
                    [
                        {
                            num: 5,
                            unit: 'hrs',
                            minutes: 300,
                        },
                    ],
                    [
                        {
                            num: 5.5,
                            unit: 'hrs',
                            minutes: 330,
                        },
                    ],
                    [
                        {
                            num: 6,
                            unit: 'hrs',
                            minutes: 360,
                        },
                    ],
                ],
            },
        },
    },
    travel: {
        mode: 'driving',
        times: null
    },
    init: function () {
        console.log('[init] Activities');

        return new Promise(async (resolve, reject) => {
            //add brand color to top of activity colors
            befriend.activities.types.colors.unshift(befriend.variables.brand_color_a);

            //set activity durations
            befriend.activities.setDurations();

            try {
                await befriend.activities.setActivityTypes();
            } catch (e) {
                console.error(e);
            }

            resolve();
        });
    },
    getActivityTypes: function () {
        return new Promise(async (resolve, reject) => {
            try {
                let r = await axios.get(joinPaths(api_domain, 'activity_types'));

                befriend.activities.types.data = r.data;

                resolve();
            } catch (e) {
                console.error(e);
                return reject();
            }
        });
    },
    setActivityTypes: function () {
        return new Promise(async (resolve, reject) => {
            try {
                await befriend.activities.getActivityTypes();
                await befriend.html.setActivityTypes();

                resolve();
            } catch (e) {
                return reject();
            }
        });
    },
    setDurations: function () {
        befriend.html.setDurations();
    },
    updateDuration: function (duration, update_buttons) {
        befriend.activities.duration.selected = duration;

        //set duration in when string
        befriend.els.create_activity
            .querySelector('.when')
            .querySelector('.duration')
            .querySelector('.value').innerHTML = befriend.activities.getDurationStr();

        if (update_buttons) {
            let level_1 = befriend.els.create_activity.querySelector('.level_1');
            //remove all selected groups
            let buttons = befriend.els.activity_duration.getElementsByClassName('button');
            let options = befriend.els.activity_duration.getElementsByClassName('options');
            let option_els = befriend.els.activity_duration.getElementsByClassName('option');

            removeElsClass(buttons, 'active');
            removeElsClass(options, 'active');

            //select
            for (let i = 0; i < option_els.length; i++) {
                let option = option_els[i];

                if (parseInt(option.getAttribute('data-min')) === duration) {
                    let group = option.closest('.options');

                    //set active
                    addClassEl('active', group);

                    //remove selected
                    removeElsClass(group.getElementsByClassName('option'), 'selected');

                    //add selected
                    addClassEl('selected', option);

                    //set group active
                    for (let i = 0; i < buttons.length; i++) {
                        let button = buttons[i];

                        if (
                            button.getAttribute('data-min-max') ===
                            group.getAttribute('data-min-max')
                        ) {
                            addClassEl('active', button);
                            let cls = level_1.classList;

                            for (let j = 0; j < cls.length; j++) {
                                if (cls[j].includes('group')) {
                                    removeClassEl(cls[j], level_1);
                                }
                            }

                            addClassEl(`group-${i + 1}`, level_1);
                        }
                    }
                }
            }
        }
    },
    setTravelTimes: function (from, to) {
        return new Promise(async (resolve, reject) => {
            try {
                let data = await befriend.places.getTravelTimes(from, to);

                befriend.activities.travel.times = data;

                befriend.activities.updateWhenAuto();

                for (let mode_name in data.modes) {
                    let mode = data.modes[mode_name];

                    let el = befriend.els.travel_times.querySelector(`.mode.${mode_name}`);

                    let value_el = el.querySelector('.value');

                    value_el.style.opacity = 0;

                    let time_str = '';

                    if (mode.hours) {
                        time_str = `${mode.hours} hr`;

                        if (mode.hours > 1) {
                            time_str += 's';
                        }

                        if (mode.mins > 0) {
                            time_str += ' ';
                        }
                    }

                    if (mode.mins) {
                        time_str += `${mode.mins}`;

                        if (mode.hours < 1) {
                            time_str += ' min';
                        }
                    }

                    value_el.innerHTML = time_str;

                    requestAnimationFrame(function () {
                        value_el.style.opacity = 1;
                    });
                }
            } catch (e) {
                console.error(e);
            }

            resolve();
        });
    },
    displayCreateActivity: async function () {
        //set which when was selected coming into the create-activity view
        befriend.when.selected.createActivity = structuredClone(befriend.when.selected.main);

        //set up html and transition logic
        befriend.html.createActivity();
        let map_el = befriend.els.activities_map;
        let status_bar_height = await befriend.styles.getStatusBarHeight();

        //transform status bar
        befriend.styles.transformStatusBar(
            status_bar_height + 5,
            befriend.variables.hide_statusbar_ms / 1000,
        );

        //remove prev message
        let message_el = document.getElementById('create-activity-top-message');

        message_el.querySelector('.message').style.transition = 'none';

        removeClassEl('show', message_el);
        message_el.querySelector('.message').style.removeProperty('height');

        message_el.querySelector('.inner').style.removeProperty('backgroundColor');

        befriend.activities.toggleCreateActivity(true);

        //handle location and mapping
        let place = befriend.places.selected.place;

        let from = befriend.location.device;

        //remove pin marker and set custom from
        if (befriend.location.isCustom()) {
            befriend.maps.removeMarkers(befriend.maps.markers.pin);
            from = befriend.location.search;
            from.is_custom = true;
        }

        // Resize and reposition map
        try {
            await resizeAndRepositionMap(map_el);
        } catch (e) {
            console.error(e);
        }

        message_el.querySelector('.message').style.removeProperty('transition');

        //Add place marker to map
        try {
            let to = await getPlaceCoordinates(place);

            befriend.activities.setTravelTimes(from, to);

            await addPlaceMarkerToMap(to);
        } catch (e) {
            console.error(e);
        }

        // update map zoom to show all markers
        befriend.maps.fitMarkersWithMargin(
            befriend.maps.maps.activities,
            [befriend.maps.markers.me, befriend.maps.markers.place],
            befriend.maps.markers.place,
            0.2,
            befriend.variables.create_activity_transition_ms,
        );

        //hide display places after transition
        setTimeout(async function () {
            //hide display places/overlay
            befriend.places.toggleDisplayPlaces(false);
        }, befriend.variables.create_activity_transition_ms);
    },
    getCurrentActivityType: function () {
        let obj = befriend.activities.selected;

        return obj.level_3 || obj.level_2 || obj.level_1;
    },
    createNewActivity: function (persons_count) {
        return new Promise(async (resolve, reject) => {
            try {
                let r = await axios.post(joinPaths(api_domain, 'activities'), {
                    persons: persons_count,
                    filters: {},
                });
            } catch (e) {
                console.error(e);
            }

            resolve();
        });
    },
    toggleCreateActivity: function (show) {
        if (show) {
            befriend.timing.showCreateActivity = timeNow();

            addClassEl(befriend.classes.createActivityShown, document.documentElement);
        } else {
            removeClassEl(befriend.classes.createActivityShown, document.documentElement);
        }
    },
    isCreateActivityShown: function () {
        return elHasClass(document.documentElement, befriend.classes.createActivityShown);
    },
    updateLevelHeight: function (level_num, skip_set_prev) {
        let level_el = befriend.els.activities.querySelector(`.level_${level_num}.show`);

        if (!level_el) {
            return;
        }

        let last_row = lastArrItem(level_el.getElementsByClassName(`level_${level_num}_row`));

        last_row.style.marginBottom = '0px';

        let level_height = getElHeightHidden(level_el);

        if (!skip_set_prev) {
            level_el.setAttribute('data-prev-height', `${level_height}px`);
        }

        level_el.style.height = `${level_height}px`;
    },
    getDurationStr: function () {
        let minutes = befriend.activities.duration.selected;

        let duration_str = `${minutes} minutes`;

        if (minutes >= 60 && minutes < 120) {
            if (minutes === 60) {
                duration_str = `1 hour`;
            } else {
                duration_str = `1 hour, ${minutes - 60} minutes`;
            }
        } else if (minutes >= 120) {
            let hours = Math.floor(minutes / 60);
            let half = (minutes % 60) / 60;

            if (half) {
                let half_str = half.toFixed(1).replace(/0/g, '');

                duration_str = `${hours}${half_str} hours`;
            } else {
                duration_str = `${hours} hours`;
            }
        }

        return duration_str;
    },
    getCurrentTravelTime: function () {
        if(!befriend.activities.travel.times) {
            return null;
        }

        return befriend.activities.travel.times.modes[befriend.activities.travel.mode].total;
    },
    updateWhenAuto: async function () {
        const originalTimes = {
            driving: null,
            walking: null,
            bicycle: null
        };

        function hideMessage() {
            message_el.querySelector('.message').style.height = '0';
            removeClassEl('show', message_el);
        }

        function updateMessage(new_when_str) {
            let inner = message_el.querySelector('.inner');

            if (new_when_str) {
                when_el.querySelector('.time').innerHTML = new_when_str;
                inner.innerHTML = 'Your activity time has been updated automatically.';
                inner.style.backgroundColor = befriend.variables.color_green;
            } else {
                inner.innerHTML = 'Please update your activity location and/or schedule for a later time.';
                inner.style.backgroundColor = befriend.variables.color_red;
            }

            // Calculate height of message
            let height = getElHeightHidden(message_el.querySelector('.message'));
            message_el.querySelector('.message').style.height = `${height}px`;

            befriend.styles.createActivity.updateCloseMessagePosition();

            addClassEl('show', message_el);
        }

        function restoreOriginalTime(mode) {
            if (originalTimes[mode]) {
                when_el.querySelector('.time').innerHTML = originalTimes[mode].whenStr;

                for(let i = 0; i <befriend.when.options.length; i++) {
                    let option = befriend.when.options[i];

                    if(option.id === befriend.when.selected.createActivity.id) {
                        befriend.when.selectOptionIndex(i);
                        break;
                    }
                }

                if(befriend.when.selected.createActivity.time) {
                    befriend.when.selected.createActivity.time.formatted = originalTimes[mode].whenStr;
                }
            }
        }

        let needs_update = false;
        let when = befriend.when.selected.createActivity;
        let mins_to = befriend.activities.getCurrentTravelTime();
        let new_when_str = '';

        // Store original time for current mode if not already stored
        const currentMode = befriend.activities.travel.mode;

        if (originalTimes[currentMode] === null) {
            let when_str = '';

            if(befriend.when.selected.createActivity.is_now) {
                when_str = 'Now';
            } else if(befriend.when.selected.createActivity.is_schedule) {
                when_str = 'Schedule';
            } else {
                when_str = befriend.when.selected.createActivity.time.formatted;
            }

            originalTimes[currentMode] = {
                mins: mins_to,
                whenStr: when_str
            };
        }

        let when_el = befriend.els.create_activity.querySelector('.when');
        let message_el = document.getElementById('create-activity-top-message');

        // Check if update is needed
        if (when.is_now) {
            if (mins_to > befriend.when.thresholds.now) {
                needs_update = true;
            } else {
                // Restore original time if within threshold
                restoreOriginalTime(currentMode);
                hideMessage(message_el);
                return;
            }
        } else if (when.is_schedule) {
            // Handle scheduled times if needed
        } else {
            if (mins_to > when.mins + befriend.when.thresholds.future) {
                needs_update = true;
            } else {
                // Restore original time if within threshold
                restoreOriginalTime(currentMode);
                hideMessage(message_el);
                return;
            }
        }

        if (needs_update) {
            // Find closest possible time
            for (let i = 0; i < befriend.when.options.length; i++) {
                let option = befriend.when.options[i];

                if (option.mins && mins_to < option.mins) {
                    // Auto select when button
                    befriend.when.selectOptionIndex(i);

                    // Store new when string
                    new_when_str = befriend.when.selected.main.time.formatted;

                    // Update original time for current mode
                    originalTimes[currentMode] = {
                        mins: mins_to,
                        whenStr: new_when_str
                    };

                    break;
                }
            }

            updateMessage(new_when_str);
        }
    },
    events: {
        init: function () {
            return new Promise(async (resolve, reject) => {
                try {
                    await befriend.activities.events.level1();
                    befriend.activities.events.onCreateActivityBack();
                    befriend.activities.events.activityDuration();
                    befriend.activities.events.travelTimeMode();
                    befriend.activities.events.hideCreateActivityMessage();
                } catch (e) {
                    console.error(e);
                }

                resolve();
            });
        },
        onCreateActivityBack: function () {
            let back_el = document.getElementById('create-activity-back');

            back_el.addEventListener('click', async function (e) {
                e.preventDefault();
                e.stopPropagation();

                back_el.style.display = 'none';

                befriend.els.travel_times.style.display = 'none';

                befriend.styles.transformStatusBar(
                    0,
                    befriend.variables.create_activity_transition_ms / 1000,
                );

                let map_to_box = document
                    .getElementById('activities-map-wrapper')
                    .getBoundingClientRect();

                let map_el = befriend.els.activities_map;

                map_el.style.removeProperty('transition');

                await rafAwait();

                map_el.style.transform = `translate(${map_to_box.x}px, ${map_to_box.y}px)`;

                await rafAwait();

                map_el.style.removeProperty('transform');

                map_el.style.removeProperty('height');
                map_el.style.removeProperty('width');

                map_el.style.transition = 'initial';

                await rafAwait();

                befriend.maps.maps.activities.resize();

                map_el.style.removeProperty('transition');

                befriend.activities.toggleCreateActivity(false);

                befriend.maps.removeMarkers(befriend.maps.markers.place);

                befriend.maps.setMapCenter(
                    befriend.maps.maps.activities,
                    befriend.location.current,
                );

                if (befriend.location.isCustom()) {
                    befriend.maps.addMarkerCustom();
                }

                back_el.style.removeProperty('display');
                befriend.els.travel_times.style.removeProperty('display');
            });
        },
        activityDuration: function () {
            let level_1_el = befriend.els.activity_duration.querySelector('.level_1');
            let level_1_els = level_1_el.getElementsByClassName('button');
            let level_2_el = befriend.els.activity_duration.querySelector('.level_2');
            let level_2_options = level_2_el.getElementsByClassName('options');
            let all_duration_options = level_2_el.getElementsByClassName('option');

            //handle click on level 1
            for (let level_1_i = 0; level_1_i < level_1_els.length; level_1_i++) {
                let el = level_1_els[level_1_i];

                el.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    removeElsClass(level_1_els, 'active');

                    addClassEl('active', el);

                    let cls = level_1_el.classList;

                    for (let j = 0; j < cls.length; j++) {
                        if (cls[j].includes('group')) {
                            removeClassEl(cls[j], level_1_el);
                        }
                    }

                    addClassEl(`group-${level_1_i + 1}`, level_1_el);

                    //set active options
                    for (let level_2_i = 0; level_2_i < level_2_options.length; level_2_i++) {
                        let group = level_2_options[level_2_i];

                        if (
                            parseInt(group.getAttribute('data-min-max')) ===
                            parseInt(el.getAttribute('data-min-max'))
                        ) {
                            //show group
                            addClassEl('active', group);

                            //select option
                            let option_els = group.getElementsByClassName('option');

                            removeElsClass(option_els, 'selected');

                            let min_selected = null;

                            //previously selected by user
                            for (let i = 0; i < option_els.length; i++) {
                                let option_el = option_els[i];

                                if (elHasClass(option_el, 'is_user')) {
                                    let min = parseInt(option_el.getAttribute('data-min'));
                                    min_selected = min;
                                    addClassEl('selected', option_el);
                                    //
                                    // if(min === befriend.activities.duration.selected) {
                                    //
                                    // }
                                }
                            }

                            if (!min_selected) {
                                //custom for group
                                if (level_1_i === 0) {
                                    for (let i = 0; i < option_els.length; i++) {
                                        let option_el = option_els[i];

                                        let min = parseInt(option_el.getAttribute('data-min'));

                                        if (min === 30) {
                                            addClassEl('selected', option_el);
                                            min_selected = min;
                                        }
                                    }
                                } else {
                                    min_selected = parseInt(option_els[0].getAttribute('data-min'));
                                    addClassEl('selected', option_els[0]);
                                }
                            }

                            befriend.activities.updateDuration(min_selected);
                        } else {
                            removeClassEl('active', group);
                        }
                    }
                });
            }

            //handle selection of duration
            for (let i = 0; i < all_duration_options.length; i++) {
                let el = all_duration_options[i];

                el.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    let group_options = el.closest('.options').getElementsByClassName('option');

                    removeElsClass(group_options, 'selected');
                    removeElsClass(group_options, 'is_user');

                    addClassEl('selected', el);
                    addClassEl('is_user', el);

                    let min = parseInt(el.getAttribute('data-min'));

                    befriend.activities.updateDuration(min);
                });
            }
        },
        travelTimeMode: function () {
            let els = befriend.els.travel_times.getElementsByClassName('mode');

            for (let i = 0; i < els.length; i++) {
                let mode_el = els[i];

                mode_el.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    //already selected
                    if(elHasClass(mode_el, 'active')) {
                        return false;
                    }

                    removeElsClass(els, 'active');

                    addClassEl('active', mode_el);

                    befriend.activities.travel.mode = mode_el.getAttribute('data-mode');

                    befriend.activities.updateWhenAuto();
                });
            }
        },
        hideCreateActivityMessage: function () {
            let message_el = document.getElementById('create-activity-top-message');
            let close_el = message_el.querySelector('.close');

            close_el.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();

                message_el.querySelector('.message').style.removeProperty('height');
                removeClassEl('show', message_el);
            });
        },
        level1: function () {
            return new Promise(async (resolve, reject) => {
                let els = befriend.els.activities.getElementsByClassName('level_1_activity');

                for (let i = 0; i < els.length; i++) {
                    let el = els[i];

                    el.addEventListener('click', function (e) {
                        e.preventDefault();
                        e.stopPropagation();

                        let parent_id = this.getAttribute('data-id');
                        let activity = befriend.activities.types.data[parent_id];

                        let level_2_el = this.closest('.level_1_row').nextSibling;

                        //remove activity selection and hide level 2 if same activity clicked
                        if (elHasClass(this, 'active')) {
                            removeClassEl('active', this);

                            hideLevel(level_2_el);

                            befriend.activities.selected.level_1 = null;
                            befriend.activities.selected.level_2 = null;
                            befriend.activities.selected.level_3 = null;

                            befriend.places.hidePlaces();

                            return;
                        } else {
                            //remove active from any previously selected activity
                            removeElsClass(els, 'active');
                            addClassEl('active', this);
                            befriend.activities.selected.level_1 = activity;
                            befriend.activities.selected.level_2 = null;
                            befriend.activities.selected.level_3 = null;
                        }

                        let prev_level_2 = befriend.els.activities.querySelector('.level_2.show');

                        //do not proceed if no sub categories
                        if (!activity.sub || !Object.keys(activity.sub).length) {
                            if (prev_level_2) {
                                hideLevel(prev_level_2);
                            }

                            return;
                        }

                        //hide other level 2s if different from this one
                        if (prev_level_2) {
                            if (prev_level_2 !== level_2_el) {
                                hideLevel(prev_level_2);
                                addClassEl('show', level_2_el);
                            }
                        } else {
                            addClassEl('show', level_2_el);
                        }

                        level_2_el.setAttribute('data-parent-id', parent_id);

                        let level_2_html = ``;

                        let activities_level_2 = [];

                        for (let level_2_id in activity.sub) {
                            if (
                                activities_level_2.length ===
                                befriend.variables.activity_level_2_row_items
                            ) {
                                let row_html = activities_level_2.join('');

                                level_2_html += `<div class="level_2_row">
                                            ${row_html}
                                        </div>`;

                                level_2_html += `<div class="level_3"></div>`;

                                activities_level_2.length = [];
                            }

                            let activity =
                                befriend.activities.types.data[parent_id].sub[level_2_id];

                            let image_html = '';

                            if (activity.image) {
                                image_html += `<div class="image">
                                        ${activity.image}
                                    </div>`;
                            } else if (activity.emoji) {
                                image_html += `<div class="emoji">
                                        ${activity.emoji}
                                    </div>`;
                            }

                            let icon_html = ``;

                            if (image_html) {
                                icon_html = `<div class="icon">${image_html}</div>`;
                            }

                            let no_icon_class = icon_html ? '' : 'no_icon';

                            activities_level_2.push(`
                            <div class="activity level_2_activity" data-id="${level_2_id}">
                                <div class="activity_wrapper ${no_icon_class}">
                                    ${icon_html}
                                    <div class="name">${activity.name}</div>
                                </div>
                            </div>`);
                        }

                        if (activities_level_2.length) {
                            let row_html = activities_level_2.join('');
                            level_2_html += `<div class="level_2_row">
                                            ${row_html}
                                        </div>`;
                            level_2_html += `<div class="level_3"></div>`;
                        }

                        level_2_el.innerHTML = `<div class="level_2_container">
                                                ${level_2_html}
                                            </div>`;

                        befriend.activities.updateLevelHeight(2);

                        befriend.activities.events.level2();
                    });
                }

                resolve();
            });
        },
        level2: function () {
            return new Promise(async (resolve, reject) => {
                let level_2_activity_els =
                    befriend.els.activities.getElementsByClassName('level_2_activity');

                for (let i = 0; i < level_2_activity_els.length; i++) {
                    let el = level_2_activity_els[i];

                    el.addEventListener('click', function (e) {
                        e.preventDefault();
                        e.stopPropagation();

                        let parent_id = this.closest('.level_2').getAttribute('data-parent-id');

                        let level_2_id = this.getAttribute('data-id');

                        let level_2_activity =
                            befriend.activities.types.data[parent_id].sub[level_2_id];

                        let level_3_el = this.closest('.level_2_row').nextSibling;

                        let closest_level_2_el = this.closest('.level_2');

                        let prev_height_level_2 =
                            closest_level_2_el.getAttribute('data-prev-height');

                        //remove activity selection and hide level 3 if same activity clicked
                        if (elHasClass(this, 'active')) {
                            removeClassEl('active', this);

                            hideLevel(level_3_el);

                            closest_level_2_el.style.height = prev_height_level_2;

                            befriend.activities.selected.level_2 = null;
                            befriend.activities.selected.level_3 = null;

                            return;
                        } else {
                            //remove active from any previously selected activity
                            removeElsClass(level_2_activity_els, 'active');
                            addClassEl('active', this);
                            befriend.activities.selected.level_2 = level_2_activity;
                            befriend.activities.selected.level_3 = null;

                            // only show places when there are no level 3 categories
                            if (
                                !level_2_activity.sub ||
                                !Object.keys(level_2_activity.sub).length
                            ) {
                                befriend.places.displayPlaces(befriend.activities.selected.level_2);

                                setTimeout(function () {
                                    removeClassEl('active', el);
                                }, befriend.variables.places_transition_ms);
                            }
                        }

                        let prev_level_3 = befriend.els.activities.querySelector('.level_3.show');

                        //do not proceed if no sub categories
                        if (!level_2_activity.sub || !Object.keys(level_2_activity.sub).length) {
                            if (prev_level_3) {
                                hideLevel(prev_level_3);
                            }

                            closest_level_2_el.style.height = prev_height_level_2;

                            return;
                        }

                        //hide other level 3s if different from this one
                        if (prev_level_3) {
                            if (prev_level_3 !== level_3_el) {
                                hideLevel(prev_level_3);
                                addClassEl('show', level_3_el);
                            }
                        } else {
                            addClassEl('show', level_3_el);
                        }

                        level_3_el.setAttribute('data-parent-id', parent_id);
                        level_3_el.setAttribute('data-level-2-id', level_2_id);

                        let level_3_html = ``;

                        let activities_level_3 = [];

                        for (let level_3_id in level_2_activity.sub) {
                            if (
                                activities_level_3.length ===
                                befriend.variables.activity_level_3_row_items
                            ) {
                                let row_html = activities_level_3.join('');

                                level_3_html += `<div class="level_3_row">
                                            ${row_html}
                                        </div>`;

                                activities_level_3.length = [];
                            }

                            let activity =
                                befriend.activities.types.data[parent_id].sub[level_2_id].sub[
                                    level_3_id
                                ];

                            let image_html = '';

                            if (activity.image) {
                                image_html += `<div class="image">
                                        ${activity.image}
                                    </div>`;
                            } else if (activity.emoji) {
                                image_html += `<div class="emoji">
                                        ${activity.emoji}
                                    </div>`;
                            }

                            let icon_html = ``;

                            if (image_html) {
                                icon_html = `<div class="icon">${image_html}</div>`;
                            }

                            let no_icon_class = icon_html ? '' : 'no_icon';

                            activities_level_3.push(`
                            <div class="activity level_3_activity" data-id="${level_3_id}">
                                <div class="activity_wrapper ${no_icon_class}">
                                    ${icon_html}
                                    <div class="name">${activity.name}</div>
                                </div>
                            </div>`);
                        }

                        if (activities_level_3.length) {
                            let row_html = activities_level_3.join('');
                            level_3_html += `<div class="level_3_row">
                                            ${row_html}
                                        </div>`;
                        }

                        level_3_el.innerHTML = `<div class="level_3_container">
                                                ${level_3_html}
                                            </div>`;

                        befriend.activities.updateLevelHeight(3);

                        requestAnimationFrame(function () {
                            befriend.activities.updateLevelHeight(2, true);
                        });

                        // let last_row = lastArrItem(level_3_el.getElementsByClassName("level_3_row"));
                        //
                        // last_row.style.marginBottom = "0px";
                        //
                        // let level_3_height = getElHeightHidden(level_3_el);
                        //
                        // level_3_el.style.height = `${level_3_height}px`;
                        //
                        // let total_level_2_height = parseFloat(prev_height_level_2) + level_3_height;
                        //
                        // closest_level_2_el.style.height = `${total_level_2_height}px`;

                        befriend.activities.events.level3();
                    });
                }

                resolve();
            });
        },
        level3: function () {
            return new Promise(async (resolve, reject) => {
                let level_3_activity_els =
                    befriend.els.activities.getElementsByClassName('level_3_activity');

                for (let i = 0; i < level_3_activity_els.length; i++) {
                    let el = level_3_activity_els[i];

                    el.addEventListener('click', function (e) {
                        e.preventDefault();
                        e.stopPropagation();

                        console.log('level 3 clicked');

                        let level_3_el = this.closest('.level_3');

                        let parent_id = level_3_el.getAttribute('data-parent-id');

                        let level_2_id = level_3_el.getAttribute('data-level-2-id');

                        let level_3_id = this.getAttribute('data-id');

                        let level_3_activity =
                            befriend.activities.types.data[parent_id].sub[level_2_id].sub[
                                level_3_id
                            ];

                        //remove activity selection and hide level 3 if same activity clicked
                        if (elHasClass(this, 'active')) {
                            removeClassEl('active', this);
                            befriend.activities.selected.level_3 = null;
                            // befriend.places.displayPlaces(befriend.activities.selected.level_2);
                        } else {
                            //remove active from any previously selected activity
                            removeElsClass(level_3_activity_els, 'active');
                            addClassEl('active', this);
                            befriend.activities.selected.level_3 = level_3_activity;

                            befriend.places.displayPlaces(befriend.activities.selected.level_3);

                            setTimeout(function () {
                                removeClassEl('active', el);
                            }, befriend.variables.places_transition_ms);
                        }
                    });
                }

                resolve();
            });
        },
    },
};
