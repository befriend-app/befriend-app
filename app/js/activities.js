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
    data: {
        draft: null,
        current: null,
        all: null,
    },
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
                num: '15 - 60',
                unit: 'minutes',
                options: [
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
                            num: 45,
                            unit: 'min',
                            minutes: 45,
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
    person: {
        mode: 'solo' // [solo, partner, kids]
    },
    travel: {
        mode: 'driving', // [driving, walking, bicycle]
        token: null,
        times: null,
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
                let r = await befriend.api.get('activity_types');

                befriend.activities.types.data = r.data;

                befriend.user.setLocal('activities.type', r.data);

                resolve();
            } catch (e) {
                console.error(e);

                //use prev activities data if error loading
                if (befriend.user.local.data && befriend.user.local.data.activities) {
                    console.log('Using local activity types data');
                    befriend.activities.types.data = befriend.user.local.data.activities.type;
                    return resolve();
                }

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

        befriend.activities.draft.update('duration', duration, true);

        //set duration in when string
        befriend.els.createActivity
            .querySelector('.when')
            .querySelector('.duration')
            .querySelector('.value').innerHTML = befriend.activities.getDurationStr();

        if (update_buttons) {
            let level_1 = befriend.els.createActivity.querySelector('.level_1');
            //remove all selected groups
            let buttons = befriend.els.activityDuration.getElementsByClassName('button');
            let options = befriend.els.activityDuration.getElementsByClassName('options');
            let option_els = befriend.els.activityDuration.getElementsByClassName('option');

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

                befriend.activities.travel.token = data.token;

                befriend.activities.draft.update('travel.token', data.token);

                befriend.activities.updateWhenAuto();

                for (let mode_name in data.modes) {
                    let mode = data.modes[mode_name];

                    let el = befriend.els.travelTimes.querySelector(`.mode.${mode_name}`);

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

        //set up activity draft, html, and transition logic
        befriend.html.createActivity();

        try {
            befriend.activities.getMatchCounts();
        } catch(e) {

        }

        let map_el = befriend.els.activityMap;
        let status_bar_height = await befriend.styles.getStatusBarHeight();

        //transform status bar
        befriend.styles.transformStatusBar(
            status_bar_height + 5,
            befriend.variables.hide_statusbar_ms / 1000,
        );

        //remove prev message
        //bottom error
        befriend.activities.toggleActivityError(false);

        //top error
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
            befriend.places.activity.toggleDisplayPlaces(false);
        }, befriend.variables.create_activity_transition_ms);
    },
    getCurrentActivityType: function () {
        let obj = befriend.activities.selected;

        return obj.level_3 || obj.level_2 || obj.level_1;
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
    updateLevelHeight: async function (level_num, skip_set_prev) {
        let level_el = befriend.els.activities.querySelector(`.level_${level_num}.show`);

        if (!level_el) {
            return;
        }

        let last_row = lastArrItem(level_el.getElementsByClassName(`level_${level_num}_row`));

        last_row.style.marginBottom = '0px';

        let level_height = await setElHeightDynamic(level_el, true);

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
        if (!befriend.activities.travel.times) {
            return null;
        }

        return befriend.activities.travel.times.modes[befriend.activities.travel.mode].total;
    },
    updateWhenAuto: async function () {
        const originalTimes = {
            driving: null,
            walking: null,
            bicycle: null,
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
                inner.innerHTML =
                    'Please update your activity location and/or schedule for a later time.';
                inner.style.backgroundColor = befriend.variables.color_red;
            }

            // Calculate height of message
            setElHeightDynamic(message_el.querySelector('.message'));

            befriend.styles.createActivity.updateCloseMessagePosition();

            addClassEl('show', message_el);
        }

        function restoreOriginalTime(mode) {
            if (originalTimes[mode]) {
                when_el.querySelector('.time').innerHTML = originalTimes[mode].whenStr;

                for (let i = 0; i < befriend.when.options.length; i++) {
                    let option = befriend.when.options[i];

                    if (option.id === befriend.when.selected.createActivity.id) {
                        befriend.when.selectOptionIndex(i);
                        break;
                    }
                }

                if (befriend.when.selected.createActivity.time) {
                    befriend.when.selected.createActivity.time.formatted =
                        originalTimes[mode].whenStr;
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

            if (befriend.when.selected.createActivity.is_schedule) {
                when_str = 'Schedule';
            } else {
                when_str = befriend.when.selected.createActivity.time.formatted;
            }

            originalTimes[currentMode] = {
                mins: mins_to,
                whenStr: when_str,
            };
        }

        let when_el = befriend.els.createActivity.querySelector('.when');
        let message_el = document.getElementById('create-activity-top-message');

        // Check if update is needed
        if (when.is_schedule) {
            // Handle scheduled times if needed
        } else {
            if (mins_to > when.in_mins + befriend.when.thresholds.future) {
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

                if (option.in_mins && mins_to < option.in_mins) {
                    // Auto select when button
                    befriend.when.selectOptionIndex(i);

                    // Store new when string
                    new_when_str = befriend.when.selected.main.time.formatted;

                    // Update original time for current mode
                    originalTimes[currentMode] = {
                        mins: mins_to,
                        whenStr: new_when_str,
                    };

                    break;
                }
            }

            updateMessage(new_when_str);
        }
    },
    getFilterList: function () {
        let filters = befriend.filters.data.filters;

        let html = '';

        let networks_html = '';
        let networkFilter = filters.networks;

        if(networkFilter?.is_active && networkFilter.is_send) {
            let selectedName = '';

            if (networkFilter.is_any_network) {
                selectedName = 'Any Network';
            } else if(networkFilter.is_all_verified) {
                selectedName = 'Any Verified Network';
            } else if (networkFilter.items) {
                const activeNetworks = Object.values(networkFilter.items).filter(
                    (item) => item.is_active && !item.deleted,
                );

                selectedName = `${activeNetworks.length} Network${activeNetworks.length > 1 ? 's' : ''}`;
            }

            networks_html = `<div class="filter networks">
                                <div class="filter-name">Networks</div>
                                <div class="filter-value">${selectedName}</div>
                            </div>`;

            html += networks_html;
        }

        let reviews_html = '';
        let reviewsFilter = filters.reviews;

        if(reviewsFilter.is_active && reviewsFilter.is_send) {
            let review_items = [];

            if(!filters.reviews_new || filters.reviews_new.is_active && filters.reviews_new.is_send) {
                review_items.push(`Match with new members`);
            }

            for(let k in befriend.filters.reviews.ratings) {
                let d = befriend.filters.reviews.ratings[k];

                let filter = filters[d.token];

                if(filter?.is_active) {
                    if(typeof filter.is_send === 'undefined' || filter.is_send) {
                        review_items.push(`${d.name} <span class="review-rating">${d.current_rating}</span>`);
                    }
                }
            }

            if(review_items.length) {
                let items = review_items.map(item => `<div class="item review-item">${item}</div>`).join('\n');

                reviews_html = `<div class="filter reviews">
                                    <div class="filter-name">Reviews</div>
                                    <div class="filter-value">${items}</div>
                                </div>`;

                html += reviews_html;
            }
        }

        let verifications_html = '';
        let verificationsFilter = filters.verifications;

        if (verificationsFilter.is_active) {
            let filter_items = [];

            const inPersonFilter = filters.verification_in_person;

            if (inPersonFilter?.is_active) {
                if(typeof inPersonFilter.is_send === 'undefined' || inPersonFilter.is_send) {
                    filter_items.push('In-Person');
                }
            }

            const linkedinFilter = filters.verification_linkedin;

            if (linkedinFilter?.is_active) {
                if(typeof linkedinFilter.is_send === 'undefined' || linkedinFilter.is_send) {
                    filter_items.push('LinkedIn');
                }
            }

            if (filter_items.length) {
                let items = filter_items.map(item => `<div class="item">${item}</div>`).join('\n');

                verifications_html = `<div class="filter verifications">
                                <div class="filter-name">Verifications</div>
                                <div class="filter-value">${items}</div>
                            </div>`;

                html += verifications_html;
            }
        }

        let distance_html = '';
        let distanceFilter = filters.distance;

        if(distanceFilter.is_active && distanceFilter.is_send) {
            distance_html = `<div class="filter distance">
                                <div class="filter-name">Distance <span class="small">(max)</span></div>
                                <div class="filter-value">${befriend.filters.distance.current} ${befriend.filters.distance.unit}</div>
                            </div>`;

            html += distance_html;
        }

        let ages_html = '';
        let agesFilter = filters.ages;

        if (agesFilter?.is_active && agesFilter.is_send) {
            let ageRange = `${befriend.filters.age.current.min} - ${befriend.filters.age.current.max}`;

            if(befriend.filters.age.current.max === befriend.filters.age.max) {
                ageRange += '+';
            }

            ages_html = `<div class="filter ages">
                            <div class="filter-name">Age</div>
                            <div class="filter-value">${ageRange}</div>
                        </div>`;

            html += ages_html;
        }

        // Gender filter section
        let genders_html = '';
        let gendersFilter = filters.genders;

        if (gendersFilter?.is_active && gendersFilter.is_send) {
            let selectedGenders = [];

            if (gendersFilter?.items) {
                const activeGenders = Object.values(gendersFilter.items).filter(
                    item => !item.is_negative && item.is_active
                );

                for (let gender of activeGenders) {
                    const genderData = befriend.me.data.genders.find(g => g.id === gender.gender_id);
                    if (genderData) {
                        selectedGenders.push(genderData.name);
                    }
                }
            } else {
                selectedGenders.push('Any');
            }

            // Create display string
            let genderDisplay = selectedGenders.length > 0 ? selectedGenders.join(', ') : 'Any';

            genders_html = `<div class="filter genders">
                            <div class="filter-name">Gender</div>
                            <div class="filter-value">${genderDisplay}</div>
                        </div>`;

            html += genders_html;
        }

        let movies_html = '';
        let moviesFilter = filters.movies;

        if (moviesFilter?.is_active && moviesFilter.is_send) {
            let selectedMovies = [];

            if (moviesFilter?.items) {
                const activeMovies = Object.values(moviesFilter.items).filter(
                    item => item.is_active && !item.deleted
                );

                if (activeMovies.length > 0) {
                    selectedMovies = activeMovies.map(movie => ({
                        name: movie.name,
                        importance: movie.importance || befriend.filters.sections.movies.importance.default
                    }));
                }
            }

            let moviesDisplay = selectedMovies.length > 0
                ? `${selectedMovies.length} Movie${selectedMovies.length > 1 ? 's' : ''}`
                : 'Any';

            movies_html = `<div class="filter movies with-importance">
                            <div class="filter-name">Movies</div>
                            <div class="filter-value">
                                ${selectedMovies.length > 0
                ? selectedMovies.map(movie => `<div class="item">
                                                    <div class="name">${movie.name}</div>
                                                    <div class="importance">${movie.importance}</div>

                                                  </div>`).join('\n')
                : moviesDisplay}
                            </div>
                        </div>`;

            html += movies_html;
        }

        let tv_shows_html = '';
        let tvShowsFilter = filters.tv_shows;

        if (tvShowsFilter?.is_active && tvShowsFilter.is_send) {
            let selectedShows = [];

            if (tvShowsFilter?.items) {
                const activeShows = Object.values(tvShowsFilter.items).filter(
                    item => item.is_active && !item.deleted
                );

                if (activeShows.length > 0) {
                    selectedShows = activeShows.map(show => ({
                        name: show.name,
                        importance: show.importance || befriend.filters.sections.tv_shows.importance.default
                    }));
                }
            }

            let showsDisplay = selectedShows.length > 0
                ? `${selectedShows.length} TV Show${selectedShows.length > 1 ? 's' : ''}`
                : 'Any';

            tv_shows_html = `<div class="filter tv-shows with-importance">
                            <div class="filter-name">TV Shows</div>
                            <div class="filter-value">
                                ${selectedShows.length > 0
                ? selectedShows.map(show => `<div class="item">
                                                    <div class="name">${show.name}</div>
                                                    <div class="importance">${show.importance}</div>
                                                  </div>`).join('\n')
                : showsDisplay}
                            </div>
                        </div>`;

            html += tv_shows_html;
        }

        let sports_html = '';
        let sportsFilter = filters.sports;

        if (sportsFilter?.is_active && sportsFilter.is_send) {
            let sportsByType = {
                teams: [],
                leagues: [],
                play: []
            };

            if (sportsFilter?.items) {
                const activeSports = Object.values(sportsFilter.items).filter(
                    item => item.is_active && !item.deleted
                );

                // Sort sports into their respective categories
                for(let sport of activeSports) {
                    if (sport.table_key && sportsByType[sport.table_key]) {
                        sportsByType[sport.table_key].push({
                            name: sport.name,
                            importance: sport.importance || befriend.filters.sections.sports.importance.default
                        });
                    }
                }
            }

            const totalSports = Object.values(sportsByType).reduce(
                (total, sports) => total + sports.length, 0
            );

            let sportsDisplay = totalSports > 0
                ? `${totalSports} Sport${totalSports > 1 ? 's' : ''}`
                : 'Any';

            let categoriesHtml = '';
            
            const categories = [
                { key: 'teams', name: 'Teams' },
                { key: 'leagues', name: 'Leagues' },
                { key: 'play', name: 'Play' }
            ];

            for(let category of categories) {
                const sports = sportsByType[category.key];

                if (sports.length > 0) {
                    categoriesHtml += `
                            <div class="category">
                                <div class="category-name">${category.name}</div>
                                ${sports.map(sport => `
                                    <div class="item">
                                        <div class="name">${sport.name}</div>
                                        <div class="importance">${sport.importance}</div>
                                    </div>
                                `).join('\n')}
                            </div>
                        `;
                }
            }

            sports_html = `<div class="filter sports with-importance">
                            <div class="filter-name">Sports</div>
                            <div class="filter-value">
                                ${totalSports > 0 ? categoriesHtml : sportsDisplay}
                            </div>
                        </div>`;

            html += sports_html;
        }

        let music_html = '';
        let musicFilter = filters.music;

        if (musicFilter?.is_active && musicFilter.is_send) {
            let musicByType = {
                genres: [],
                artists: []
            };

            if (musicFilter?.items) {
                const activeMusic = Object.values(musicFilter.items).filter(
                    item => item.is_active && !item.deleted
                );

                // Sort music into their respective categories
                for(let item of activeMusic) {
                    if (item.table_key && musicByType[item.table_key]) {
                        musicByType[item.table_key].push({
                            name: item.name,
                            importance: item.importance || befriend.filters.sections.music.importance.default
                        });
                    }
                }
            }

            const totalMusic = Object.values(musicByType).reduce(
                (total, music) => total + music.length, 0
            );

            let musicDisplay = totalMusic === 0 ? 'Any' : '';

            let categoriesHtml = '';

            const categories = [
                { key: 'genres', name: 'Genres' },
                { key: 'artists', name: 'Artists' },
            ];

            for(let category of categories) {
                const music = musicByType[category.key];

                if (music.length > 0) {
                    categoriesHtml += `
                            <div class="category">
                                <div class="category-name">${category.name}</div>
                                ${music.map(item => `
                                    <div class="item">
                                        <div class="name">${item.name}</div>
                                        <div class="importance">${item.importance}</div>
                                    </div>
                                `).join('\n')}
                            </div>
                        `;
                }
            }

            music_html = `<div class="filter music with-importance">
                            <div class="filter-name">Music</div>
                            <div class="filter-value">
                                ${totalMusic > 0 ? categoriesHtml : musicDisplay}
                            </div>
                        </div>`;

            html += music_html;
        }

        let instruments_html = '';
        let instrumentsFilter = filters.instruments;

        if (instrumentsFilter?.is_active && instrumentsFilter.is_send) {
            let selectedInstruments = [];

            if (instrumentsFilter?.items) {
                const activeInstruments = Object.values(instrumentsFilter.items).filter(
                    item => item.is_active && !item.deleted
                );

                if (activeInstruments.length > 0) {
                    selectedInstruments = activeInstruments.map(instrument => ({
                        name: instrument.name,
                        importance: instrument.importance || befriend.filters.sections.instruments.importance.default
                    }));
                }
            }

            let instrumentsDisplay = selectedInstruments.length === 0 ? 'Any' : '';

            instruments_html = `<div class="filter instruments with-importance">
                        <div class="filter-name">Instruments</div>
                        <div class="filter-value">
                            ${selectedInstruments.length > 0
                ? selectedInstruments.map(instrument => `<div class="item">
                                                    <div class="name">${instrument.name}</div>
                                                    <div class="importance">${instrument.importance}</div>
                                                  </div>`).join('\n')
                : instrumentsDisplay}
                        </div>
                    </div>`;

            html += instruments_html;
        }

        let schools_html = '';
        let schoolsFilter = filters.schools;

        if (schoolsFilter?.is_active && schoolsFilter.is_send) {
            let selectedSchools = [];

            if (schoolsFilter?.items) {
                const activeSchools = Object.values(schoolsFilter.items).filter(
                    item => item.is_active && !item.deleted
                );

                if (activeSchools.length > 0) {
                    selectedSchools = activeSchools.map(school => ({
                        name: school.name,
                        importance: school.importance || befriend.filters.sections.schools.importance.default
                    }));
                }
            }

            let schoolsDisplay = selectedSchools.length === 0 ? 'Any' : '';

            schools_html = `<div class="filter schools with-importance">
                        <div class="filter-name">Schools</div>
                        <div class="filter-value">
                            ${selectedSchools.length > 0
                ? selectedSchools.map(school => `<div class="item">
                                                    <div class="name">${school.name}</div>
                                                    <div class="importance">${school.importance}</div>
                                                  </div>`).join('\n')
                : schoolsDisplay}
                        </div>
                    </div>`;

            html += schools_html;
        }

        let work_html = '';
        let workFilter = filters.work;

        if (workFilter?.is_active && workFilter.is_send) {
            let workByType = {
                industries: [],
                roles: []
            };

            if (workFilter?.items) {
                const activeWork = Object.values(workFilter.items).filter(
                    item => item.is_active && !item.deleted
                );

                // Sort work into their respective categories
                for(let item of activeWork) {
                    if (item.table_key && workByType[item.table_key]) {
                        workByType[item.table_key].push({
                            name: item.name,
                            importance: item.importance || befriend.filters.sections.work.importance.default
                        });
                    }
                }
            }

            const totalWork = Object.values(workByType).reduce(
                (total, work) => total + work.length, 0
            );

            let workDisplay = totalWork === 0 ? 'Any' : '';

            work_html = `<div class="filter work with-importance">
                    <div class="filter-name">Work</div>
                    <div class="filter-value">
                        ${totalWork > 0 ? `
                            ${Object.entries(workByType).map(([key, items]) =>
                    items.length > 0 ? `
                                    <div class="category">
                                        <div class="category-name">${key.charAt(0).toUpperCase() + key.slice(1)}</div>
                                        ${items.map(item => `
                                            <div class="item">
                                                <div class="name">${item.name}</div>
                                                <div class="importance">${item.importance}</div>
                                            </div>
                                        `).join('\n')}
                                    </div>
                                ` : ''
                ).join('\n')}`
                : workDisplay}
                    </div>
                </div>`;

            html += work_html;
        }

        let life_stages_html = '';
        let lifeStagesFilter = filters.life_stages;

        if (lifeStagesFilter?.is_active && lifeStagesFilter.is_send) {
            let selectedStages = [];

            if (lifeStagesFilter?.items) {
                const activeStages = Object.values(lifeStagesFilter.items).filter(
                    item => item.is_active && !item.is_negative && !item.deleted
                );

                if (activeStages.length > 0) {
                    selectedStages = activeStages.map(stage => ({
                        name: stage.name,
                        importance: stage.importance || befriend.filters.sections.life_stages.importance.default
                    }));
                }
            }

            let stagesDisplay = selectedStages.length === 0 ? 'Any' : '';

            life_stages_html = `<div class="filter life-stages with-importance">
                            <div class="filter-name">Life Stage</div>
                            <div class="filter-value">
                                ${selectedStages.length > 0
                ? selectedStages.map(stage => `<div class="item">
                                                        <div class="name">${stage.name}</div>
                                                        <div class="importance">${stage.importance}</div>
                                                      </div>`).join('\n')
                : stagesDisplay}
                            </div>
                        </div>`;

            html += life_stages_html;
        }

        let relationship_status_html = '';
        let relationshipStatusFilter = filters.relationship_status;

        if (relationshipStatusFilter?.is_active && relationshipStatusFilter.is_send) {
            let selectedStatuses = [];

            if (relationshipStatusFilter?.items) {
                const activeStatuses = Object.values(relationshipStatusFilter.items).filter(
                    item => item.is_active && !item.is_negative && !item.deleted
                );

                if (activeStatuses.length > 0) {
                    selectedStatuses = activeStatuses.map(status => ({
                        name: status.name,
                        importance: status.importance || befriend.filters.sections.relationship_status.importance.default
                    }));
                }
            }

            let statusDisplay = selectedStatuses.length === 0 ? 'Any' : '';

            relationship_status_html = `<div class="filter relationship-status with-importance">
                            <div class="filter-name">Relationship Status</div>
                            <div class="filter-value">
                                ${selectedStatuses.length > 0
                ? selectedStatuses.map(status => `<div class="item">
                                                        <div class="name">${status.name}</div>
                                                        <div class="importance">${status.importance}</div>
                                                      </div>`).join('\n')
                : statusDisplay}
                            </div>
                        </div>`;

            html += relationship_status_html;
        }

        let languages_html = '';
        let languagesFilter = filters.languages;

        if (languagesFilter?.is_active && languagesFilter.is_send) {
            let selectedLanguages = [];

            if (languagesFilter?.items) {
                const activeLanguages = Object.values(languagesFilter.items).filter(
                    item => item.is_active && !item.deleted
                );

                if (activeLanguages.length > 0) {
                    selectedLanguages = activeLanguages.map(language => ({
                        name: language.name,
                        importance: language.importance || befriend.filters.sections.languages.importance.default
                    }));
                }
            }

            let languagesDisplay = selectedLanguages.length === 0 ? 'Any' : '';

            languages_html = `<div class="filter languages with-importance">
                            <div class="filter-name">Languages</div>
                            <div class="filter-value">
                                ${selectedLanguages.length > 0
                ? selectedLanguages.map(language => `<div class="item">
                                                        <div class="name">${language.name}</div>
                                                        <div class="importance">${language.importance}</div>
                                                      </div>`).join('\n')
                : languagesDisplay}
                            </div>
                        </div>`;

            html += languages_html;
        }

        let politics_html = '';
        let politicsFilter = filters.politics;

        if (politicsFilter?.is_active && politicsFilter.is_send) {
            let selectedPolitics = [];

            if (politicsFilter?.items) {
                const activePolitics = Object.values(politicsFilter.items).filter(
                    item => item.is_active && !item.is_negative && !item.deleted
                );

                if (activePolitics.length > 0) {
                    selectedPolitics = activePolitics.map(politics => ({
                        name: politics.name,
                        importance: politics.importance || befriend.filters.sections.politics.importance.default
                    }));
                }
            }

            let politicsDisplay = selectedPolitics.length === 0 ? 'Any' : '';

            politics_html = `<div class="filter politics with-importance">
                            <div class="filter-name">Politics</div>
                            <div class="filter-value">
                                ${selectedPolitics.length > 0
                ? selectedPolitics.map(politics => `<div class="item">
                                                        <div class="name">${politics.name}</div>
                                                        <div class="importance">${politics.importance}</div>
                                                      </div>`).join('\n')
                : politicsDisplay}
                            </div>
                        </div>`;

            html += politics_html;
        }

        let religion_html = '';
        let religionFilter = filters.religion;

        if (religionFilter?.is_active && religionFilter.is_send) {
            let selectedReligions = [];

            if (religionFilter?.items) {
                const activeReligions = Object.values(religionFilter.items).filter(
                    item => item.is_active && !item.is_negative && !item.deleted
                );

                if (activeReligions.length > 0) {
                    selectedReligions = activeReligions.map(religion => ({
                        name: religion.name,
                        importance: religion.importance || befriend.filters.sections.religion.importance.default
                    }));
                }
            }

            let religionDisplay = selectedReligions.length === 0 ? 'Any' : '';

            religion_html = `<div class="filter religion with-importance">
                            <div class="filter-name">Religion</div>
                            <div class="filter-value">
                                ${selectedReligions.length > 0
                ? selectedReligions.map(religion => `<div class="item">
                                                        <div class="name">${religion.name}</div>
                                                        <div class="importance">${religion.importance}</div>
                                                      </div>`).join('\n')
                : religionDisplay}
                            </div>
                        </div>`;

            html += religion_html;
        }

        let drinking_html = '';
        let drinkingFilter = filters.drinking;

        if (drinkingFilter?.is_active && drinkingFilter.is_send) {
            let selectedDrinking = [];

            if (drinkingFilter?.items) {
                const activeDrinking = Object.values(drinkingFilter.items).filter(
                    item => item.is_active && !item.is_negative && !item.deleted
                );

                if (activeDrinking.length > 0) {
                    selectedDrinking = activeDrinking.map(drinking => ({
                        name: drinking.name,
                        importance: drinking.importance || befriend.filters.sections.drinking.importance.default
                    }));
                }
            }

            let drinkingDisplay = selectedDrinking.length === 0 ? 'Any' : '';

            drinking_html = `<div class="filter drinking with-importance">
                            <div class="filter-name">Drinking</div>
                            <div class="filter-value">
                                ${selectedDrinking.length > 0
                ? selectedDrinking.map(drinking => `<div class="item">
                                                        <div class="name">${drinking.name}</div>
                                                        <div class="importance">${drinking.importance}</div>
                                                      </div>`).join('\n')
                : drinkingDisplay}
                            </div>
                        </div>`;

            html += drinking_html;
        }

        let smoking_html = '';
        let smokingFilter = filters.smoking;

        if (smokingFilter?.is_active && smokingFilter.is_send) {
            let selectedSmoking = [];

            if (smokingFilter?.items) {
                const activeSmoking = Object.values(smokingFilter.items).filter(
                    item => item.is_active && !item.is_negative && !item.deleted
                );

                if (activeSmoking.length > 0) {
                    selectedSmoking = activeSmoking.map(smoking => ({
                        name: smoking.name,
                        importance: smoking.importance || befriend.filters.sections.smoking.importance.default
                    }));
                }
            }

            let smokingDisplay = selectedSmoking.length === 0 ? 'Any' : '';

            smoking_html = `<div class="filter smoking with-importance">
                            <div class="filter-name">Smoking</div>
                            <div class="filter-value">
                                ${selectedSmoking.length > 0
                ? selectedSmoking.map(smoking => `<div class="item">
                                                        <div class="name">${smoking.name}</div>
                                                        <div class="importance">${smoking.importance}</div>
                                                      </div>`).join('\n')
                : smokingDisplay}
                            </div>
                        </div>`;

            html += smoking_html;
        }

        return html;
    },
    toggleSpinner: function (show) {
        if (show) {
            addClassEl('show', befriend.els.createActivitySpinner);
        } else {
            removeClassEl('show', befriend.els.createActivitySpinner);
        }
    },
    getMatchCounts: function () {
        return new Promise(async (resolve, reject) => {
            let matches_el = befriend.els.createActivity.querySelector('.matches-overview');
            let update_circle_el = matches_el.querySelector('.update-circle');
            let send_el = matches_el.querySelector('.send');
            let interests_el = matches_el.querySelector('.interests');

            let ts = timeNow();

            addClassEl('show', update_circle_el);

            try {
                let draft = befriend.activities.data.draft;

                let response = await befriend.auth.get('/activities/matches', {
                    activity: {
                        person: draft.person,
                        duration: draft.duration,
                        place: draft.place,
                        when: draft.when,
                    }
                });

                if(response.data?.counts) {
                    send_el.querySelector('.count').innerHTML = formattedNumberDisplay(response.data.counts.send);
                    interests_el.querySelector('.count').innerHTML = `
                                                                                <div class="ultra category">
                                                                                    <div class="name">Ultra</div>
                                                                                    <div class="number">${formattedNumberDisplay(response.data.counts.interests.ultra)}</div>
                                                                                </div>
                                                                                
                                                                                <div class="super category">
                                                                                     <div class="name">Super</div>
                                                                                     <div class="number">${formattedNumberDisplay(response.data.counts.interests.super)}</div>
                                                                                </div>
                                                                            `;
                }
            } catch(e) {
                console.error(e);
            }

            //show animation for a given duration
            let transition_duration = 2000;

            let td = timeNow() - ts;

            setTimeout(function () {
                removeClassEl('show', update_circle_el);
            }, Math.max(transition_duration - td, 0));
        });
    },
    toggleActivityError: function (show, message) {
        let error_message = document.getElementById('create-activity-error');

        if(show) {
            error_message.innerHTML = message;

            addClassEl('error', error_message);
        } else {
            removeClassEl('error', error_message);
        }
    },
    draft: {
        create: function (data) {
            befriend.activities.data.draft = data;
        },
        update: function (key, value, update_counts) {
            if (!key) {
                return false;
            }

            let draft = befriend.activities.data.draft;

            if (!draft) {
                return false;
            }

            setNestedValue(draft, key, value);

            if(befriend.activities.isCreateActivityShown() && update_counts) {
                befriend.activities.getMatchCounts();
            }
        },
    },
    events: {
        init: function () {
            return new Promise(async (resolve, reject) => {
                try {
                    befriend.activities.events.level1();
                    befriend.activities.events.activityDuration();
                    befriend.activities.events.travelTimeMode();
                    befriend.activities.events.hideCreateActivityMessage();
                    befriend.activities.events.onCreateActivityBack();
                    befriend.activities.events.createActivity();
                    befriend.activities.events.onEditFilters();
                } catch (e) {
                    console.error(e);
                }

                resolve();
            });
        },
        createActivity: function () {
            befriend.els.createActivityBtn.addEventListener('click', async function (e) {
                if(this._ip) {
                    return false;
                }

                this._ip = true;

                e.preventDefault();
                e.stopPropagation();

                try {
                    befriend.activities.toggleActivityError(false);

                    befriend.activities.toggleSpinner(true);

                    let r = await befriend.auth.post('/activities', {
                        activity: befriend.activities.data.draft,
                    });

                    console.log(r);
                } catch (e) {
                    let error = e.response?.data?.error;

                    if(error?.length) {
                        befriend.activities.toggleActivityError(true, error.join(', ') + '.');
                    }
                }

                this._ip = false;

                befriend.activities.toggleSpinner(false);
            });
        },
        onCreateActivityBack: function () {
            let back_el = document.getElementById('create-activity-back');

            back_el.addEventListener('click', async function (e) {
                e.preventDefault();
                e.stopPropagation();

                back_el.style.display = 'none';

                befriend.els.travelTimes.style.display = 'none';

                befriend.styles.transformStatusBar(
                    0,
                    befriend.variables.create_activity_transition_ms / 1000,
                );

                let map_to_box = document
                    .getElementById('activities-map-wrapper')
                    .getBoundingClientRect();

                let map_el = befriend.els.activityMap;

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
                befriend.els.travelTimes.style.removeProperty('display');
            });
        },
        onEditFilters: function () {
            let el = befriend.els.createActivity.querySelector('.filters').querySelector('.edit');

            el.addEventListener('click', async function (e) {
                e.preventDefault();
                e.stopPropagation();

                fireClick(document.getElementById('create-activity-back'));
                fireTouch(befriend.els.footer.querySelector('.nav-item.filters'));

                befriend.maps.needsResize = true;
            });
        },
        activityDuration: function () {
            let level_1_el = befriend.els.activityDuration.querySelector('.level_1');
            let level_1_els = level_1_el.getElementsByClassName('button');
            let level_2_el = befriend.els.activityDuration.querySelector('.level_2');
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
            let els = befriend.els.travelTimes.getElementsByClassName('mode');

            for (let i = 0; i < els.length; i++) {
                let mode_el = els[i];

                mode_el.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    //already selected
                    if (elHasClass(mode_el, 'active')) {
                        return false;
                    }

                    removeElsClass(els, 'active');

                    addClassEl('active', mode_el);

                    befriend.activities.travel.mode = mode_el.getAttribute('data-mode');

                    befriend.activities.draft.update(
                        'travel.mode',
                        befriend.activities.travel.mode
                    );

                    befriend.activities.updateWhenAuto();
                });
            }
        },
        appMode: function () {
            let els = befriend.els.createActivity.querySelector('.modes').getElementsByClassName('mode-option');

            for (let i = 0; i < els.length; i++) {
                let mode_el = els[i];

                mode_el.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    //already selected
                    if (elHasClass(mode_el, 'active')) {
                        return false;
                    }

                    removeElsClass(els, 'active');

                    addClassEl('active', mode_el);

                    befriend.activities.person.mode = mode_el.getAttribute('data-mode');

                    befriend.activities.draft.update(
                        'person.mode',
                        befriend.activities.person.mode,
                        true
                    );
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

                        befriend.places.activity.hidePlaces();

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

                        let activity = befriend.activities.types.data[parent_id].sub[level_2_id];

                        let image_html = '';

                        if (activity.image) {
                            image_html += `<div class="image">
                                        ${activity.image}
                                    </div>`;
                        } else if (activity.emoji) {
                            // image_html += `<div class="emoji">
                            //             ${activity.emoji}
                            //         </div>`;
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
        },
        level2: function () {
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

                    let prev_height_level_2 = closest_level_2_el.getAttribute('data-prev-height');

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
                        if (!level_2_activity.sub || !Object.keys(level_2_activity.sub).length) {
                            befriend.places.activity.displayPlaces(befriend.activities.selected.level_2);

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
                            // image_html += `<div class="emoji">
                            //             ${activity.emoji}
                            //         </div>`;
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
        },
        level3: function () {
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
                        befriend.activities.types.data[parent_id].sub[level_2_id].sub[level_3_id];

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

                        befriend.places.activity.displayPlaces(befriend.activities.selected.level_3);

                        setTimeout(function () {
                            removeClassEl('active', el);
                        }, befriend.variables.places_transition_ms);
                    }
                });
            }
        },
    },
};
