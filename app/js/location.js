befriend.location = {
    current: null,
    search: null,
    init: function () {
        return new Promise(async (resolve, reject) => {
            function geoLocationSuccess(position) {
                console.log({
                    coords: position.coords,
                });

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

            const geoLocationOptions = {};

            try {
                navigator.geolocation.getCurrentPosition(geoLocationSuccess, geoLocationError, geoLocationOptions);
            } catch (e) {
                console.error(e);
                return reject(e);
            }
        });
    },
};
