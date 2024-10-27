befriend.events = {
    init: function () {
        console.log('[init] Events');

        return new Promise(async (resolve, reject) => {
            try {
                befriend.events.bodyClickHandler();
                befriend.events.onAppState();
                befriend.events.resizeHandler();

                await befriend.notifications.events.init();
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
        document.querySelector('body').addEventListener('click', function (e) {
            e = e || window.event;

            if (befriend.activities.isCreateActivityShown()) {
                //do nothing
            } else if (befriend.places.isPlacesShown()) {
                //hide places to bottom
                if (!e.target.closest('#places')) {
                    //do not hide on double click if activity type just clicked
                    if (
                        timeNow() - befriend.timing.showPlaces <
                        befriend.variables.places_transition_ms
                    ) {
                        return false;
                    }

                    befriend.places.toggleDisplayPlaces(false);
                }
            } else if (befriend.location.isChangeLocationShown()) {
                if (!e.target.closest('#change-location')) {
                    //do not hide on double click
                    if (
                        timeNow() - befriend.timing.showChangeLocation <
                        befriend.variables.places_transition_ms
                    ) {
                        return false;
                    }

                    befriend.location.toggleChangeLocation(false);
                }
            } else if (befriend.places.isAutoCompleteShown()) {
                if (!e.target.closest('#place-search')) {
                    befriend.places.toggleAutoComplete(false);
                }
            }
        });
    },
    resizeHandler: function () {
        window.addEventListener('resize', function () {
            befriend.styles.createActivity.updateCloseMessagePosition();
        });
    },
    onAppState: function () {
        function onPause() {
            console.log("on pause");

            befriend.is_paused = true;
        }

        function onResume() {
            console.log("on resume");

            befriend.is_paused = false;
        }

        document.addEventListener('pause', onPause, false);
        document.addEventListener('resume', onResume, false);
    }
};
