befriend.location = {
    current: null,
    device: null,
    search: null,
    prev: {
        key: 'location_server.json',
        map: null,
        server: null,
    },
    init: function () {
        console.log('[init] Location');

        return new Promise(async (resolve, reject) => {
            try {
                await befriend.location.getLocation();

                resolve();
            } catch (e) {
                console.error(e);
                return reject();
            }
        });
    },
    getLocation: function () {
        return new Promise(async (resolve, reject) => {
            function getLocation() {
                const geoLocationOptions = {};

                try {
                    befriend.plugins.geo.getCurrentPosition(
                        geoLocationSuccess,
                        geoLocationError,
                        geoLocationOptions,
                    );
                } catch (e) {
                    console.error(e);
                    return reject(e);
                }
            }

            function geoLocationSuccess(position) {
                if (!befriend.location.device) {
                    befriend.location.device = {};
                }

                befriend.location.device.lat = position.coords.latitude;
                befriend.location.device.lon = position.coords.longitude;

                if (!befriend.location.current) {
                    befriend.location.current = befriend.location.device;
                }

                befriend.maps.updateLocationIf();

                befriend.location.saveLocationIf();

                resolve(befriend.location.device);
            }

            function geoLocationError(err) {
                console.error(err);
                reject(err);
            }

            getLocation();

            setInterval(function () {
                getLocation();
            }, 60000);
        });
    },
    getCurrent: function () {
        return befriend.location.current;
    },
    isDevice: function () {
        return befriend.location.device === befriend.location.current;
    },
    isCustom: function () {
        return befriend.location.search === befriend.location.current;
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
        befriend.els.activityTypes.querySelector('.near-text').innerHTML =
            befriend.location.current.name;

        befriend.maps.removeMarkers([
            befriend.maps.markers.me,
            befriend.maps.markers.pin,
            befriend.maps.markers.place,
        ]);

        befriend.maps.addMarkerCustom();

        befriend.maps.setMapCenter(
            befriend.maps.maps.activities,
            befriend.location.search,
            befriend.maps.defaultZoom,
        );

        befriend.location.toggleResetLocationButton(true);

        //re-use previous autocomplete search for new city
        befriend.places.search.setPreviousAutoComplete();
    },
    toggleResetLocationButton: function (show) {
        if (show) {
            addClassEl('custom-location', befriend.els.activityTypes);
        } else {
            removeClassEl('custom-location', befriend.els.activityTypes);
        }
    },
    getMarkerCoords: function () {
        let location = befriend.location.getCurrent();

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
    saveLocationIf: function (force_update = false) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!befriend.location.device) {
                    return resolve();
                }

                if (!befriend.location.prev.server) {
                    //get data from local storage if previously saved
                    let data = window.localStorage.getItem(befriend.location.prev.key);

                    try {
                        if (data && JSON.parse(data)) {
                            befriend.location.prev.server = JSON.parse(data);
                        }
                    } catch (e) {
                        console.error(e);
                    }
                }

                const currentCoords = {
                    lat: befriend.location.device.lat,
                    lon: befriend.location.device.lon,
                };

                const MINIMUM_DISTANCE_THRESHOLD_KM = 1;

                // Check if coordinates have changed from previous by more than threshold
                if (
                    force_update ||
                    !befriend.location.prev.server ||
                    calculateDistance(
                        { lat: currentCoords.lat, lon: currentCoords.lon },
                        {
                            lat: befriend.location.prev.server.lat,
                            lon: befriend.location.prev.server.lon,
                        },
                        true,
                    ) > MINIMUM_DISTANCE_THRESHOLD_KM
                ) {
                    // Save location to server
                    await befriend.auth.put('/location', {
                        lat: currentCoords.lat,
                        lon: currentCoords.lon,
                    });

                    befriend.location.prev.server = { ...currentCoords };

                    window.localStorage.setItem(
                        befriend.location.prev.key,
                        JSON.stringify(currentCoords),
                    );
                }

                resolve();
            } catch (e) {
                console.error('Failed to save location:', e);
                reject(e);
            }
        });
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
            befriend.els.changeLocationBtn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();

                befriend.location.toggleChangeLocation(true);
            });

            befriend.els.changeLocation
                .querySelector('.back')
                .addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    befriend.location.toggleChangeLocation(false);
                });
        },
        autoComplete: function () {
            function clearSuggestions() {
                suggestions_items_el.innerHTML = '';
            }

            function displaySuggestions(cities) {
                clearSuggestions();

                for (let city of cities) {
                    const el = document.createElement('div');

                    el.className = 'suggestion-item';

                    let location_arr = [`<div class="city">${city.name}</div>`];

                    if (city.state && city.state.short) {
                        location_arr.push(`<div class="state">, ${city.state.short}</div>`);
                    }

                    if (city.country && !city.is_user_country) {
                        location_arr.push(`<div class="country">${city.country.name}</div>`);
                    }

                    el.innerHTML = `
        <div class="suggestion-name">${location_arr.join('')}</div>
    `;

                    el.addEventListener('click', () => {
                        befriend.location.setCustomLocation(city);
                    });

                    suggestions_items_el.appendChild(el);
                }
            }

            let input_el = befriend.els.changeLocation.querySelector('.change-location-input');
            let suggestions_items_el = befriend.els.changeLocation
                .querySelector('.suggestions')
                .querySelector('.items');

            let debounceTimer = null;

            let minChars = 2;

            input_el.addEventListener('input', function () {
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

                        const r = await befriend.api.post('autocomplete/cities', params);

                        displaySuggestions(r.data.cities);
                    } catch (error) {
                        console.error('Search error:', error);
                    }
                }, 100);
            });
        },
        resetToDeviceLocation: function () {
            befriend.els.activityTypes
                .querySelector('.reset-location')
                .addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    befriend.location.current = befriend.location.device;

                    befriend.els.activityTypes.querySelector('.near-text').innerHTML = 'Near Me';

                    befriend.maps.removeMarkers([
                        befriend.maps.markers.me,
                        befriend.maps.markers.pin,
                        befriend.maps.markers.place,
                    ]);

                    befriend.maps.addMarker(
                        befriend.maps.maps.activities,
                        befriend.location.current,
                        {
                            is_me: true,
                        },
                    );

                    befriend.maps.setMapCenter(
                        befriend.maps.maps.activities,
                        befriend.location.current,
                        befriend.maps.defaultZoom,
                    );

                    befriend.location.toggleResetLocationButton(false);

                    //re-use previous autocomplete search for device location
                    befriend.places.search.setPreviousAutoComplete();
                });
        },
    },
};
