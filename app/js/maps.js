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
            color: befriend.variables.brand_color_a,
        })
            .setLngLat([lng, lat])
            .addTo(map);
    },
    events: {
        init: function () {
            return new Promise(async (resolve, reject) => {
                try {
                } catch (e) {
                    console.error(e);
                }

                resolve();
            });
        },
    },
};
