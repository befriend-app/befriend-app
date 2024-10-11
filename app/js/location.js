befriend.location = {
    current: null,
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
                befriend.location.current = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                };

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
        return befriend.location.search || befriend.location.current;
    },
};
