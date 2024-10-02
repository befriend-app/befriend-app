befriend.events = {
    addEvents: function () {
        return new Promise(async (resolve, reject) => {
            try {
                await befriend.activities.events();
                await befriend.places.events();
                befriend.events.bodyClickHandler();
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
               if(!e.target.closest('#places')) {
                   befriend.places.toggleDisplayPlaces(false);
               }
           }


        });
    }
}