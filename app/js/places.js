befriend.places = {
    classes: {
        shown: 'display-places',
    },
    displayPlaces: function (activity_type) {
        return new Promise(async (resolve, reject) => {
            let location = befriend.location.search || befriend.location.current;

            if(!location) {
                return reject("No location");
            }

            addClassEl(befriend.places.classes.shown, document.documentElement);


            let spinnerEl = befriend.els.places.querySelector('.spinner');

            addClassEl('show', spinnerEl)

            try {
                let r = await axios.put(joinPaths(api_domain, 'activity_type', activity_type.token, 'places'), {
                    location: location,
                });

                if(!r.data.places.length) {
                    addClassEl('no-places-found', befriend.els.places);
                }

                let html = '';

                for (let place of r.data.places) {
                    let name_html = place.name;

                    html += `<div class="place">${name_html}</div>`;
                }

                befriend.els.places.querySelector('.places').innerHTML = html;

            } catch(e) { // throw if not 200 status code
                console.error(e);
            }

            removeClassEl('show', spinnerEl);

            resolve();
        });
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
                removeClassEl(befriend.places.classes.shown, document.documentElement);
            });

           resolve();
        });
    },
    placesDisplayShown: function () {
        return elHasClass(document.documentElement, befriend.places.classes.shown)
    },
    toggleDisplayPlaces: function (show) {
        if(show) {
            addClassEl(befriend.places.classes.shown, document.documentElement);
        } else {
            removeClassEl(befriend.places.classes.shown, document.documentElement);
        }
    }
}