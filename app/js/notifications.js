befriend.notifications = {
    data: {
        all: {},
        current: null,
    },
    setDeviceToken: async function (token) {
        //save on server if new device token
        if (!befriend.user.sameDeviceToken(token)) {
            let platform = null;

            if (is_ios) {
                platform = 'ios';
            } else if (is_android) {
                platform = 'android';
            }

            try {
                let r = await befriend.auth.post(`/devices`, {
                    device_token: token,
                    platform: platform,
                });

                befriend.user.setDeviceToken(token);
            } catch (e) {
                console.error(e);
            }
        }
    },
    init: function () {
        return new Promise(async (resolve, reject) => {
            try {
                befriend.plugins.notifications.registerForPushNotifications(
                    function (token) {
                        befriend.notifications.setDeviceToken(token);
                        resolve();
                    },
                    function (err) {
                        console.error(err);
                        reject(err);
                    },
                );
            } catch (e) {
                console.error(e);
                return reject();
            }
        });
    },
    showActivity: async function (notification, on_launch) {
        if(!notification?.activity_token || !notification.network_token) {
            return;
        }

        if(!on_launch) {
            fireClick(document.getElementById('create-activity-back'));
        }

        //navigate to activities view
        befriend.navigateToView('activities', true);

        //get activity data
        try {
             let r = await befriend.auth.get(`/activities/${notification.activity_token}/notification`, {
                 network_token: notification.network_token
             });

             befriend.notifications.data.current = r.data;

             befriend.notifications.data.all[notification.activity_token] = r.data;

             let html = this.getViewHtml(r.data);

             let view_el = befriend.els.activities.querySelector('.notification-view').querySelector('.container');

             view_el.innerHTML = html;

             befriend.activities.views.showView('notification-view');

             befriend.styles.notifications.updateSectionsHeight();

             befriend.notifications.events.onImageModal();
             befriend.notifications.events.onAcceptDecline();
             befriend.notifications.events.onViewImage();
        } catch(e) {
            console.error(e);
        }
    },
    getViewHtml: function (data) {
        function getInvite() {
            return `<div class="invite">
                                <div class="image">
                                    ${data.activity?.activity_type?.activity_image}
                                </div>
                                
                                <div class="name-duration">
                                    <div class="name">
                                        ${data.activity?.activity_type?.notification_name} @ ${data.activity?.human_time}
                                    </div>
                                    
                                    <div class="duration">
                                        ${befriend.activities.getDurationStr(data.activity.activity_duration_min)}
                                    </div>
                                </div>
                            </div>`;
        }

        function getOverview() {
            let friends_type = '';

            if(data.activity.is_new_friends && data.activity.is_existing_friends) {
                friends_type = 'New & Existing';
            } else if(data.activity.is_new_friends) {
                friends_type = 'New';
            } else if(data.activity.is_existing_friends) {
                friends_type = 'Existing';
            }

           return  `<div class="overview">
                                <div class="friends-mode">
                                    <div class="friend-type sub-section">
                                        <div class="title">Friends</div>
                                        <div class="text">${friends_type}</div>
                                    </div>
                                        
                                    <div class="mode sub-section">
                                        <div class="title">Mode</div>
                                        <div class="text">${data.activity?.mode?.name}</div>
                                    </div>
                                    
                                    <div class="total-persons sub-section">
                                        <div class="title">Total Spots</div>
                                        <div class="text">${data.activity?.persons_qty}</div>
                                    </div>
                                    
                                    <div class="total-persons sub-section">
                                        <div class="title">Available</div>
                                        <div class="text">${data.activity?.persons_qty}</div>
                                    </div>
                                </div>
                            </div>`;
        }

        function getWho() {
            let reviews_html = befriend.user.getReviewsHtml(data.person);

            let new_member_html = '';

            if(data.person.is_new) {
                new_member_html = `<div class="new-member">New member</div>`;
            }

            return `<div class="who section">
                            <div class="label">Who</div>
                            
                            <div class="age-gender">
                                <div class="age">
                                    <div class="icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 433.2848 484.2606"><path d="M389.6874,441.4878H37.5974c-3.8212,0-6.9189-3.0977-6.9189-6.9189v-150.8947c0-3.8212,3.0977-6.9189,6.9189-6.9189s6.9189,3.0977,6.9189,6.9189v143.9758h338.2521v-143.9758c0-3.8212,3.0977-6.9189,6.9189-6.9189s6.9189,3.0977,6.9189,6.9189v150.8947c0,3.8212-3.0977,6.9189-6.9189,6.9189Z"/><path d="M235.6515,189.9989c-3.8212,0-6.9189-3.0977-6.9189-6.9189v-87.0123h-30.1803v87.0123c0,3.8212-3.0977,6.9189-6.9189,6.9189s-6.9189-3.0977-6.9189-6.9189v-87.6627c.0076-7.2915,5.9167-13.2006,13.2082-13.2082h31.4326c7.2942.0038,13.2075,5.914,13.2151,13.2082v87.6627c0,3.8212-3.0977,6.9189-6.9189,6.9189Z"/><path d="M213.6424,76.8262c-13.9946-.0152-25.3357-11.3563-25.3509-25.3509,0-11.0703,14.7304-39.597,19.2415-48.0865,2.1068-3.3741,6.5501-4.4015,9.9242-2.2946.9294.5804,1.7142,1.3652,2.2946,2.2946,4.5111,8.4895,19.2415,37.0439,19.2415,48.0865-.0153,13.9946-11.3563,25.3356-25.3509,25.3509ZM213.6424,21.9246c-5.104,9.3088-8.9742,19.2425-11.5131,29.5507.0048,6.3585,5.1633,11.5092,11.5218,11.5044,6.3517-.0048,11.4996-5.1527,11.5044-11.5044-2.5388-10.3082-6.4091-20.2419-11.5131-29.5507Z"/><path d="M213.6424,96.1092c-3.8212,0-6.9189-3.0977-6.9189-6.9189v-19.283c0-3.8212,3.0977-6.9189,6.9189-6.9189s6.9189,3.0977,6.9189,6.9189v19.283c0,3.8212-3.0977,6.9189-6.9189,6.9189Z"/><path d="M280.7559,290.5931c-13.8526.1544-27.2732-4.8185-37.6804-13.9624-16.7421-14.924-42.0134-14.924-58.7555,0-21.6794,18.6154-53.7022,18.6154-75.3816,0-16.7603-14.9319-42.0506-14.9319-58.8108,0-6.0497,5.0154-12.9482,8.9075-20.3693,11.4923-5.6912,1.7797-11.8893.7527-16.7023-2.7676-4.7582-3.4634-7.5596-9.0044-7.5278-14.8895v-55.9533c.0267-21.1726,17.1859-38.3287,38.3585-38.3516h339.5114c21.1726.0229,38.3318,17.1789,38.3585,38.3516v55.9533c.0281,5.891-2.7814,11.4354-7.5486,14.8964-4.7969,3.552-11.0089,4.5818-16.6954,2.7676-7.4116-2.584-14.3007-6.4738-20.3416-11.4854-16.7342-14.917-41.9936-14.917-58.7278,0-10.411,9.1404-23.8341,14.1085-37.6873,13.9485ZM213.6908,251.605c13.8526-.1544,27.2732,4.8185,37.6804,13.9624,16.7456,14.9219,42.0168,14.9219,58.7624,0,21.6638-18.6152,53.6763-18.6152,75.3401,0,4.8033,4.0515,10.2874,7.2188,16.1972,9.3544,1.4777.4809,3.0963.2236,4.352-.6919,1.2053-.8632,1.9131-2.2607,1.8958-3.7431v-55.9741c-.0191-13.5333-10.9873-24.4985-24.5206-24.5137H43.8867c-13.5334.0152-24.5016,10.9804-24.5206,24.5137v55.9533c-.0131,1.4779.6909,2.8706,1.8889,3.7362,1.259.92,2.884,1.1775,4.3658.6919,5.92-2.1349,11.4137-5.3046,16.2249-9.3613,10.4118-9.1453,23.8372-14.1183,37.6943-13.9624,13.8571-.1559,27.2825,4.817,37.6943,13.9624,16.7478,14.9229,42.0215,14.9229,58.7693,0,10.4147-9.1318,23.8371-14.0921,37.6873-13.9278Z"/><path d="M389.6874,375.4744c-14.3104.1994-28.2237-4.7066-39.2441-13.8378-18.0802-15.0518-44.3284-15.0518-62.4087,0-22.8872,18.4852-55.5733,18.4852-78.4605,0-18.0659-15.0482-44.3013-15.0482-62.3671,0-11.0167,9.1282-24.9246,14.0339-39.2303,13.8378-14.3022.2001-28.207-4.7063-39.2164-13.8378-8.6599-7.452-19.7533-11.4674-31.1767-11.2848-3.8212,0-6.9189-3.0977-6.9189-6.9189s3.0977-6.9189,6.9189-6.9189c14.3022-.2001,28.207,4.7063,39.2164,13.8378,18.0659,15.0482,44.3013,15.0482,62.3671,0,22.8828-18.483,55.5639-18.483,78.4467,0,18.0713,15.0476,44.3097,15.0476,62.381,0,22.8979-18.4843,55.5903-18.4843,78.4882,0,8.6684,7.4561,19.7719,11.4716,31.2043,11.2848,3.8212,0,6.9189,3.0977,6.9189,6.9189s-3.0977,6.9189-6.9189,6.9189Z"/><path d="M420.3658,484.2606H6.9189c-3.8212,0-6.9189-3.0977-6.9189-6.9189v-28.5129c.0114-11.692,9.4868-21.1674,21.1788-21.1788h384.9271c11.692.0115,21.1673,9.4868,21.1788,21.1788v28.5129c0,3.8212-3.0977,6.9189-6.9189,6.9189ZM13.8378,470.4227h399.6091v-21.594c-.0038-4.0527-3.2882-7.3372-7.341-7.341H21.1788c-4.0527.0038-7.3371,3.2882-7.341,7.341v21.594Z"/></svg>
                                    </div>
                                    <div class="text">${data.person.age}</div>
                                </div>
                                
                                <div class="gender">
                                    <div class="icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 495.114 512.0002"><path d="M454.451,247.8192h-.073c-13.284,0-24.795,7.735-30.268,18.937l-45.856-45.857c17.131-27.83,24.362-61.106,20.364-93.722-4.077-33.256-19.752-64.327-44.138-87.49C327.157,13.7342,291.226-.3898,253.256.0082c-37.944.367-73.621,15.142-100.462,41.604-10.967,10.813-19.99,23.062-26.911,36.323C55.163,85.8582,0,146.0072,0,218.8132c0,32.31,11.16,63.918,31.423,89.001,2.604,3.224,7.329,3.728,10.556,1.122,3.225-2.605,3.728-7.331,1.122-10.556-18.113-22.421-28.088-50.678-28.088-79.567,0-62.004,44.747-113.739,103.639-124.638-4.224,11.334-7.025,23.223-8.298,35.451-36.733,12.982-63.124,48.058-63.124,89.187,0,52.13,42.411,94.54,94.539,94.54,27.254,0,51.841-11.602,69.109-30.114,9.004,2.857,18.299,4.846,27.752,5.888,2.697.297,5.398.511,8.1.656-18.324,27.087-46.928,46.927-80.842,53.471-3.532.681-6.084,3.773-6.084,7.37v39.504c0,4.146,3.36,7.506,7.506,7.506h20.567c9.961,0,18.065,8.091,18.065,18.035,0,9.961-8.104,18.065-18.065,18.065h-20.567c-4.146,0-7.506,3.36-7.506,7.506v37.702c0,4.837-1.871,9.371-5.262,12.763-3.414,3.406-7.95,5.283-12.773,5.283-9.962,0-18.065-8.095-18.065-18.045v-37.703c0-4.146-3.36-7.506-7.506-7.506h-20.567c-9.951,0-18.045-8.104-18.045-18.065,0-9.944,8.095-18.035,18.045-18.035h20.567c4.146,0,7.506-3.36,7.506-7.506v-39.504c0-3.597-2.552-6.689-6.084-7.37-18.301-3.531-35.248-10.904-50.374-21.912-3.35-2.439-8.046-1.702-10.485,1.652-2.44,3.351-1.701,8.046,1.652,10.485,15.232,11.086,32.121,18.877,50.28,23.205v25.938h-13.061c-18.228,0-33.058,14.825-33.058,33.047,0,18.239,14.83,33.078,33.058,33.078h13.061v30.195c0,18.228,14.839,33.058,33.078,33.058,8.827,0,17.13-3.434,23.384-9.674,6.232-6.233,9.664-14.538,9.664-23.384v-30.195h13.061c18.239,0,33.078-14.839,33.078-33.078,0-18.222-14.839-33.047-33.078-33.047h-13.063v-25.94c38.689-9.24,70.649-34.11,89.68-67.038,23.34-1.609,46.152-8.808,66.098-21.086l45.857,45.858c-11.203,5.476-18.938,17.003-18.938,30.34,0,18.561,15.102,33.663,33.664,33.663h73.501c12.922,0,23.435-10.513,23.435-23.435v-73.502c0-18.561-15.101-33.663-33.663-33.663h0ZM141.768,298.3412c-43.851,0-79.527-35.676-79.527-79.528,0-32.4,19.481-60.307,47.33-72.694.301,38.311,15.34,74.264,42.476,101.402,12.571,12.57,27.343,22.659,43.415,29.846-14.159,13-33.002,20.974-53.694,20.974ZM473.102,354.9842c0,4.644-3.779,8.422-8.422,8.422h-73.501c-10.284,0-18.651-8.366-18.651-18.724,0-10.284,8.367-18.65,18.651-18.65,3.036,0,5.773-1.829,6.935-4.634s.52-6.033-1.626-8.181l-55.471-55.471c-2.831-2.831-6.565-4.295-10.347-4.295-2.669,0-5.364.729-7.782,2.223-24.487,15.123-53.823,21.712-82.611,18.531-29.64-3.269-56.478-16.167-77.611-37.301-24.69-24.689-38.218-57.515-38.095-92.432.124-34.913,13.891-67.646,38.764-92.169,49.205-48.512,130.719-49.308,180.808-1.732,21.866,20.77,35.922,48.625,39.575,78.432,3.594,29.313-2.921,59.211-18.346,84.187-3.608,5.845-2.756,13.3,2.072,18.129l55.47,55.47c2.147,2.146,5.374,2.788,8.181,1.626,2.805-1.161,4.634-3.899,4.634-6.935,0-10.284,8.366-18.65,18.65-18.65h.073c10.284,0,18.65,8.366,18.65,18.65v73.504Z"/><path d="M343.921,122.2012c-4.088.689-6.844,4.561-6.155,8.649,4.532,26.895-4.259,54.448-23.517,73.705-9.013,9.014-19.581,15.54-30.845,19.611.068-1.778.114-3.56.114-5.352,0-59.901-37.337-111.238-89.953-131.97.484-.508.951-1.026,1.449-1.524,32.873-32.873,86.362-32.873,119.235,0,4.909,4.909,9.192,10.386,12.729,16.279,2.134,3.555,6.744,4.705,10.3,2.572,3.554-2.134,4.706-6.745,2.572-10.3-4.168-6.943-9.21-13.392-14.985-19.168-38.728-38.726-101.74-38.726-140.468,0-38.726,38.727-38.726,101.74,0,140.468,19.364,19.363,44.798,29.045,70.234,29.045s50.87-9.682,70.234-29.045c22.685-22.686,33.041-55.14,27.704-86.815-.688-4.088-4.552-6.843-8.648-6.155h0ZM170.367,144.6202c29.757,11.514,50.929,40.415,50.929,74.193,0,1.175-.034,2.342-.087,3.504-9.516-4.097-18.434-10.002-26.194-17.763-16.518-16.517-24.729-38.238-24.648-59.934ZM235.938,227.1062c.239-2.734.37-5.498.37-8.293,0-41.627-27.039-77.044-64.467-89.64,1.983-10.5,5.974-20.687,11.957-29.954,49.287,17.38,84.707,64.424,84.707,119.593,0,3.122-.125,6.219-.351,9.293-10.685,1.724-21.634,1.39-32.216-.999h0Z"/></svg>
                                    </div>
                                    <div class="text">${data.person.gender?.gender_name}</div>
                                </div>
                            </div>
                                
                            <div class="content">
                                <div class="name-image">
                                    <div class="name">${data.person.first_name}</div>
                                    <div class="image" style="background-image: url(${data.person.image_url})" data-image-url="${data.person.image_url}"></div>
                                </div>
                                
                                <div class="reviews">
                                    ${new_member_html}
                                    <div class="count">${data.person.reviews.count} review${data.person.reviews.count !== 1 ? 's' : ''}</div>
                                    ${reviews_html}
                                </div>
                            </div>
                        </div>`;
        }

        function getPlace() {
            let rating_price = `
        <div class="rating-price">
            <div class="rating">${befriend.places.activity.html.getRating(data.activity.place)}</div>
            <div class="price">${befriend.places.activity.html.getPrice(data.activity.place)}</div>
        </div>`;

            let distance_km = calculateDistance(
                befriend.location.device,
                {
                    lat: data.activity.location_lat,
                    lon: data.activity.location_lon
                },
                true
            );

            let distance_miles = distance_km * kms_per_mile;

            let distance_str = '';

            if(useKM()) {
                distance_str = `${formatRound(distance_km)} km`;
            } else {
                distance_str = `${formatRound(distance_miles)} m`;
            }

            return `<div class="place section">
                                <div class="label">Place</div> 
                                
                                <div class="content">
                                    <div class="name">${data.activity?.location_name} 
                                        <div class="distance">
                                        (${distance_str})
                                        </div>
                                    </div>
                                    
                                    ${rating_price}
                                    
                                    <div class="address-container">
                                        ${befriend.places.getPlaceLocation(data.activity)}
                                    </div>
                                </div>
                           </div>`;
        }

        function getDate() {
            let date = getFriendlyDateFromString(data.activity.human_date);

            if(isToday(data.activity.activity_start)) {
                date = 'Today';
            } else if(isTomorrow(data.activity.activity_start)) {
                date = 'Tomorrow';
            }

            return date;
        }

        function getMatching() {
            function getItemTags(item) {
                let tags_html = '';

                let match_types = item.match?.types;

                if(!match_types) {
                    return '';
                }

                const heart_svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 439.9961">
                                        <path class="outline" d="M240,422.9023c-29.3828-16.2148-224-129.4961-224-282.9023,0-66.0547,54.1992-124,116-124,41.8672.0742,80.4609,22.6602,101.0312,59.1289,1.5391,2.3516,4.1602,3.7656,6.9688,3.7656s5.4297-1.4141,6.9688-3.7656c20.5703-36.4688,59.1641-59.0547,101.0312-59.1289,61.8008,0,116,57.9453,116,124,0,153.4062-194.6172,266.6875-224,282.9023Z"></path>
                                    </svg>`;

                const myPos = item.match?.mine?.favorite?.position;
                const theirPos = item.match?.theirs?.favorite?.position;
                const myImportance = item.match?.mine?.importance;
                const theirImportance = item.match?.theirs?.importance;

                if(match_types.their_filter) {
                    let importance = ``;

                    if(theirImportance) {
                        importance = `<div class="importance">${theirImportance}</div>`
                    }

                    tags_html += `<div class="tag their-filter">
                                        ${importance}
                                        Their Filter
                                    </div>`;
                }

                if(match_types.their_item) {
                    let favorite_heart = '';

                    if(theirPos) {
                        favorite_heart = `<div class="favorite">
                                                <div class="position">${theirPos}</div>
                                                ${heart_svg}
                                           </div>`
                    }

                    tags_html += `<div class="tag their-item">
                                    ${favorite_heart}
                                    Their Item
                                    </div>`;
                }

                if(match_types.my_filter) {
                    let importance = ``;

                    if(myImportance) {
                        importance = `<div class="importance">${myImportance}</div>`
                    }

                    tags_html += `<div class="tag my-filter">
                                    ${importance}
                                    My Filter
                                  </div>`;
                }

                if(match_types.my_item) {
                    let favorite_heart = '';

                    if(myPos) {
                        favorite_heart = `<div class="favorite">
                                                <div class="position">${myPos}</div>
                                                ${heart_svg}
                                           </div>`
                    }

                    tags_html += `<div class="tag my-item">
                                    ${favorite_heart}
                                    My Item
                                    </div>`;
                }

                if(tags_html) {
                    return `<div class="tags">${tags_html}</div>`;
                }

                return '';
            }

            function getItemSecondary(item) {
                try {
                    let sectionConfig = befriend.filters.sections[item.section]?.config;

                    let secondary_extra = '';

                    if (sectionConfig?.tabs) {
                        const tab = sectionConfig.tabs.find(t => t.key === item.table_key);

                        if (tab) {
                            secondary_extra = tab.secondary?.extra;
                        }
                    } else {
                        secondary_extra = sectionConfig.secondary?.extra;
                    }

                    let match = item.match;
                    let myItemSecondary = match?.mine?.secondary?.item;
                    let theirItemSecondary = match?.their?.secondary?.item;
                    let myFilterSecondary = match?.mine?.secondary?.filter;
                    let theirFilterSecondary = match?.theirs?.secondary?.filter;

                    let html = '';

                    let secondary_html = '';

                    if(myItemSecondary && theirItemSecondary && myItemSecondary === theirItemSecondary) {
                        secondary_html = `${myItemSecondary} ${secondary_extra}`;
                    } else if(myFilterSecondary && theirItemSecondary && myFilterSecondary.includes(theirItemSecondary)) {
                        secondary_html = `${theirItemSecondary} ${secondary_extra}`;
                    } else if(theirFilterSecondary && myItemSecondary && theirFilterSecondary.includes(myItemSecondary)) {
                        secondary_html = `${myItemSecondary} ${secondary_extra}`;
                    }

                    if(secondary_html) {
                        html = `<div class="secondary">${secondary_html}</div>`;
                    }

                    return html;
                } catch(e) {
                    console.error(e);
                    return '';
                }
            }

            function getHtml() {
                let items = data.matching.items;

                const groupedMatches = Object.values(items).reduce((acc, item) => {
                    if (!acc[item.section]) {
                        acc[item.section] = {
                            tableGroups: {},
                            favorites: 0,
                            total: 0
                        }
                    }

                    const section = acc[item.section];
                    const tableKey = item.table_key || 'default';

                    if (!section.tableGroups[tableKey]) {
                        section.tableGroups[tableKey] = {
                            items: [],
                            key: tableKey
                        };
                    }

                    section.tableGroups[tableKey].items.push(item);

                    //sort items by favorite position
                    section.tableGroups[tableKey].items.sort((a, b) => {
                        let aPosition = a.match.mine.favorite.position;
                        let bPosition = b.match.mine.favorite.position;

                        const posA = isNumeric(aPosition) ? aPosition : 9999;
                        const posB = isNumeric(bPosition) ? bPosition : 9999;
                        return posA - posB;
                    });

                    if (item.totals?.mine) {
                        section.favorites = item.totals.mine.favorite || 0;
                        section.total = item.totals.mine.all || 0;
                    }

                    return acc;
                }, {});

                if (Object.keys(groupedMatches).length === 0) {
                    return `<div class="no-items">No matching items</div>`;
                }

                //sort sections by number of favorites/items (mine)
                const sortedSections = Object.entries(groupedMatches).sort(([,a], [,b]) => {
                    if (a.favorites !== b.favorites) {
                        return b.favorites - a.favorites;
                    }

                    return b.total - a.total;
                });

                let html = '';

                for(let [sectionKey, sectionOrganized] of sortedSections) {
                    let section = befriend.filters.sections[sectionKey];
                    let sectionName = section?.name || sectionKey.capitalize();
                    const sectionConfig = section?.config;
                    let showTableHeader = false;

                    let tableGroupsHtml = '';

                    const sortedTableGroups = Object.entries(sectionOrganized.tableGroups);

                    for (let [tableKey, tableGroup] of sortedTableGroups) {
                        let tableKeyName = tableKey;

                        if (sectionConfig?.tabs) {
                            const tab = sectionConfig.tabs.find(t => t.key === tableKey);

                            if (tab) {
                                tableKeyName = tab.name;
                            }

                            if(sectionConfig.tabs.length) {
                                showTableHeader = true;
                            }
                        }

                        let itemsHtml = '';

                        for(let item of tableGroup.items) {
                            let tags = getItemTags(item);
                            let secondary = getItemSecondary(item);

                            itemsHtml += `<div class="matching-item">
                                            <div class="matching-name">
                                                <div class="name">${item.name}</div>
                                                ${secondary}

                                            </div>
                                            
                                            ${tags}
                                        </div>`;
                        }

                        tableGroupsHtml += `<div class="matching-table-group">
                                                ${showTableHeader ? `<div class="table-key-header">${tableKeyName}</div>` : ''}
                                                <div class="matching-items">
                                                    ${itemsHtml}
                                                </div>
                                            </div>`;
                    }

                    html += `<div class="matching-group">
                                <div class="title">
                                    <div class="icon">${section.icon}</div>
                                    <div class="name">${sectionName}</div>    
                                </div>
                                
                                <div class="matching-table-groups">
                                    ${tableGroupsHtml}
                                </div>
                            </div>`;
                }

                return `<div class="matching-overview">
                            <div class="count">${data.matching.count} item${data.matching.count > 1 ? 's' : ''}</div>
                            <div class="score">
                                <div class="text">Score</div>
                                <div class="number">${numberWithCommas(data.matching.total_score, true)}</div>
                            </div>
                        </div>
                        
                        <div class="matching-groups">${html}</div>`;

            }

            return `<div class="matching section">
                            <div class="label">Matching</div>
                            <div class="content">
                                ${getHtml()}
                            </div>
                        </div>`;
        }

        console.log(data);

        let date = getDate();

        let invite_html = getInvite();

        let overview_html = getOverview();

        let who_html = getWho();

        let place_html = getPlace();

        let matching_html = getMatching();

        return `<div class="notification">
                    <h2>Invitation <div class="date">${date}</div></h2>
                    
                    <div class="accept-decline">
                        <div class="button accept">Accept</div>
                        <div class="button decline">Decline</div>
                    </div>
                    
                    ${invite_html}
                    
                    <div class="notification-wrapper">
                        ${overview_html}
                        
                        <div class="sections-wrapper">
                            <div class="sections">
                                ${who_html}
                                ${place_html}
                                ${matching_html}
                            </div>
                        </div>
                    </div>
                </div>`;
    },
    showNotificationBar: function () {

    },
    openModal: function(imageUrl) {
        let modal_el = document.getElementById('person-image-modal');
        let modal_image_el = modal_el.querySelector('img');
        modal_image_el.src = imageUrl;
        addClassEl('active', modal_el);
        document.body.style.overflow = 'hidden';
    },
    closeModal: function() {
        let modal_el = document.getElementById('person-image-modal');
        removeClassEl('active', modal_el);
        document.body.style.overflow = '';
    },
    events: {
        init: function () {
            return new Promise(async (resolve, reject) => {
                befriend.notifications.events.onLaunched();
                befriend.notifications.events.onNotification();
                resolve();
            });
        },
        onLaunched: function () {
            try {
                befriend.plugins.notifications.onLaunchNotification(async function (notification) {
                    window.launched_from_notification = true;

                    //wait for init to be finished
                    await befriend.initFinished();

                    console.log("after init finished")

                    befriend.notifications.showActivity(notification, true);

                    removeClassEl('loading', document.body);

                    if (notification) {
                        console.log('App was launched from notification:', notification);
                    }
                });
            } catch (e) {
                console.error(e);
            }
        },
        onNotification: function () {
            try {
                befriend.plugins.notifications.onNotificationReceived(function (notification) {
                    console.log('Received notification:', notification);

                    if (notification?.type === 'click') {
                        befriend.notifications.showActivity(notification.notification);
                    } else {
                        //show in-app notification
                        befriend.notifications.showNotificationBar();

                        //tmp - todo remove
                        befriend.notifications.showActivity(notification);
                    }
                });
            } catch (e) {
                console.error(e);
            }
        },
        onAcceptDecline: function () {

        },
        onViewImage: function () {
            let image_el = befriend.els.activityNotificationView.querySelector('.who').querySelector('.image');

            if(image_el._listener) {
                return;
            }

            image_el._listener = true;

            image_el.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();

                let url = image_el.getAttribute('data-image-url');

                befriend.notifications.openModal(url)
            });
        },
        onImageModal: function () {
            let modal_el = document.getElementById('person-image-modal');

            if(modal_el._listener) {
                return;
            }

            modal_el._listener = true;

            let modal_image_el = modal_el.querySelector('img');

            modal_el.addEventListener('click', (e) => {
                befriend.notifications.closeModal();
            });

            modal_image_el.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        },
    },
};
