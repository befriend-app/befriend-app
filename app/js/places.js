befriend.places = {
    data: {
        items: [],
        obj: {},
    },
    displayPlaces: function (activity_type) {
        return new Promise(async (resolve, reject) => {
            let location = befriend.location.getLocation();

            if (!location) {
                return reject("No location");
            }

            befriend.timing.showPlaces = timeNow();

            //set custom title and time
            befriend.places.setPlacesTitle(activity_type.title);
            befriend.places.setPlacesTime();

            befriend.places.toggleSpinner(true);

            befriend.places.toggleNoPlaces(false);

            befriend.places.toggleDisplayPlaces(true);

            try {
                let r = await axios.put(joinPaths(api_domain, "activity_type", activity_type.token, "places"), {
                    location: location,
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
    events: function () {
        return new Promise(async (resolve, reject) => {
            let back = befriend.els.places.querySelector(".back");

            back.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                removeClassEl(befriend.classes.placesShown, document.documentElement);
            });

            resolve();
        });
    },
    isPlacesShown: function () {
        return elHasClass(document.documentElement, befriend.classes.placesShown);
    },
    toggleDisplayPlaces: function (show) {
        if (show) {
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
};
