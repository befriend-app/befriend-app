befriend.notifications = {
    data: {
        all: {},
        networks: {}, //store one-time data in local storage and merge with all
        removed: {},
        current: null,
        setData: function(data) {
            befriend.notifications.data.all = data;

            for(let activity_token in data) {
                let notification = data[activity_token];

                if(activity_token in this.networks) {
                    if(!notification.person) {
                        notification.person = {};
                    }

                    notification.person = {
                        ...notification.person,
                        ...this.networks[activity_token],
                    }
                }
            }
        },
    },
    messages: {
        unavailable: 'Unavailable: max spots reached',
    },
    setDeviceToken: async function (token, force_update) {
        //save on server if new device token
        if (!befriend.user.sameDeviceToken(token) || force_update) {
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
                await befriend.notifications.getDeviceToken();

                resolve();
            } catch (e) {
                console.error(e);
                return reject();
            }
        });
    },
    getDeviceToken: async function (force_update) {
        return new Promise(async (resolve, reject) => {
            try {
                befriend.plugins.notifications.registerForPushNotifications(
                    function (token) {
                        befriend.notifications.setDeviceToken(token, force_update);
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
    fetchActivity: function (notification, auto_back) {
        return new Promise(async (resolve, reject) => {
            if(!notification?.activity_token) {
                return resolve();
            }

            if(auto_back) {
                befriend.activities.createActivity.backButton();
            }

            //navigate to activities view
            befriend.navigateToView('activities', true, true);

            //get activity data
            try {
                let activityData;

                if(notification.access?.token) {
                    let r = await befriend.networks.get(
                        notification.access.domain,
                        `activities/networks/notifications/${notification.activity_token}/${notification.access.token}`,
                        {
                            person_token: befriend.getPersonToken()
                        }
                    );

                    activityData = r.data;

                    //save one-time data to local storage
                    if(activityData.person?.first_name) {
                        befriend.notifications.data.networks[notification.activity_token] = {
                            first_name: activityData.person.first_name,
                            image_url: activityData.person.image_url
                        }

                        befriend.user.setLocal('notifications.networks', befriend.notifications.data.networks)
                    } else if(notification.activity_token in befriend.notifications.data.networks) {
                        // merge with previously saved local storage information
                        activityData.person = {
                            ...activityData.person,
                            ...befriend.notifications.data.networks[notification.activity_token]
                        }
                    }
                } else {
                    let r = await befriend.auth.get(`/activities/${notification.activity_token}/notification`);

                    activityData = r.data;
                }

                activityData.enriched = true;

                befriend.notifications.data.all[notification.activity_token] = activityData;

                //update main activities view with new notifications data
                befriend.activities.setView();

                //show current notification view
                befriend.notifications.showActivity(notification.activity_token, true);
            } catch(e) {
                console.error(e);
            }

            resolve();
        });
    },
    showActivity: async function (activity_token, skip_enrich) {
        if(!activity_token) {
            return;
        }

        try {
            let activity_data = befriend.notifications.data.all[activity_token];

            if(!activity_data) {
                console.warn('No activity found');
                return ;
            }

            if(!activity_data.enriched && !skip_enrich) {
                return befriend.notifications.fetchActivity(activity_data);
            }

            befriend.notifications.data.current = activity_data;

            let html = this.getViewHtml(activity_data);

             let view_el = befriend.els.activityNotificationView.querySelector('.container');

             view_el.innerHTML = html;

             //if notification is in the past
            if(timeNow(true) > activity_data.activity.activity_end) {
                befriend.notifications.showUnavailable('This activity is in the past', true);
            }

             //show view
             removeClassEl('show', befriend.els.mainActivitiesView);
             removeClassEl('show', befriend.els.currentActivityView);
             addClassEl('show', befriend.els.activityNotificationView);

             befriend.styles.notifications.updateSectionsHeight();

             befriend.notifications.events.onBack();
             befriend.notifications.events.onAccept();
             befriend.notifications.events.onDecline();
             befriend.notifications.events.onViewImage();
        } catch(e) {
            console.error(e);
        }
    },
    getViewHtml: function (notification) {
        function getInvite() {
            return `<div class="invite">
                                <div class="image">
                                    ${notification.activity?.activity_type?.activity_image}
                                </div>
                                
                                <div class="name-duration">
                                    <div class="name">
                                        ${notification.activity?.activity_type?.notification_name} @ ${notification.activity?.human_time}
                                    </div>
                                    
                                    <div class="duration">
                                        ${befriend.activities.getDurationStr(notification.activity.activity_duration_min)}
                                    </div>
                                </div>
                            </div>`;
        }

        function getOverview() {
            let friends_type = '';

            if(notification.activity.is_new_friends && notification.activity.is_existing_friends) {
                friends_type = 'Both';
            } else if(notification.activity.is_new_friends) {
                friends_type = 'New';
            } else if(notification.activity.is_existing_friends) {
                friends_type = 'Existing';
            }

            let selected_mode = befriend.modes.options.find(mode => mode.id === notification.activity?.mode?.token);
            let mode_icon_html = '';

            if(selected_mode) {
                mode_icon_html = `<div class="icon">${selected_mode.icon}</div>`;
            }

           return  `<div class="overview">
                                <div class="friends-mode">
                                    <div class="mode sub-section">
                                        <div class="title">Mode</div>
                                        <div class="text">
                                            ${mode_icon_html}
                                            ${notification.activity?.mode?.name}
                                        </div>
                                    </div>
                                    
                                    <div class="friend-type sub-section">
                                        <div class="title">Friends</div>
                                        <div class="text">${friends_type}</div>
                                    </div>
                                    
                                    <div class="total-persons sub-section">
                                        <div class="title">Total Spots</div>
                                        <div class="text">${notification.activity?.persons_qty}</div>
                                    </div>
                                    
                                    <div class="available-persons sub-section">
                                        <div class="title">Available</div>
                                        <div class="text">
                                            <div class="new"></div>
                                            <div class="current">${notification.activity?.persons_qty}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>`;
        }

        function getNetwork() {
            let network = notification.network;

            if(!network) {
                return '';
            }

            return `<div class="network section">
                                <div class="label">Network</div> 
                                
                                <div class="content">
                                    <div class="verification-status ${network.verified ? 'verified' : 'unverified'}">${network.verified ? 'Verified' : 'Unverified'}</div>

                                    <div class="logo-name">
                                        <div class="logo" style="background-image: url(${network.icon})"></div>
                                        <div class="name">${network.name}</div>
                                    </div>
                                    
                                    <div class="website">
                                        <a href="${network.website}" target="_blank">Website</a>
                                    </div>
                                </div>
                           </div>`;
        }

        function getWho() {
            let reviews_html = befriend.user.getReviewsHtml(notification.person, true);

            let match_type_html = '';

            if(notification.matching?.total_score >= notification.matching?.thresholds?.ultra) {
                match_type_html = `<div class="tag match-type ultra">Ultra match</div>`
            } else if(notification.matching?.total_score >= notification.matching?.thresholds?.super) {
                match_type_html = `<div class="tag match-type super">Super match</div>`
            }

            let new_member_html = '';

            if(notification.person.is_new) {
                new_member_html = `<div class="tag new-member">New member</div>`;
            }

            let partner_kids_html = '';

            let mode = notification.activity.mode;

            if(['mode-partner', 'mode-kids'].includes(mode?.token)) {
                let title = '';
                let content = '';

                if(mode.token === 'mode-partner') {
                    title = 'Partner';

                    if(mode.partner?.gender?.name) {
                        content = `<div class="partner">${mode.partner.gender.name}</div>`;
                    }
                } else if(mode.token === 'mode-kids') {
                    title = 'Kids';

                    let kids_html = '';

                    for(let k in (mode.kids || {})) {
                        let kid = mode.kids[k];

                        let qty_html = '';

                        if(kid.qty > 1) {
                            qty_html = `<div class="qty">${kid.qty}</div>`;
                        }

                        kids_html += `<div class="kid-tag ${kid.gender?.token}">
                                ${qty_html}
                                <div class="name">${kid.age?.name}</div>
                             </div>`;
                    }

                    if(kids_html) {
                        content = `<div class="kids">${kids_html}</div>`;
                    }
                }

                if(content) {
                    partner_kids_html = `<div class="partner-kids">
                                        <div class="partner-kids-title">${title}</div>
                                        <div class="partner-kids-content">${content}</div>                    
                                    </div>`;
                }
            }

            return `<div class="who section">
                            <div class="label">Who</div>
                            
                            <div class="age-gender">
                                <div class="age">
                                    <div class="icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 433.2848 484.2606"><path d="M389.6874,441.4878H37.5974c-3.8212,0-6.9189-3.0977-6.9189-6.9189v-150.8947c0-3.8212,3.0977-6.9189,6.9189-6.9189s6.9189,3.0977,6.9189,6.9189v143.9758h338.2521v-143.9758c0-3.8212,3.0977-6.9189,6.9189-6.9189s6.9189,3.0977,6.9189,6.9189v150.8947c0,3.8212-3.0977,6.9189-6.9189,6.9189Z"/><path d="M235.6515,189.9989c-3.8212,0-6.9189-3.0977-6.9189-6.9189v-87.0123h-30.1803v87.0123c0,3.8212-3.0977,6.9189-6.9189,6.9189s-6.9189-3.0977-6.9189-6.9189v-87.6627c.0076-7.2915,5.9167-13.2006,13.2082-13.2082h31.4326c7.2942.0038,13.2075,5.914,13.2151,13.2082v87.6627c0,3.8212-3.0977,6.9189-6.9189,6.9189Z"/><path d="M213.6424,76.8262c-13.9946-.0152-25.3357-11.3563-25.3509-25.3509,0-11.0703,14.7304-39.597,19.2415-48.0865,2.1068-3.3741,6.5501-4.4015,9.9242-2.2946.9294.5804,1.7142,1.3652,2.2946,2.2946,4.5111,8.4895,19.2415,37.0439,19.2415,48.0865-.0153,13.9946-11.3563,25.3356-25.3509,25.3509ZM213.6424,21.9246c-5.104,9.3088-8.9742,19.2425-11.5131,29.5507.0048,6.3585,5.1633,11.5092,11.5218,11.5044,6.3517-.0048,11.4996-5.1527,11.5044-11.5044-2.5388-10.3082-6.4091-20.2419-11.5131-29.5507Z"/><path d="M213.6424,96.1092c-3.8212,0-6.9189-3.0977-6.9189-6.9189v-19.283c0-3.8212,3.0977-6.9189,6.9189-6.9189s6.9189,3.0977,6.9189,6.9189v19.283c0,3.8212-3.0977,6.9189-6.9189,6.9189Z"/><path d="M280.7559,290.5931c-13.8526.1544-27.2732-4.8185-37.6804-13.9624-16.7421-14.924-42.0134-14.924-58.7555,0-21.6794,18.6154-53.7022,18.6154-75.3816,0-16.7603-14.9319-42.0506-14.9319-58.8108,0-6.0497,5.0154-12.9482,8.9075-20.3693,11.4923-5.6912,1.7797-11.8893.7527-16.7023-2.7676-4.7582-3.4634-7.5596-9.0044-7.5278-14.8895v-55.9533c.0267-21.1726,17.1859-38.3287,38.3585-38.3516h339.5114c21.1726.0229,38.3318,17.1789,38.3585,38.3516v55.9533c.0281,5.891-2.7814,11.4354-7.5486,14.8964-4.7969,3.552-11.0089,4.5818-16.6954,2.7676-7.4116-2.584-14.3007-6.4738-20.3416-11.4854-16.7342-14.917-41.9936-14.917-58.7278,0-10.411,9.1404-23.8341,14.1085-37.6873,13.9485ZM213.6908,251.605c13.8526-.1544,27.2732,4.8185,37.6804,13.9624,16.7456,14.9219,42.0168,14.9219,58.7624,0,21.6638-18.6152,53.6763-18.6152,75.3401,0,4.8033,4.0515,10.2874,7.2188,16.1972,9.3544,1.4777.4809,3.0963.2236,4.352-.6919,1.2053-.8632,1.9131-2.2607,1.8958-3.7431v-55.9741c-.0191-13.5333-10.9873-24.4985-24.5206-24.5137H43.8867c-13.5334.0152-24.5016,10.9804-24.5206,24.5137v55.9533c-.0131,1.4779.6909,2.8706,1.8889,3.7362,1.259.92,2.884,1.1775,4.3658.6919,5.92-2.1349,11.4137-5.3046,16.2249-9.3613,10.4118-9.1453,23.8372-14.1183,37.6943-13.9624,13.8571-.1559,27.2825,4.817,37.6943,13.9624,16.7478,14.9229,42.0215,14.9229,58.7693,0,10.4147-9.1318,23.8371-14.0921,37.6873-13.9278Z"/><path d="M389.6874,375.4744c-14.3104.1994-28.2237-4.7066-39.2441-13.8378-18.0802-15.0518-44.3284-15.0518-62.4087,0-22.8872,18.4852-55.5733,18.4852-78.4605,0-18.0659-15.0482-44.3013-15.0482-62.3671,0-11.0167,9.1282-24.9246,14.0339-39.2303,13.8378-14.3022.2001-28.207-4.7063-39.2164-13.8378-8.6599-7.452-19.7533-11.4674-31.1767-11.2848-3.8212,0-6.9189-3.0977-6.9189-6.9189s3.0977-6.9189,6.9189-6.9189c14.3022-.2001,28.207,4.7063,39.2164,13.8378,18.0659,15.0482,44.3013,15.0482,62.3671,0,22.8828-18.483,55.5639-18.483,78.4467,0,18.0713,15.0476,44.3097,15.0476,62.381,0,22.8979-18.4843,55.5903-18.4843,78.4882,0,8.6684,7.4561,19.7719,11.4716,31.2043,11.2848,3.8212,0,6.9189,3.0977,6.9189,6.9189s-3.0977,6.9189-6.9189,6.9189Z"/><path d="M420.3658,484.2606H6.9189c-3.8212,0-6.9189-3.0977-6.9189-6.9189v-28.5129c.0114-11.692,9.4868-21.1674,21.1788-21.1788h384.9271c11.692.0115,21.1673,9.4868,21.1788,21.1788v28.5129c0,3.8212-3.0977,6.9189-6.9189,6.9189ZM13.8378,470.4227h399.6091v-21.594c-.0038-4.0527-3.2882-7.3372-7.341-7.341H21.1788c-4.0527.0038-7.3371,3.2882-7.341,7.341v21.594Z"/></svg>
                                    </div>
                                    <div class="text">${notification.person.age}</div>
                                </div>
                                
                                <div class="gender">
                                    <div class="icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 495.114 512.0002"><path d="M454.451,247.8192h-.073c-13.284,0-24.795,7.735-30.268,18.937l-45.856-45.857c17.131-27.83,24.362-61.106,20.364-93.722-4.077-33.256-19.752-64.327-44.138-87.49C327.157,13.7342,291.226-.3898,253.256.0082c-37.944.367-73.621,15.142-100.462,41.604-10.967,10.813-19.99,23.062-26.911,36.323C55.163,85.8582,0,146.0072,0,218.8132c0,32.31,11.16,63.918,31.423,89.001,2.604,3.224,7.329,3.728,10.556,1.122,3.225-2.605,3.728-7.331,1.122-10.556-18.113-22.421-28.088-50.678-28.088-79.567,0-62.004,44.747-113.739,103.639-124.638-4.224,11.334-7.025,23.223-8.298,35.451-36.733,12.982-63.124,48.058-63.124,89.187,0,52.13,42.411,94.54,94.539,94.54,27.254,0,51.841-11.602,69.109-30.114,9.004,2.857,18.299,4.846,27.752,5.888,2.697.297,5.398.511,8.1.656-18.324,27.087-46.928,46.927-80.842,53.471-3.532.681-6.084,3.773-6.084,7.37v39.504c0,4.146,3.36,7.506,7.506,7.506h20.567c9.961,0,18.065,8.091,18.065,18.035,0,9.961-8.104,18.065-18.065,18.065h-20.567c-4.146,0-7.506,3.36-7.506,7.506v37.702c0,4.837-1.871,9.371-5.262,12.763-3.414,3.406-7.95,5.283-12.773,5.283-9.962,0-18.065-8.095-18.065-18.045v-37.703c0-4.146-3.36-7.506-7.506-7.506h-20.567c-9.951,0-18.045-8.104-18.045-18.065,0-9.944,8.095-18.035,18.045-18.035h20.567c4.146,0,7.506-3.36,7.506-7.506v-39.504c0-3.597-2.552-6.689-6.084-7.37-18.301-3.531-35.248-10.904-50.374-21.912-3.35-2.439-8.046-1.702-10.485,1.652-2.44,3.351-1.701,8.046,1.652,10.485,15.232,11.086,32.121,18.877,50.28,23.205v25.938h-13.061c-18.228,0-33.058,14.825-33.058,33.047,0,18.239,14.83,33.078,33.058,33.078h13.061v30.195c0,18.228,14.839,33.058,33.078,33.058,8.827,0,17.13-3.434,23.384-9.674,6.232-6.233,9.664-14.538,9.664-23.384v-30.195h13.061c18.239,0,33.078-14.839,33.078-33.078,0-18.222-14.839-33.047-33.078-33.047h-13.063v-25.94c38.689-9.24,70.649-34.11,89.68-67.038,23.34-1.609,46.152-8.808,66.098-21.086l45.857,45.858c-11.203,5.476-18.938,17.003-18.938,30.34,0,18.561,15.102,33.663,33.664,33.663h73.501c12.922,0,23.435-10.513,23.435-23.435v-73.502c0-18.561-15.101-33.663-33.663-33.663h0ZM141.768,298.3412c-43.851,0-79.527-35.676-79.527-79.528,0-32.4,19.481-60.307,47.33-72.694.301,38.311,15.34,74.264,42.476,101.402,12.571,12.57,27.343,22.659,43.415,29.846-14.159,13-33.002,20.974-53.694,20.974ZM473.102,354.9842c0,4.644-3.779,8.422-8.422,8.422h-73.501c-10.284,0-18.651-8.366-18.651-18.724,0-10.284,8.367-18.65,18.651-18.65,3.036,0,5.773-1.829,6.935-4.634s.52-6.033-1.626-8.181l-55.471-55.471c-2.831-2.831-6.565-4.295-10.347-4.295-2.669,0-5.364.729-7.782,2.223-24.487,15.123-53.823,21.712-82.611,18.531-29.64-3.269-56.478-16.167-77.611-37.301-24.69-24.689-38.218-57.515-38.095-92.432.124-34.913,13.891-67.646,38.764-92.169,49.205-48.512,130.719-49.308,180.808-1.732,21.866,20.77,35.922,48.625,39.575,78.432,3.594,29.313-2.921,59.211-18.346,84.187-3.608,5.845-2.756,13.3,2.072,18.129l55.47,55.47c2.147,2.146,5.374,2.788,8.181,1.626,2.805-1.161,4.634-3.899,4.634-6.935,0-10.284,8.366-18.65,18.65-18.65h.073c10.284,0,18.65,8.366,18.65,18.65v73.504Z"/><path d="M343.921,122.2012c-4.088.689-6.844,4.561-6.155,8.649,4.532,26.895-4.259,54.448-23.517,73.705-9.013,9.014-19.581,15.54-30.845,19.611.068-1.778.114-3.56.114-5.352,0-59.901-37.337-111.238-89.953-131.97.484-.508.951-1.026,1.449-1.524,32.873-32.873,86.362-32.873,119.235,0,4.909,4.909,9.192,10.386,12.729,16.279,2.134,3.555,6.744,4.705,10.3,2.572,3.554-2.134,4.706-6.745,2.572-10.3-4.168-6.943-9.21-13.392-14.985-19.168-38.728-38.726-101.74-38.726-140.468,0-38.726,38.727-38.726,101.74,0,140.468,19.364,19.363,44.798,29.045,70.234,29.045s50.87-9.682,70.234-29.045c22.685-22.686,33.041-55.14,27.704-86.815-.688-4.088-4.552-6.843-8.648-6.155h0ZM170.367,144.6202c29.757,11.514,50.929,40.415,50.929,74.193,0,1.175-.034,2.342-.087,3.504-9.516-4.097-18.434-10.002-26.194-17.763-16.518-16.517-24.729-38.238-24.648-59.934ZM235.938,227.1062c.239-2.734.37-5.498.37-8.293,0-41.627-27.039-77.044-64.467-89.64,1.983-10.5,5.974-20.687,11.957-29.954,49.287,17.38,84.707,64.424,84.707,119.593,0,3.122-.125,6.219-.351,9.293-10.685,1.724-21.634,1.39-32.216-.999h0Z"/></svg>
                                    </div>
                                    <div class="text">${notification.person.gender?.gender_name}</div>
                                </div>
                            </div>
                                
                            <div class="content">
                                <div class="name-image">
                                    <div class="image" style="background-image: url(${notification.person.image_url})" data-image-url="${notification.person.image_url}"></div>
                                    <div class="name">${notification.person.first_name}</div>
                                </div>
                                
                                <div class="tags">
                                    ${match_type_html}
                                    ${new_member_html}
                                </div>
                                
                                <div class="reviews">
                                    ${reviews_html}
                                </div>
                                
                                ${partner_kids_html}
                            </div>
                        </div>`;
        }

        function getPlace() {
            let rating_price = `
        <div class="rating-price">
            <div class="rating">${befriend.places.activity.html.getRating(notification.activity.place)}</div>
            <div class="price">${befriend.places.activity.html.getPrice(notification.activity.place)}</div>
        </div>`;

            let distance_km = calculateDistance(
                befriend.location.device,
                {
                    lat: notification.activity.location_lat,
                    lon: notification.activity.location_lon
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

            let navigation_buttons = befriend.activities.displayActivity.html.getNavigation(notification.activity);

            return `<div class="place section">
                                <div class="label">Place</div> 
                                
                                <div class="content">
                                    <div class="name">
                                        <div class="distance">${distance_str}</div>                                        
                                        ${notification.activity?.location_name} 
                                    </div>
                                    
                                    ${navigation_buttons}

                                    ${rating_price}
                                    
                                    <div class="address-container">
                                        ${befriend.places.getPlaceLocation(notification.activity)}
                                    </div>
                                </div>
                           </div>`;
        }

        function getDate() {
            let date = getFriendlyDateFromString(notification.activity.human_date);

            if(isToday(notification.activity.activity_start)) {
                date = 'Today';
            } else if(isTomorrow(notification.activity.activity_start)) {
                date = 'Tomorrow';
            }

            return date;
        }

        function getMatching() {
            let html = befriend.activities.displayActivity.html.matching.getContent(notification.matching);

            return `<div class="matching section">
                            <div class="label">Matching</div>
                            <div class="content">
                                ${html}
                            </div>
                        </div>`;
        }

        console.log(notification);

        let date = getDate();

        let invite_html = getInvite();

        let overview_html = getOverview();

        let network_html = getNetwork();

        let who_html = getWho();

        let place_html = getPlace();

        let matching_html = getMatching();

        return `<div class="notification">
                    <div class="top-row">
                        <div class="back-button">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 416.001 351.9995"><path id="Left_Arrow" d="M400.001,159.9995H54.625L187.313,27.3115c6.252-6.252,6.252-16.376,0-22.624s-16.376-6.252-22.624,0L4.689,164.6875c-6.252,6.252-6.252,16.376,0,22.624l160,160c3.124,3.124,7.22,4.688,11.312,4.688s8.188-1.564,11.312-4.688c6.252-6.252,6.252-16.376,0-22.624L54.625,191.9995h345.376c8.836,0,16-7.164,16-16s-7.164-16-16-16Z"></path></svg>
                        </div>
                        <h2>Invitation</h2>
                        <div class="date">${date}</div>
                    </div>
                    
                    <div class="max-recipients">${befriend.notifications.messages.unavailable}</div>
                    
                    <div class="accept-decline">
                        <div class="button accept">
                            <div class="icon"><?xml version="1.0" encoding="UTF-8"?><svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 387.3801 387.4142"><path d="M193.6956,387.4142C86.8959,387.4142,0,300.5072,0,193.6964S86.8959.0009,193.6956.0009c30.6285-.0919,60.8328,7.1589,88.0817,21.1449,5.4504,2.7879,7.6087,9.4663,4.8208,14.9167s-9.4663,7.6087-14.9167,4.8208h0c-24.1259-12.3818-50.8682-18.8004-77.9858-18.7179C99.1086,22.1654,22.1645,99.1094,22.1645,193.6964s76.9441,171.5532,171.5311,171.5532,171.5311-76.9662,171.5311-171.5532c.0073-14.7464-1.8811-29.4325-5.6187-43.6973-1.4369-5.9495,2.2213-11.9374,8.1707-13.3743,5.7829-1.3967,11.6369,2.0217,13.2623,7.7445,4.2184,16.1065,6.3489,32.6884,6.339,49.3382.0111,106.7996-86.8738,193.7067-193.6845,193.7067h0Z"/><path d="M187.7333,240.4192c-2.939-.0006-5.7573-1.1686-7.8352-3.2471l-56.1316-56.1316c-4.0856-4.5573-3.7032-11.5638.854-15.6494,4.2008-3.766,10.5605-3.775,14.7719-.0209l48.2965,48.2965L362.7332,38.6668c4.4023-4.2522,11.4182-4.1304,15.6703.2719,4.1482,4.2947,4.1482,11.1037,0,15.3984l-182.8571,182.8572c-2.076,2.0649-4.8849,3.2243-7.813,3.2249h0Z"/></svg></div>
                            <div class="text">Accept</div>
                        </div>
                        <div class="button decline">
                            <div class="icon">
                                <svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><style>.decline-cls-1{fill:none;stroke:#353535;stroke-linecap:round;stroke-linejoin:round;stroke-width:2px;}</style></defs><circle class="decline-cls-1" cx="24" cy="24" r="23"/><path class="decline-cls-1" d="M8,40.013L40,8.013"/></svg>
                            </div>
                            <div class="text">Decline</div>
                        </div>
                    </div>
                    
                    ${invite_html}
                    
                    <div class="notification-wrapper">
                        ${overview_html}
                        
                        <div class="sections-wrapper">
                            <div class="sections">
                                ${network_html}
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
    updateAvailableSpots: function (activity_token, spots_available) {
        if(!isNumeric(spots_available)) {
            return;
        }

        let notificationObj = befriend.notifications.data.all[activity_token];

        if(!notificationObj) {
            console.warn('No activity notification found');
            return;
        }

        notificationObj.activity.spots_available = spots_available;

        //update main view with latest spots data
        befriend.activities.setView();

        if(notificationObj.acceptance_in_progress) {
            return;
        }

        let notification = notificationObj.notification;

        const availablePersons = befriend.els.activityNotificationView.querySelector('.available-persons .text');

        if(!availablePersons) {
            return;
        }

        const currentEl = availablePersons.querySelector('.current');
        const newEl = availablePersons.querySelector('.new');

        newEl.textContent = spots_available;

        addClassEl('fade-out', currentEl);
        addClassEl('fade-in', newEl);

        if(spots_available <= 0 && !notification.accepted_at) {
            befriend.notifications.showUnavailable(befriend.notifications.messages.unavailable);
        }

        setTimeout(async () => {
            currentEl.textContent = spots_available;

            currentEl.style.transition = 'none';
            newEl.style.transition = 'none';

            await rafAwait();

            removeClassEl('fade-out', currentEl);
            removeClassEl('fade-in', newEl);

            await rafAwait();

            newEl.textContent = '';

            currentEl.style.removeProperty('transition');
            newEl.style.removeProperty('transition');
        }, befriend.variables.notification_spots_transition_ms);
    },
    showUnavailable: function (message, is_past) {
        let max_recipients_el = befriend.els.activityNotificationView.querySelector('.max-recipients');
        let accept_decline_el = befriend.els.activityNotificationView.querySelector('.accept-decline');

        if(!max_recipients_el || !accept_decline_el) {
            return;
        }

        if(message) {
            max_recipients_el.innerHTML = message;
        }

        if(is_past) {
            addClassEl('is-past', max_recipients_el);
        } else {
            removeClassEl('is-past', max_recipients_el);
        }

        addClassEl('show', max_recipients_el);
        addClassEl('hide', accept_decline_el);
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

                    console.log("after init finished");

                    befriend.notifications.fetchActivity(notification, false);

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
                        befriend.notifications.fetchActivity(notification.notification, true);
                    } else {
                        //show in-app notification
                        befriend.notifications.showNotificationBar();

                        //tmp - todo remove
                        befriend.notifications.fetchActivity(notification, true);
                    }
                });
            } catch (e) {
                console.error(e);
            }
        },
        onBack: function () {
            let el = befriend.els.activityNotificationView.querySelector('.back-button');

            if(el._listener) {
                return;
            }

            el._listener = true;

            el.addEventListener('click', function (e) {
                removeClassEl('show', befriend.els.activityNotificationView);
                addClassEl('show', befriend.els.mainActivitiesView);
            });
        },
        onAccept: function () {
            let accept_el = befriend.els.activityNotificationView.querySelector('.button.accept');
            let parent_el = accept_el.closest('.accept-decline');

            if(accept_el._listener) {
                return;
            }

            accept_el._listener = true;

            accept_el.addEventListener('click', async function (e) {
                e.preventDefault();
                e.stopPropagation();

                let currentNotification = befriend.notifications.data.current;

                let activity = currentNotification?.activity;

                if(currentNotification.notification.accepted_at) {
                    return;
                }

                if(this._ip) {
                    return;
                }

                this._ip = true;

                let activity_token = activity?.activity_token;

                if(activity_token) {
                    befriend.toggleSpinner(true);
                    currentNotification.acceptance_in_progress = true;

                    try {
                        let responseData;

                        if(currentNotification.access?.token) { //3rd-party network
                            let r = await befriend.networks.put(
                                currentNotification.access.domain,
                                `activities/networks/notifications/accept/${activity.activity_token}/${currentNotification.access.token}`,
                                {
                                    person_token: befriend.getPersonToken(),
                                    first_name: befriend.me.data?.me?.first_name || null,
                                    image_url: befriend.me.data?.me?.image_url || null,
                                }
                            );

                            responseData = r.data;
                        } else { //own network
                            let r = await befriend.auth.put(`/activities/${activity_token}/notification/accept`);
                            responseData = r.data;
                        }

                        befriend.activities.data.addActivity(responseData.activity);

                        //update main activities view after successful acceptance
                        befriend.activities.setView();

                        currentNotification.acceptance_in_progress = false;

                        if(responseData.success) {
                            currentNotification.notification.accepted_at = timeNow();

                            accept_el.querySelector('.text').innerHTML = `You're going!`;
                            addClassEl('accepted', parent_el);
                            befriend.notifications.updateAvailableSpots(activity_token, responseData.activity.data.spots_available);
                        } else {
                            befriend.notifications.showUnavailable(responseData.data.error);
                        }
                    } catch(e) {
                        if(e.response?.data?.error) {
                            befriend.notifications.showUnavailable(e.response.data.error);
                        }
                        console.error(e);
                    }

                    currentNotification.acceptance_in_progress = false;
                }

                befriend.toggleSpinner(false);

                this._ip = false;
            });
        },
        onDecline: function () {
            let decline_el = befriend.els.activityNotificationView.querySelector('.button.decline');

            let parent_el = decline_el.closest('.accept-decline');

            if(decline_el._listener) {
                return;
            }

            decline_el._listener = true;

            decline_el.addEventListener('click', async function (e) {
                e.preventDefault();
                e.stopPropagation();

                let currentNotification = befriend.notifications.data.current;
                let activity = currentNotification?.activity;

                //already declined
                if(currentNotification.notification.declined_at) {
                    return;
                }

                if(this._ip) {
                    return;
                }

                this._ip = true;

                let activity_token = activity?.activity_token;

                if(activity_token) {
                    try {
                        befriend.toggleSpinner(true);

                        let responseData;

                        if(currentNotification.access?.token) { //3rd-party network
                            let r = await befriend.networks.put(
                                currentNotification.access.domain,
                                `activities/networks/notifications/decline/${activity.activity_token}/${currentNotification.access.token}`,
                                {
                                    person_token: befriend.getPersonToken()
                                }
                            );

                            responseData = r.data;
                        } else { //own network
                            let r = await befriend.auth.put(`/activities/${activity_token}/notification/decline`);
                            responseData = r.data;
                        }

                        if(responseData.success) {
                            currentNotification.notification.declined_at = timeNow();
                            decline_el.querySelector('.text').innerHTML = 'You declined this invitation';
                            addClassEl('declined', parent_el);

                            befriend.activities.setView();
                        }
                    } catch(e) {
                        console.error(e);
                    }
                }

                befriend.toggleSpinner(false);

                this._ip = false;
            });
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

                befriend.modals.images.openModal(url)
            });
        },
    },
};
