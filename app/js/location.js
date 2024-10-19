befriend.location = {
    current: null,
    device: null,
    search: null,
    init: function () {
        return new Promise(async (resolve, reject) => {
            function getLocation() {
                const geoLocationOptions = {};

                try {
                    navigator.geolocation.getCurrentPosition(geoLocationSuccess, geoLocationError, geoLocationOptions);
                } catch (e) {
                    console.error(e);
                    return reject(e);
                }
            }

            function geoLocationSuccess(position) {
                befriend.location.device = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                };

                if (!befriend.location.current) {
                    befriend.location.current = befriend.location.device;
                }

                resolve();
            }

            function geoLocationError(err) {
                console.error(err);
                return reject(err);
            }

            getLocation();

            setInterval(function () {
                getLocation();
            }, 60000);
        });
    },
    getLocation: function () {
        return befriend.location.current;
    },
    isDevice: function () {
        return befriend.location.device === befriend.location.current;
    },
    toggleChangeLocation: function (show) {
        if (show) {
            befriend.timing.showChangeLocation = timeNow();

            addClassEl(befriend.classes.changeLocationShown, document.documentElement);
        } else {
            removeClassEl(befriend.classes.changeLocationShown, document.documentElement);
        }
    },
    isChangeLocationShown: function () {
        return elHasClass(document.documentElement, befriend.classes.changeLocationShown);
    },
    setCustomLocation: function (city) {
        befriend.location.current = city;
        befriend.location.search = city;
        befriend.location.toggleChangeLocation(false);
        befriend.els.activities.querySelector(".near-text").innerHTML = befriend.location.current.name;

        befriend.maps.removeMarker(befriend.maps.markers.currentMarker);

        befriend.maps.addMarker(befriend.maps.maps.activities, befriend.location.search, {
            is_pin: true,
        });

        befriend.maps.setMapCenter(befriend.maps.maps.activities, befriend.location.search, befriend.maps.defaultZoom);

        befriend.location.toggleResetLocationButton(true);

        //re-use previous autocomplete search for new city
        befriend.places.setPreviousAutoComplete();
    },
    toggleResetLocationButton: function (show) {
        if (show) {
            addClassEl("custom-location", befriend.els.activities);
        } else {
            removeClassEl("custom-location", befriend.els.activities);
        }
    },
    getMarkerCoords: function () {
        let location = befriend.location.getLocation();

        let lat = location.lat;
        let lon = location.lon;

        try {
            // use lat/lon of map center
            let map_center = befriend.maps.maps.activities.getCenter();

            lat = map_center.lat;
            lon = map_center.lng;
        } catch (e) {
            console.error(e);
        }

        return {
            lat,
            lon,
        };
    },
    getDeviceCoordsIfCurrent: function () {
        if (befriend.location.isDevice()) {
            return befriend.location.device || null;
        }

        return null;
    },
    events: {
        init: function () {
            return new Promise(async (resolve, reject) => {
                befriend.location.events.onChangeLocation();
                befriend.location.events.autoComplete();
                befriend.location.events.resetToDeviceLocation();

                resolve();
            });
        },
        onChangeLocation: function () {
            befriend.els.change_location_btn.addEventListener("click", function (e) {
                e.preventDefault();
                e.stopPropagation();

                befriend.location.toggleChangeLocation(true);
            });

            befriend.els.change_location.querySelector(".back").addEventListener("click", function (e) {
                e.preventDefault();
                e.stopPropagation();

                befriend.location.toggleChangeLocation(false);
            });
        },
        autoComplete: function () {
            function clearSuggestions() {
                suggestions_el.innerHTML = "";
            }

            function displaySuggestions(cities) {
                clearSuggestions();

                for (let city of cities) {
                    const el = document.createElement("div");

                    el.className = "suggestion-item";

                    let location_arr = [`<div class="city">${city.name}</div>`];

                    if (city.state && city.state.short) {
                        location_arr.push(`<div class="state">, ${city.state.short}</div>`);
                    }

                    if (city.country && !city.is_user_country) {
                        location_arr.push(`<div class="country">${city.country.name}</div>`);
                    }

                    el.innerHTML = `
        <div class="suggestion-name">${location_arr.join("")}</div>
    `;

                    el.addEventListener("click", () => {
                        befriend.location.setCustomLocation(city);
                    });

                    suggestions_el.appendChild(el);
                }
            }

            let input_el = befriend.els.change_location.querySelector(".change-location-input");
            let suggestions_el = befriend.els.change_location.querySelector(".suggestions");

            let debounceTimer = null;

            let minChars = 2;

            input_el.addEventListener("input", function () {
                clearTimeout(debounceTimer);

                debounceTimer = setTimeout(async function () {
                    const value = input_el.value.trim();

                    if (value.length < minChars) {
                        clearSuggestions();
                        return;
                    }

                    try {
                        let params = {
                            search: value,
                        };

                        if (befriend.location.device) {
                            params.lat = befriend.location.device.lat;
                            params.lon = befriend.location.device.lon;
                        }

                        const r = await axios.post(joinPaths(api_domain, `autocomplete/cities`), params);

                        displaySuggestions(r.data.cities);
                    } catch (error) {
                        console.error("Search error:", error);
                    }
                }, 100);
            });
        },
        resetToDeviceLocation: function () {
            befriend.els.activities.querySelector(".reset-location").addEventListener("click", function (e) {
                e.preventDefault();
                e.stopPropagation();

                befriend.location.current = befriend.location.device;

                befriend.els.activities.querySelector(".near-text").innerHTML = "Me";

                befriend.maps.removeMarker(befriend.maps.markers.currentMarker);

                befriend.maps.addMarker(befriend.maps.maps.activities, befriend.location.current, {
                    is_me: true,
                });

                befriend.maps.setMapCenter(
                    befriend.maps.maps.activities,
                    befriend.location.current,
                    befriend.maps.defaultZoom,
                );

                befriend.location.toggleResetLocationButton(false);

                //re-use previous autocomplete search for device location
                befriend.places.setPreviousAutoComplete();
            });
        },
    },
};
