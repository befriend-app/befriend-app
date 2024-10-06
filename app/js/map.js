befriend.map = {
    loadActivityMap: function () {
        return new Promise(async (resolve, reject) => {
            let location = befriend.location.getLocation();

            //get token to display map
            try {
                let r = await axios.get(joinPaths(api_domain, 'mapbox/token'));

                mapboxgl.accessToken = r.data.token;
            } catch(e) {
                console.error(e);
                return reject();
            }

            try {
                const map = new mapboxgl.Map({
                    container: 'activities-map',
                    style: 'mapbox://styles/mapbox/light-v10',
                    center: [location.lon, location.lat],
                    zoom: 12,
                });
            } catch(e) {
                console.error(e);
            }

           resolve();
        });
    }
};