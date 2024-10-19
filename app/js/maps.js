befriend.maps = {
    token: {
        key: "map-token.json",
        data: null,
    },
    maps: {
        activities: null,
    },
    markers: {
        me: null,
        pin: null,
        be: null,
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

                // map.addControl(new mapboxgl.GeolocateControl());
                // map.addControl(new mapboxgl.NavigationControl());

                befriend.maps.maps.activities = map;

                befriend.maps.addMarker(map, location, {
                    is_me: true,
                });
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
    addMarker: function (map, location, marker_type) {
        return new Promise(async (resolve, reject) => {
            let image_location;

            try {
                if (marker_type.is_me) {
                    image_location = "/img/marker-me.png";
                } else if (marker_type.is_pin) {
                    image_location = "/img/marker.png";
                } else if (marker_type.is_place) {
                    image_location = "/img/marker-be.png";
                }

                const image_dimensions = await getImgDimensions(image_location);

                const image_ratio = image_dimensions.width / image_dimensions.height;

                // create custom marker
                const el = document.createElement("div");

                el.className = "marker";
                el.style.backgroundImage = `url(${image_location})`;
                el.style.width = `${image_ratio * befriend.variables.map_marker_height}px`;
                el.style.height = `${befriend.variables.map_marker_height}px`;
                el.style.marginTop = `${befriend.variables.map_marker_height / -2}px`;

                let marker = new mapboxgl.Marker(el).setLngLat([location.lon, location.lat]).addTo(map);

                if (marker_type.is_me) {
                    befriend.maps.markers.me = marker;
                } else if (marker_type.is_pin) {
                    befriend.maps.markers.pin = marker;
                } else if (marker_type.is_place) {
                    befriend.maps.markers.be = marker;
                }


                resolve(marker);
            } catch (error) {
                console.error(error);
                reject(error);
            }
        });
    },
    removeMarkers: function (markers) {
        if(!Array.isArray(markers)) {
            markers = [markers];
        }
        
        for(let marker of markers) {
            if(marker) {
                marker.remove();
            }    
        }
    },
    setMapCenter: function (map, location, zoom_level, fly_to) {
        if (fly_to) {
            let options = {
                center: [location.lon, location.lat],
                essential: true,
            };

            if (zoom_level) {
                options.zoom = zoom_level;
            }

            map.flyTo(options);
        } else {
            if (zoom_level) {
                map.setCenter([location.lon, location.lat]).setZoom(zoom_level);
            } else {
                map.setCenter([location.lon, location.lat]);
            }
        }
    },
    events: {
        init: function () {
            return new Promise(async (resolve, reject) => {
                try {
                    befriend.maps.events.onResetToMarker();
                } catch (e) {
                    console.error(e);
                }

                resolve();
            });
        },
        onResetToMarker: function () {
            let reset_marker_btn = befriend.els.activities.querySelector(".reset-to-marker");

            reset_marker_btn.addEventListener("click", function (e) {
                e.preventDefault();
                e.stopPropagation();

                befriend.maps.setMapCenter(befriend.maps.maps.activities, befriend.location.current, 14, true);
            });
        },
    },
};
