befriend.maps = {
    token: {
        key: "map-token.json",
        data: null,
    },
    maps: {
        activities: null,
    },
    markers: {
        currentMarker: null,
    },
    defaultZoom: 13,
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
                    zoom: befriend.maps.defaultZoom,
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
        return new Promise(async (resolve, reject) => {
            try {
                const image_location = "/img/marker.png";

                const image_dimensions = await getImgDimensions(image_location);

                const image_ratio = image_dimensions.width / image_dimensions.height;

                // create custom marker
                const el = document.createElement("div");

                el.className = "marker";
                el.style.backgroundImage = `url(${image_location})`;
                el.style.width = `${image_ratio * befriend.variables.map_marker_height}px`;
                el.style.height = `${befriend.variables.map_marker_height}px`;
                el.style.marginTop = `${befriend.variables.map_marker_height / -2}px`;

                let marker = new mapboxgl.Marker(el).setLngLat([lng, lat]).addTo(map);

                befriend.maps.markers.currentMarker = marker;

                resolve(marker);
            } catch (error) {
                console.error(error);
                reject(error);
            }
        });
    },
    removeMarker: function (marker) {
        marker.remove();
    },
    setMapCenter: function (map, lat, lng, set_zoom) {
        if (set_zoom) {
            map.setCenter([lng, lat]).setZoom(befriend.maps.defaultZoom);
        } else {
            map.setCenter([lng, lat]);
        }
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
