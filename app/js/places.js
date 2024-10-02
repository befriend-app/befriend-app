befriend.places = {
    displayPlaces: function (activity_type) {
        return new Promise(async (resolve, reject) => {
            let location = befriend.location.search || befriend.location.current;

            if(!location) {
                return reject("No location");
            }

            befriend.timing.showPlaces = timeNow();

            addClassEl(befriend.classes.placesShown, document.documentElement);

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
                    let place_html = {
                        distance: ``,
                        location: ``,
                        price: ``,
                        rating: ``,
                        full: ``
                    };

                    //location

                    if(place.location_address) {
                        place_html.location += `<div class="address">${place.location_address}</div>`;
                    }

                    if(place.location_address_2) {
                        //do not show if zip code in address_2

                        let is_postcode = place.location_address_2.includes(place.location_postcode) || isZIPFormat(place.location_address_2);

                        if(!is_postcode) {
                            //do not show if address and address_2 are too similar
                            let str_similarity = stringSimilarity(place.location_address, place.location_address_2);

                            if(str_similarity < .5) {
                                place_html.location += `<div class="address_2">${place.location_address_2}</div>`;
                            }
                        }
                    }

                    place_html.location += `<div class="locality">${place.location_locality}, ${place.location_region}</div>`;

                    //distance
                    place_html.distance = place.distance.miles_km.toFixed(1);

                    //hide trailing zero if less than 1 m/km
                    if(place.distance.miles_km < 1) {
                        place_html.distance = parseFloat(place.distance.miles_km.toFixed(1));
                    }

                    //add decimal if rounded exactly to integer
                    if(place_html.distance % 1 === 0) {
                        place_html.distance = place_html.distance.toFixed(1);
                    }

                    if(place.distance.use_km) { //km
                        //meters
                        if(place.distance.miles_km < .1) {
                            place_html.distance = place.distance.meters;
                            place_html.distance += ' meters';
                        } else {
                            place_html.distance += ' km';
                        }
                    } else { //miles
                        if(place.distance.miles_km < .1) { //feet
                            place_html.distance = metersToFeet(place.distance.meters);
                            place_html.distance += ' ft';
                        } else {
                            place_html.distance += ' m';
                        }
                    }

                    //price

                    if(place.price) {
                        let price_str = '';

                        for(let i = 0; i < place.price; i++) {
                            price_str += '$';
                        }

                        place_html.price += `<div class="price">${price_str}</div>`;
                    }

                    //rating
                    if(isNumeric(place.rating)) {
                        let rating_str = place.rating.toFixed(1);
                        let rating = parseFloat(rating_str);

                        let stars_html = ``;

                        let color = befriend.styles.brand_color_a;

                        for(let i = 1; i <= 5; i++) {
                            let percent;

                            if(rating > i) {
                                percent = 100;
                            } else {
                                let diff = i - rating;

                                if(diff > 1) {
                                    percent = 0;
                                } else {
                                    percent = (1 - diff) * 100;
                                }
                            }

                            let percent_str = percent + '%';

                            let star_html = `<div class="circle-container">
                                                <div class="fill" style="background: linear-gradient(to right, ${color} ${percent_str}, transparent ${percent_str});"></div>
                                            </div>`;

                            stars_html += star_html;
                        }

                        place_html.rating += `<div class="rating">
                                                <div class="stars">${stars_html}</div>
                                                <div class="num">${rating_str}</div>
                                             </div>`;
                    }

                    //todo
                    //reality
                    let real_html = ``;

                    //closed

                    place_html.full =
                                    `<div class="info">
                                        <div class="name">${place.name}</div>
                                        
                                         <div class="rating-price">
                                             ${place_html.rating} ${place_html.price}  
                                         </div>

                                         <div class="location">
                                             <div class="distance">${place_html.distance}</div>
                                             <div class="location-address">
                                                ${place_html.location}
                                             </div>
                                         </div>
                                    </div>
                                    
                                    <div class="use-place">
                                        <div class="button" data-place-id="${place.id}">Select</div>
                                    </div>`;

                    html += `<div class="place">${place_html.full}</div>`;
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
                removeClassEl(befriend.classes.placesShown, document.documentElement);
            });

           resolve();
        });
    },
    placesDisplayShown: function () {
        return elHasClass(document.documentElement, befriend.classes.placesShown)
    },
    toggleDisplayPlaces: function (show) {
        if(show) {
            addClassEl(befriend.classes.placesShown, document.documentElement);
        } else {
            removeClassEl(befriend.classes.placesShown, document.documentElement);
        }
    }
}