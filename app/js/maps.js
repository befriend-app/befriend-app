befriend.maps = {
    token: {
        key: "map-token.json",
        data: null,
    },
    maps: {
        activities: null,
    },
    init: function () {
        return new Promise(async (resolve, reject) => {
            try {
                await befriend.maps.loadActivityMap();
            } catch (e) {
                console.error(e);
            }

            resolve();
        });
    },
    loadActivityMap: function () {
        return new Promise(async (resolve, reject) => {
            let map;
            let location = befriend.location.getLocation();

            //get token to display map
            try {
                await befriend.maps.getToken();

                befriend.maps.updateTokenInterval();

                mapboxgl.accessToken = befriend.maps.token.data.token;
            } catch (e) {
                console.error(e);
                return reject();
            }

            try {
                map = new mapboxgl.Map({
                    container: "activities-map",
                    style: "mapbox://styles/mapbox/light-v10",
                    center: [location.lon, location.lat],
                    zoom: 13,
                    attributionControl: false,
                });

                map.addControl(new mapboxgl.GeolocateControl());
                // map.addControl(new mapboxgl.NavigationControl());

                befriend.maps.maps.activities = map;

                befriend.maps.addMarker(map, location.lat, location.lon);
            } catch (e) {
                console.error(e);
            }

            resolve();
        });
    },
    getToken: function (force_new = false) {
        return new Promise(async (resolve, reject) => {
            let token;

            //use existing token first, expires in 1 hr
            let local = localStorage.getItem(befriend.maps.token.key);

            if (local && !force_new) {
                try {
                    token = JSON.parse(local);
                } catch (e) {
                    console.error(e);
                }

                if (token && token.token) {
                    if (token.expires > timeNow()) {
                        befriend.maps.token.data = token;
                        return resolve();
                    }
                }
            }

            try {
                let r = await axios.get(joinPaths(api_domain, "mapbox/token"));

                token = befriend.maps.token.data = {
                    token: r.data.token,
                    expires: timeNow() + 3600 * 1000,
                };

                localStorage.setItem(befriend.maps.token.key, JSON.stringify(token));

                mapboxgl.accessToken = token.token;
            } catch (e) {
                console.error(e);
                return reject();
            }

            resolve();
        });
    },
    updateTokenInterval: function () {
        //update token every hour
        let update_in = 3600 * 1000;

        if (befriend.maps.token.data) {
            let td = befriend.maps.token.data.expires - timeNow();

            if (td > 0) {
                //less than an hour left on token
                update_in = td;
            }
        }

        setTimeout(async function () {
            try {
                await befriend.maps.getToken(true);
            } catch (e) {
                console.error(e);
            }

            setInterval(async function () {
                try {
                    await befriend.maps.getToken(true);
                } catch (e) {
                    console.error(e);
                }
            }, 3600 * 1000);
        }, update_in);
    },
    addMarker: function (map, lat, lng) {
        new mapboxgl.Marker({
            color: befriend.styles.brand_color_a,
        })
        .setLngLat([lng, lat])
        .addTo(map);
    },
    events: {
        init: function () {
            return new Promise(async (resolve, reject) => {
                try {
                    await befriend.maps.events.setActivityRadius();
                } catch (e) {
                    console.error(e);
                }

                resolve();
            });
        },
        setActivityRadius: function () {
            return new Promise(async (resolve, reject) => {
                //slider
                let radiusValue = 3;
                let sliderRange = document.getElementById("range-radius-activities");

                function updatePosition() {
                    const val = sliderRange.valueAsNumber;
                    const min = parseFloat(sliderRange.min);
                    const max = parseFloat(sliderRange.max);
                    const newVal = Number(((val - min) * max) / (max - min));

                    const sliderRect = sliderRange.getBoundingClientRect();

                    let thumb_w = befriend.styles.range_radius_dim;

                    const thumbPosition = (newVal * (sliderRect.width - thumb_w)) / max;

                    //todo conditional km
                    rangeDiv.innerHTML = `${radiusValue} <span class="unit">mi</span>`;
                    rangeDiv.style.left = `${thumbPosition}px`;
                }

                window.addEventListener("resize", function (e) {
                    updatePosition();
                });

                window.addEventListener("orientationchange", function (e) {
                    updatePosition();
                });

                //set position of number for range
                let rangeDiv = befriend.els.map_radius_activities.querySelector(".slider div");

                //load prev setting
                // let prevSetting = localStorage.getItem(settings_key);
                //
                // if(prevSetting) {
                //     radiusValue = parseInt(prevSetting);
                // }

                sliderRange.setAttribute("value", radiusValue);

                sliderRange.addEventListener("input", function (e) {
                    let val = this.value;

                    if (!isNumeric(val)) {
                        return;
                    }

                    radiusValue = parseInt(val);

                    // localStorage.setItem(settings_key, radiusValue);

                    updatePosition();
                });

                updatePosition();

                resolve();
            });
        },
    },
};
