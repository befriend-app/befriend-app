befriend.places = {
    displayPlaces: function (activity_type) {
        return new Promise(async (resolve, reject) => {
            let location = befriend.location.search || befriend.location.current;

            if(!location) {
                return reject("No location");
            }

            try {
                let r = await axios.put(joinPaths(api_domain, 'activity_type', activity_type.token, 'places'), {
                    location: location,
                });

                // debugger;
            } catch(e) { // throw if not 200 status code
                console.error(e);
            }

            resolve();
        });
    },
    hidePlaces: function () {
        return new Promise(async (resolve, reject) => {
            removeClassEl('active', befriend.els.places);

            resolve();
        });
    }
}