befriend.places = {
    data: {
        items: [],
        obj: {},
    },
    autoComplete: {
        session_token: null,
        items: [],
        obj: {},
        minChars: 3,
    },
    displayPlaces: function (activity_type) {
        return new Promise(async (resolve, reject) => {
            //set custom title and time
            befriend.places.setPlacesTitle(activity_type.title);

            befriend.places.setPlacesTime();

            befriend.places.toggleSpinner(true);

            befriend.places.toggleNoPlaces(false);

            befriend.places.toggleDisplayPlaces(true);

            try {
                let r = await axios.put(joinPaths(api_domain, "activity_type", activity_type.token, "places"), {
                    location: {
                        map: befriend.location.getMarkerCoords(),
                        device: befriend.location.getDeviceCoordsIfCurrent(),
                    },
                });

                befriend.places.setData(r.data.places);

                if (!r.data.places || !r.data.places.length) {
                    befriend.places.toggleNoPlaces(true);
                } else {
                    await befriend.html.setPlaces();
                }
            } catch (e) {
                // throw if not 200 status code
                console.error(e);
            }

            befriend.places.toggleSpinner(false);

            resolve();
        });
    },
    setData: function (places) {
        if (!places) {
            return;
        }

        //reset data
        befriend.places.data.items = [];
        befriend.places.data.obj = {};

        for (let place of places) {
            befriend.places.data.items.push(place);
            befriend.places.data.obj[place.id] = place;
        }

        befriend.places.setIsOpen();

        befriend.places.data.items.sort(function (a, b) {
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
    setAutoComplete: function (places) {
        befriend.places.setAutoCompleteData(places);
        befriend.places.displaySuggestions(places);
    },
    setAutoCompleteData: function (places) {
        if (!places) {
            return;
        }

        //reset data
        befriend.places.autoComplete.items = [];
        befriend.places.autoComplete.obj = {};

        for (let place of places) {
            let id = place.fsq_place_id || place.fsq_address_id || null;

            befriend.places.autoComplete.items.push(place);
            befriend.places.autoComplete.obj[id] = place;
        }
    },
    displaySuggestions: function (places) {
        let suggestions_el = befriend.els.activities
            .querySelector(".place-search-suggestions")
            .querySelector(".container");

        let html = "";

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

            //location
            if (place.location_address) {
                place_html.location += `<div class="address">${place.location_address}</div>`;
            }

            if (place.location_address_2) {
                //do not show if zip code in address_2

                let is_postcode =
                    place.location_address_2.includes(place.location_postcode) || isZIPFormat(place.location_address_2);

                if (!is_postcode) {
                    //do not show if address and address_2 are too similar
                    let str_similarity = stringSimilarity(place.location_address, place.location_address_2);

                    if (str_similarity < 0.5) {
                        place_html.location += `<div class="address_2">${place.location_address_2}</div>`;
                    }
                }
            }

            place_html.location += `<div class="locality">${place.location_locality}, ${place.location_region}</div>`;

            //distance
            let distance_html = "";

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
                        distance_html += " meters";
                    } else {
                        distance_html += " km";
                    }
                } else {
                    //miles
                    if (place.distance.miles_km < 0.1) {
                        //feet
                        distance_html = metersToFeet(place.distance.meters);
                        distance_html += " ft";
                    } else {
                        distance_html += " m";
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

            let id = place.fsq_place_id || place.fsq_address_id || "";

            let is_address = place.fsq_address_id ? "is_address" : "";

            html += `<div class="place ${is_address}" data-place-id="${id}">${place_html.full}</div>`;
        }

        suggestions_el.innerHTML = html;

        befriend.places.toggleAutoComplete(true);

        befriend.places.events.onSearchPlaceSelect();
    },
    setPreviousAutoComplete: function (place) {
        let search_input_el = befriend.els.activities.querySelector(".input-search-place");

        let search_value = search_input_el.value;

        if (search_value < befriend.places.autoComplete.minChars) {
            befriend.places.setAutoComplete([]);
        } else {
            try {
                befriend.places.sendSearchPlace(search_value);
            } catch (e) {}
        }
    },
    setIsOpen: function () {
        let activity_time = befriend.when.getCurrentlySelectedDateTime();

        let day_of_week_int = activity_time.day();

        for (let place_data of befriend.places.data.items) {
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
                .startOf("date")
                .hour(openHour)
                .minute(parseFloat(place_hours.open.substring(2, 4)));
            let close_time_date = activity_time
                .startOf("date")
                .hour(closeHour)
                .minute(parseFloat(place_hours.close.substring(2, 4)));

            place_data.is_open =
                activity_time.valueOf() > open_time_date.valueOf() &&
                activity_time.valueOf() < close_time_date.valueOf();
        }
    },
    hidePlaces: function () {
        return new Promise(async (resolve, reject) => {
            removeClassEl("active", befriend.els.places);

            resolve();
        });
    },
    isPlacesShown: function () {
        return elHasClass(document.documentElement, befriend.classes.placesShown);
    },
    isAutoCompleteShown: function () {
        return elHasClass(befriend.els.place_search, befriend.classes.placesSuggestShown);
    },
    toggleAutoComplete: function (show) {
        if (show) {
            addClassEl(befriend.classes.placesSuggestShown, befriend.els.place_search);
        } else {
            removeClassEl(befriend.classes.placesSuggestShown, befriend.els.place_search);
        }
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
            addClassEl("no-places-found", befriend.els.places);
        } else {
            removeClassEl("no-places-found", befriend.els.places);
        }
    },
    toggleSpinner: function (show) {
        let spinnerEl = befriend.els.places.querySelector(".spinner");

        if (show) {
            addClassEl("show", spinnerEl);
        } else {
            removeClassEl("show", spinnerEl);
        }
    },
    setPlacesTitle: function (title) {
        document.getElementById("places-title").innerHTML = title;
    },
    setPlacesTime: function () {
        let places_time_str = "";

        let selected = befriend.when.selected;

        if (selected.is_now) {
            places_time_str = `<div class="value now">Now</div>`;
        } else if (selected.is_schedule) {
            places_time_str = `<div class="value schedule">Schedule</div>`;
        } else {
            let date_time = befriend.when.getCurrentlySelectedDateTime();

            places_time_str = `<div class="value mins">${date_time.format(`h:mm a`)}</div>`;
        }

        document.getElementById("places-time").innerHTML = places_time_str;
    },
    updatePlacesOpen: function () {
        befriend.places.setIsOpen();
        befriend.html.setPlacesHours();
    },
    getAutocompleteSessionToken: function () {
        if (befriend.places.autoComplete.session_token) {
            return befriend.places.autoComplete.session_token;
        }

        let token = generateToken(32);

        befriend.places.autoComplete.session_token = token;

        return token;
    },
    sendSearchPlace: function (search_str) {
        return new Promise(async (resolve, reject) => {
            if (!search_str) {
                return resolve();
            }

            search_str = search_str.trim();

            if (search_str.length < befriend.places.autoComplete.minChars) {
                befriend.places.toggleAutoComplete(false);
                return resolve();
            }

            try {
                let session_token = befriend.places.getAutocompleteSessionToken();

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

                const r = await axios.post(joinPaths(api_domain, `autocomplete/places`), params);

                befriend.places.setAutoComplete(r.data.places);
            } catch (error) {
                console.error("Search error:", error);
            }

            resolve();
        });
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
            let input_el = befriend.els.activities.querySelector(".input-search-place");

            let debounceTimer = null;

            input_el.addEventListener("input", function () {
                clearTimeout(debounceTimer);

                debounceTimer = setTimeout(async function () {
                    const value = input_el.value;

                    try {
                        befriend.places.sendSearchPlace(value);
                    } catch (e) {
                        console.error(e);
                    }
                }, 100);
            });

            input_el.addEventListener("focus", function () {
                if (this.value.length >= befriend.places.autoComplete.minChars) {
                    befriend.places.toggleAutoComplete(true);
                }
            });
        },
        onPlaces: function () {
            befriend.places.events.onBackPlaces();
        },
        onBackPlaces: function () {
            let back = befriend.els.places.querySelector(".back");

            back.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();

                befriend.places.toggleDisplayPlaces(false);
            });
        },
        onSearchPlaceSelect: function () {},
    },
};
