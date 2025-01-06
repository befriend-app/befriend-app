befriend.places = {
    selected: {
        place: null,
        is_activity_type: false,
    },
    search: {
        autoComplete: {
            session_token: null,
            items: [],
            obj: {},
            minChars: 2,
        },
        setAutoComplete: function (places, skip_dropdown) {
            befriend.places.search.setAutoCompleteData(places);
            befriend.places.search.autoCompleteSuggestions(places, skip_dropdown);
        },
        autoCompleteSuggestions: function (places, skip_dropdown) {
            let suggestions_el = befriend.els.activities
                .querySelector('.place-search-suggestions')
                .querySelector('.container');

            let html = '';

            for (let place of places) {
                let place_html = {
                    name: ``,
                    distance: ``,
                    location: ``,
                    full: ``,
                };

                //name
                if (place.name) {
                    place_html.name = `<div class="name">${place.name}</div>`;
                }

                place_html.location = befriend.places.getPlaceLocation(place);

                //distance
                let distance_html = '';

                if (place.distance) {
                    distance_html = place.distance.miles_km.toFixed(1);

                    if (place.distance.miles_km < 1) {
                        //hide trailing zero if less than 1 m/km
                        distance_html = parseFloat(place.distance.miles_km.toFixed(1));
                    }

                    if (parseFloat(distance_html) % 1 === 0) {
                        //add decimal if rounded exactly to integer
                        distance_html = parseFloat(distance_html).toFixed(1);
                    }

                    if (place.distance.use_km) {
                        //km
                        if (place.distance.miles_km < 0.1) {
                            //meters
                            distance_html = place.distance.meters;
                            distance_html += ' meters';
                        } else {
                            distance_html += ' km';
                        }
                    } else {
                        //miles
                        if (place.distance.miles_km < 0.1) {
                            //feet
                            distance_html = metersToFeet(place.distance.meters);
                            distance_html += ' ft';
                        } else {
                            distance_html += ' m';
                        }
                    }

                    place_html.distance = `<div class="distance">${distance_html}</div>`;
                }

                place_html.full = `
                    <div class="left-col">
                          ${place_html.distance}
                          ${place_html.name}
                         
                         <div class="location">
                             <div class="location-address">
                                ${place_html.location}
                             </div>
                         </div>
                    </div>
                                    
                    <div class="right-col">
                        <div class="button">Select</div>
                    </div>`;

                let id = place.fsq_place_id || place.fsq_address_id || '';

                let is_address = place.fsq_address_id ? 'is_address' : '';

                html += `<div class="place ${is_address}" data-place-id="${id}">${place_html.full}</div>`;
            }

            suggestions_el.innerHTML = html;

            if (!skip_dropdown) {
                befriend.places.search.toggleAutoComplete(true);
            }

            befriend.places.events.handleSelectPlace(suggestions_el.getElementsByClassName('place'));
        },
        toggleAutoComplete: function (show) {
            if (show) {
                addClassEl(befriend.classes.placesSuggestShown, befriend.els.placeSearch);
            } else {
                removeClassEl(befriend.classes.placesSuggestShown, befriend.els.placeSearch);
            }
        },
        getAutoCompleteSessionToken: function () {
            if (befriend.places.search.autoComplete.session_token) {
                return befriend.places.search.autoComplete.session_token;
            }

            let token = generateToken(32);

            befriend.places.search.autoComplete.session_token = token;

            setTimeout(function () {
                befriend.places.search.autoComplete.session_token = null;
            }, 60 * 1000);

            return token;
        },
        setAutoCompleteData: function (places) {
            if (!places) {
                return;
            }

            //reset data
            befriend.places.search.autoComplete.items = [];
            befriend.places.search.autoComplete.obj = {};

            for (let place of places) {
                let id = place.fsq_place_id || place.fsq_address_id || null;

                befriend.places.search.autoComplete.items.push(place);
                befriend.places.search.autoComplete.obj[id] = place;
            }
        },
        setPreviousAutoComplete: function () {
            let search_input_el = befriend.els.activities.querySelector('.input-search-place');

            let search_value = search_input_el.value;

            if (search_value < befriend.places.search.autoComplete.minChars) {
                befriend.places.search.setAutoComplete([], true);
            } else {
                try {
                    befriend.places.search.searchPlace(search_value, true);
                } catch (e) {}
            }
        },
        searchPlace: function (search_str, skip_dropdown) {
            return new Promise(async (resolve, reject) => {
                search_str = search_str ? search_str.trim() : '';

                if (search_str.length < befriend.places.search.autoComplete.minChars) {
                    befriend.places.search.toggleAutoComplete(false);
                    return resolve();
                }

                try {
                    let session_token = befriend.places.search.getAutoCompleteSessionToken();

                    let params = {
                        session_token: session_token,
                        search: search_str,
                        location: {
                            map: befriend.location.getMarkerCoords(),
                            device: befriend.location.getDeviceCoordsIfCurrent(),
                        },
                        friends: {
                            type: befriend.friends.type,
                        },
                    };

                    const r = await befriend.api.post('autocomplete/places', params);

                    befriend.places.search.setAutoComplete(r.data.places, skip_dropdown);
                } catch (error) {
                    console.error('Search error:', error);
                }

                resolve();
            });
        },
        isAutoCompleteShown: function () {
            return elHasClass(befriend.els.placeSearch, befriend.classes.placesSuggestShown);
        },
    },
    activity: {
        data: {
            items: [],
            obj: {},
        },
        setData: function (places) {
            if (!places) {
                return;
            }

            //reset data
            befriend.places.activity.data.items = [];
            befriend.places.activity.data.obj = {};

            for (let place of places) {
                befriend.places.activity.data.items.push(place);
                befriend.places.activity.data.obj[place.fsq_place_id] = place;
            }

            befriend.places.activity.setIsOpen();

            befriend.places.activity.data.items.sort(function (a, b) {
                const valA = a.is_open;
                const valB = b.is_open;

                if (valA === valB) return 0;
                if (valA === true) return -1;
                if (valB === true) return 1;
                if (valA === null) return -1;
                if (valB === null) return 1;
                return 1; // display not open last
            });
        },
        displayPlaces: function (activity_type) {
            return new Promise(async (resolve, reject) => {
                //set custom title and time
                befriend.places.activity.setPlacesTitle(activity_type.title);

                befriend.places.activity.setPlacesTime();

                befriend.places.toggleSpinner(true);

                befriend.places.activity.toggleNoPlaces(false);

                befriend.places.activity.toggleDisplayPlaces(true);

                try {
                    let r = await befriend.api.put(
                        joinPaths('activity_type', activity_type.token, 'places'),
                        {
                            location: {
                                map: befriend.location.getMarkerCoords(),
                                device: befriend.location.getDeviceCoordsIfCurrent(),
                            },
                        },
                    );

                    befriend.places.activity.setData(r.data.places);

                    if (!r.data.places || !r.data.places.length) {
                        befriend.places.activity.toggleNoPlaces(true);
                    } else {
                        await befriend.places.activity.setHtml();
                    }
                } catch (e) {
                    // throw if not 200 status code
                    console.error(e);
                }

                befriend.places.toggleSpinner(false);

                resolve();
            });
        },
        setPlacesTitle: function (title) {
            document.getElementById('places-title').innerHTML = title;
        },
        setPlacesTime: function () {
            let places_time_str = '';

            let selected = befriend.when.selected.main;

            if (selected.is_now) {
                places_time_str = `<div class="value now">Now</div>`;
            } else if (selected.is_schedule) {
                places_time_str = `<div class="value schedule">Schedule</div>`;
            } else {
                let date_time = befriend.when.getCurrentlySelectedDateTime();

                places_time_str = `<div class="value mins">${date_time.format(`h:mm a`)}</div>`;
            }

            document.getElementById('places-time').innerHTML = places_time_str;
        },
        toggleDisplayPlaces: function (show) {
            if (show) {
                befriend.timing.showPlaces = timeNow();

                addClassEl(befriend.classes.placesShown, document.documentElement);
            } else {
                removeClassEl(befriend.classes.placesShown, document.documentElement);
            }
        },
        toggleNoPlaces: function (show) {
            if (show) {
                addClassEl('no-places-found', befriend.els.places);
            } else {
                removeClassEl('no-places-found', befriend.els.places);
            }
        },
        setHtml: function () {
            return new Promise(async (resolve, reject) => {
                let html = '';

                for (let place of befriend.places.activity.data.items) {
                    let place_html = {
                        distance: ``,
                        location: ``,
                        price: ``,
                        rating: ``,
                        hours: ``,
                        full: ``,
                    };

                    //location
                    place_html.location = befriend.places.getPlaceLocation(place);

                    //distance
                    place_html.distance = place.distance.miles_km.toFixed(1);

                    if (place.distance.miles_km < 1) {
                        //hide trailing zero if less than 1 m/km
                        place_html.distance = parseFloat(place.distance.miles_km.toFixed(1));
                    }

                    if (parseFloat(place_html.distance) % 1 === 0) {
                        //add decimal if rounded exactly to integer
                        place_html.distance = parseFloat(place_html.distance).toFixed(1);
                    }

                    if (place.distance.use_km) {
                        //km
                        if (place.distance.miles_km < 0.1) {
                            //meters
                            place_html.distance = place.distance.meters;
                            place_html.distance += ' meters';
                        } else {
                            place_html.distance += ' km';
                        }
                    } else {
                        //miles
                        if (place.distance.miles_km < 0.1) {
                            //feet
                            place_html.distance = metersToFeet(place.distance.meters);
                            place_html.distance += ' ft';
                        } else {
                            place_html.distance += ' m';
                        }
                    }

                    //price
                    if (place.price) {
                        let price_str = '';

                        for (let i = 0; i < place.price; i++) {
                            price_str += '$';
                        }

                        place_html.price += `<div class="price">${price_str}</div>`;
                    }

                    //rating
                    if (isNumeric(place.rating)) {
                        let rating_str = place.rating.toFixed(1);
                        let rating = parseFloat(rating_str);

                        let stars_html = ``;

                        let color = befriend.variables.brand_color_a;

                        for (let i = 1; i <= 5; i++) {
                            let percent;

                            if (rating > i) {
                                percent = 100;
                            } else {
                                let diff = i - rating;

                                if (diff > 1) {
                                    percent = 0;
                                } else {
                                    percent = (1 - diff) * 100;
                                }
                            }

                            let percent_str = percent + '%';

                            let star_html = `<div class="circle-container">
                                                <div class="fill" style="background: linear-gradient(to right, ${color} ${percent_str}, transparent ${percent_str});"></div>
                                            </div>`;

                            stars_html += star_html;
                        }

                        place_html.rating += `<div class="rating">
                                                <div class="stars">${stars_html}</div>
                                                <div class="num">${rating_str}</div>
                                        </div>`;
                    } else {
                        place_html.rating += `<div class="rating">
                                                <div class="no-rating">No Rating</div>
                                        </div>`;
                    }

                    //closed
                    place_html.full = `<div class="left-col">
                        <div class="distance-price">
                            <div class="distance">${place_html.distance}</div>
                            ${place_html.price}
                        </div>
                            
                        <div class="name-price">
                            <div class="name">${place.name}</div>
                        </div>
                        
                         <div class="rating-price">
                             ${place_html.rating}
                         </div>
    
                         <div class="location">
                             <div class="location-address">
                                ${place_html.location}
                             </div>
                         </div>
                    </div>
                                    
                    <div class="right-col">
                        <div class="hours"></div>
                        <div class="button">Select</div>
                    </div>`;

                    html += `<div class="place" data-place-id="${place.fsq_place_id}">${place_html.full}</div>`;
                }

                let places_el = befriend.els.places.querySelector('.places');

                places_el.innerHTML = html;

                befriend.places.activity.setPlacesHours();

                befriend.places.events.handleSelectPlace(places_el.getElementsByClassName('place'));

                resolve();
            });
        },
        setPlacesHours: function () {
            //header
            befriend.places.activity.setPlacesTime();

            let places_els = befriend.els.places.getElementsByClassName('place');

            for (let i = 0; i < places_els.length; i++) {
                let el = places_els[i];

                let hours_el = el.querySelector('.hours');

                removeClassEl('show', hours_el);
                removeClassEl('open', hours_el);
                removeClassEl('closed', hours_el);

                let id = el.getAttribute('data-place-id');

                let place_data = befriend.places.activity.data.obj[id];

                if (!place_data) {
                    console.error('No place data');
                    continue;
                }

                if (place_data.is_open === null) {
                    continue;
                }

                addClassEl('show', hours_el);

                if (place_data.is_open) {
                    hours_el.innerHTML = `<div class="status">Open</div>`;

                    addClassEl('open', hours_el);
                } else {
                    hours_el.innerHTML = `<div class="status">Closed</div>`;

                    addClassEl('closed', hours_el);
                }
            }
        },
        setIsOpen: function () {
            let activity_time = befriend.when.getCurrentlySelectedDateTime();

            let day_of_week_int = activity_time.day();

            for (let place_data of befriend.places.activity.data.items) {
                if (!place_data.hours || !place_data.hours.length) {
                    place_data.is_open = null;
                    continue;
                }

                let place_hours;

                for (let hours of place_data.hours) {
                    //match dayjs
                    if (hours.day === 7) {
                        hours.day = 0;
                    }

                    if (hours.day === day_of_week_int) {
                        place_hours = hours;
                        break;
                    }
                }

                if (!place_hours) {
                    place_data.is_open = null;
                    continue;
                }

                let openHour = parseInt(place_hours.open.substring(0, 2));
                let closeHour = parseInt(place_hours.close.substring(0, 2));

                let open_time_date = activity_time
                    .startOf('date')
                    .hour(openHour)
                    .minute(parseFloat(place_hours.open.substring(2, 4)));
                let close_time_date = activity_time
                    .startOf('date')
                    .hour(closeHour)
                    .minute(parseFloat(place_hours.close.substring(2, 4)));

                place_data.is_open =
                    activity_time.valueOf() > open_time_date.valueOf() &&
                    activity_time.valueOf() < close_time_date.valueOf();
            }
        },
        updatePlacesOpen: function () {
            befriend.places.activity.setIsOpen();
            befriend.places.activity.setPlacesHours();
        },
        hidePlaces: function () {
            return new Promise(async (resolve, reject) => {
                removeClassEl('active', befriend.els.places);

                resolve();
            });
        },
        isPlacesShown: function () {
            return elHasClass(document.documentElement, befriend.classes.placesShown);
        },
    },
    getPlace: function (place_id) {
        return befriend.places.activity.data.obj[place_id] || befriend.places.search.autoComplete.obj[place_id];
    },
    toggleSpinner: function (show) {
        let spinnerEl = befriend.els.places.querySelector('.spinner');

        if (show) {
            addClassEl('show', spinnerEl);
        } else {
            removeClassEl('show', spinnerEl);
        }
    },
    getAddressGeo: function (place) {
        return new Promise(async (resolve, reject) => {
            try {
                let r = await befriend.api.post('geocode', {
                    place: place,
                });

                resolve(r.data.geo);
            } catch (e) {
                console.error(e);
                return reject();
            }
        });
    },
    getStructuredAddress: function (place) {
        let structured = {
            address: null,
            address_2: null,
            locality: null,
            region: null,
            country: null,
        };

        if (place.location_address) {
            structured.address = place.location_address;
        }

        if (place.location_address_2) {
            //do not show if zip code in address_2
            let is_postcode =
                place.location_address_2.includes(place.location_postcode) ||
                isZIPFormat(place.location_address_2);

            if (!is_postcode) {
                //do not show if address and address_2 are too similar
                let str_similarity = stringSimilarity(
                    place.location_address,
                    place.location_address_2,
                );

                if (str_similarity < 0.5) {
                    structured.address_2 = place.location_address_2;
                }
            }
        }

        structured.locatity = place.location_locality;
        structured.region = place.location_region;
        structured.country = place.location_country;

        return structured;
    },
    getTravelTimes: function (from, to) {
        return new Promise(async (resolve, reject) => {
            try {
                let unix_ts;

                let when = befriend.when.selected.main;

                if (when.is_now) {
                    unix_ts = timeNow(true);
                } else if (when.is_schedule) {
                    //todo
                    unix_ts = timeNow(true);
                } else {
                    unix_ts = when.time.unix;
                }

                let date = dayjs.unix(unix_ts).format('YYYY-MM-DDTHH:mm');

                let r = await befriend.api.post('travel-time', {
                    when: date,
                    from,
                    to,
                });

                resolve(r.data);
            } catch (e) {
                console.error(e);
                return reject();
            }
        });
    },
    getPlaceLocation(place) {
        let structured = befriend.places.getStructuredAddress(place);

        let html = '';

        if (structured.address) {
            html += `<div class="address">${structured.address}</div>`;
        }

        if (structured.address_2) {
            html += `<div class="address_2">${structured.address_2}</div>`;
        }

        html += `<div class="locality">${structured.locatity}, ${structured.region}</div>`;

        return html;
    },
    events: {
        init: function () {
            return new Promise(async (resolve, reject) => {
                befriend.places.events.onPlaces();
                befriend.places.events.searchPlace();

                resolve();
            });
        },
        searchPlace: function () {
            let input_el = befriend.els.activities.querySelector('.input-search-place');

            let debounceTimer = null;

            input_el.addEventListener('input', function () {
                clearTimeout(debounceTimer);

                debounceTimer = setTimeout(async function () {
                    const value = input_el.value;

                    try {
                        befriend.places.search.searchPlace(value);
                    } catch (e) {
                        console.error(e);
                    }
                }, 100);
            });

            input_el.addEventListener('focus', function () {
                if (this.value.length >= befriend.places.search.autoComplete.minChars) {
                    befriend.places.search.toggleAutoComplete(true);
                }
            });
        },
        onPlaces: function () {
            befriend.places.events.onBackPlaces();
        },
        onBackPlaces: function () {
            let back = befriend.els.places.querySelector('.back');

            back.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                befriend.places.activity.toggleDisplayPlaces(false);
            });
        },
        handleSelectPlace: function (els) {
            //remove session token
            befriend.places.search.autoComplete.session_token = null;

            for (let i = 0; i < els.length; i++) {
                let place_el = els[i];

                if (place_el._listener) {
                    continue;
                }

                place_el._listener = true;

                place_el.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    let place_id = place_el.getAttribute('data-place-id');

                    befriend.places.selected.place = befriend.places.getPlace(place_id);

                    if (befriend.places.activity.isPlacesShown()) {
                        befriend.places.selected.is_activity_type = true;

                        //use duration for activity
                        let activity_type = befriend.activities.getCurrentActivityType();

                        if (activity_type) {
                            befriend.activities.updateDuration(activity_type.duration, true);
                        }
                    } else {
                        befriend.places.selected.is_activity_type = false;
                    }

                    befriend.activities.displayCreateActivity();
                });
            }
        },
    },
};
