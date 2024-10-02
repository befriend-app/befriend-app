befriend.places = {
    data: {
        items: [],
        obj: {}
    },
    displayPlaces: function (activity_type) {
        return new Promise(async (resolve, reject) => {
            let location = befriend.location.search || befriend.location.current;

            if(!location) {
                return reject("No location");
            }

            befriend.timing.showPlaces = timeNow();

            befriend.places.toggleDisplayPlaces(true);

            befriend.places.toggleSpinner(true);

            try {
                let r = await axios.put(joinPaths(api_domain, 'activity_type', activity_type.token, 'places'), {
                    location: location,
                });

                befriend.places.setData(r.data.places);

                if(!r.data.places.length) {
                    befriend.places.toggleNoPlaces(true);
                } else {
                    await befriend.html.setPlaces();
                }
            } catch(e) { // throw if not 200 status code
                console.error(e);
            }

            befriend.places.toggleSpinner(false);

            resolve();
        });
    },
    setData: function (places) {
        //reset data

        befriend.places.data.items = [];
        befriend.places.data.obj = {};

        for(let place of places) {
            befriend.places.data.items.push(place);
            befriend.places.data.obj[place.id] = place;
        }
    },
    hidePlaces: function () {
        return new Promise(async (resolve, reject) => {
            removeClassEl('active', befriend.els.places);

            resolve();
        });
    },
    events: function () {
        return new Promise(async (resolve, reject) => {
            let back = befriend.els.places.querySelector('.back');

            back.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                removeClassEl(befriend.classes.placesShown, document.documentElement);
            });

           resolve();
        });
    },
    isPlacesShown: function () {
        return elHasClass(document.documentElement, befriend.classes.placesShown)
    },
    toggleDisplayPlaces: function (show) {
        if(show) {
            addClassEl(befriend.classes.placesShown, document.documentElement);
        } else {
            removeClassEl(befriend.classes.placesShown, document.documentElement);
        }
    },
    toggleNoPlaces: function (show) {
        if(show) {
            addClassEl('no-places-found', befriend.els.places);
        } else {
            removeClassEl('no-places-found', befriend.els.places);
        }
    },
    toggleSpinner: function (show) {
        let spinnerEl = befriend.els.places.querySelector('.spinner');

        if(show) {
            addClassEl('show', spinnerEl);
        } else {
            removeClassEl('show', spinnerEl);
        }
    },
}