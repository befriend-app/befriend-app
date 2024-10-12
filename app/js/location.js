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

                if(!befriend.location.current) {
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
    events: {
        init: function () {
            return new Promise(async (resolve, reject) => {
                befriend.location.events.onChangeLocation();

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
    }
};
