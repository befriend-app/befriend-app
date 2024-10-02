befriend.events = {
    addEvents: function () {
        return new Promise(async (resolve, reject) => {
            try {
                befriend.events.bodyClickHandler();

                await befriend.activities.events();
                await befriend.places.events();
            } catch(e) {
                console.error(e);
            }

            resolve();
        });
    },
    bodyClickHandler: function () {
        document.querySelector('body').addEventListener('click', function (e) {
            e = e || window.event;

           if(befriend.places.placesDisplayShown()) {
               //hide places to bottom
               if(!(e.target.closest('#places'))) {
                   //do not hide on double click if activity type just clicked
                   if(timeNow() - befriend.timing.showPlaces < befriend.styles.places_transition_ms) {
                       return false;
                   }

                   befriend.places.toggleDisplayPlaces(false);
               }
           }
        });
    }
}