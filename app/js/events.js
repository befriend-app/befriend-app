befriend.events = {
    init: function () {
        return new Promise(async (resolve, reject) => {
            try {
                befriend.events.bodyClickHandler();

                await befriend.when.events.init();
                await befriend.friends.events.init();
                await befriend.maps.events.init();
                await befriend.activities.events.init();
                await befriend.location.events.init();
                await befriend.places.events.init();
            } catch (e) {
                console.error(e);
            }

            resolve();
        });
    },
    bodyClickHandler: function () {
        document.querySelector("body").addEventListener("click", function (e) {
            e = e || window.event;

            if (befriend.places.isPlacesShown()) {
                //hide places to bottom
                if (!e.target.closest("#places")) {
                    //do not hide on double click if activity type just clicked
                    if (timeNow() - befriend.timing.showPlaces < befriend.styles.places_transition_ms) {
                        return false;
                    }

                    befriend.places.toggleDisplayPlaces(false);
                }
            } else if (befriend.location.isChangeLocationShown()) {
                if (!e.target.closest("#change-location")) {
                    //do not hide on double click
                    if (timeNow() - befriend.timing.showChangeLocation < befriend.styles.places_transition_ms) {
                        return false;
                    }

                    befriend.location.toggleChangeLocation(false);
                }
            }
        });
    },
};
