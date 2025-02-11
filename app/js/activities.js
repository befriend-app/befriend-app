befriend.activities = {
    data: {
        draft: null,
        current: null,
        all: null,
        setData: function (data) {
            befriend.activities.data.all = data;

            befriend.friends.updateMaxSelectableFriends();
        },
        addActivity: function (activity) {
            if(!befriend.activities.data.all) {
                befriend.activities.data.all = {};
            }

            befriend.activities.data.all[activity.activity_token] = activity;
        },
        getActivity: function (activity_token) {
            return befriend.activities.data.all[activity_token];
        }
    },
    draft: {
        create: function(data) {
            befriend.activities.data.draft = data;
        },
        update: function(key, value, update_counts) {
            if (!key) {
                return false;
            }

            let draft = befriend.activities.data.draft;

            if (!draft) {
                return false;
            }

            setNestedValue(draft, key, value);

            if(befriend.activities.createActivity.isShown() && update_counts) {
                befriend.activities.createActivity.getMatchCounts();
            }
        }
    },
    init: function() {
        console.log('[init] Activities');

        return new Promise(async (resolve, reject) => {
            befriend.activities.createActivity.setDurations();

            try {
                await befriend.activities.activityTypes.setActivityTypes();
            } catch (e) {
                console.error(e);
            }

            befriend.activities.setView();

            resolve();
        });
    },
    setView: function () {
        function getActivityHtml(activity, is_current, is_upcoming) {
            if(!activity?.data) {
                console.warn('No data for activity');
                return '';
            }

            let accepted_qty = activity.spots?.accepted ?? activity.data?.persons_qty - activity.data?.spots_available;

            if(!isNumeric(accepted_qty)) {
                accepted_qty = 0;
            }

            let date = befriend.activities.displayActivity.getViewHtml(activity, 'getDate');

            let date_html = is_current || is_upcoming ? '' : `<div class="date">${date}</div>`;

            let activity_type_token = activity?.data?.activity_type_token;

            let activity_type = befriend.activities.activityTypes.getActivityType(activity_type_token);

            let image = activity_type?.image;

            let activity_name = activity_type?.notification;

            let duration = activity.activity_duration_min;

            let activity_start_human = dayjs(activity.activity_start * 1000)
                .format('h:mm a')
                .toLowerCase();

            let activity_end_human = dayjs(activity.activity_end * 1000)
                .format('h:mm a')
                .toLowerCase();

            let time_string = `${activity_start_human} - ${activity_end_human}`;

            if(activity_start_human !== activity.data?.human_time) {
                let tz = getTimezoneAbbreviation();

                time_string += ` ${tz}`;
            }

            return `
                <div class="activity" data-activity-token="${activity.activity_token}">
                    <div class="activity-type-accepted">
                         <div class="activity-type-date-time">
                            <div class="activity-type">
                                <div class="image">
                                    ${image}
                                </div>
                                <div class="name">${activity_name}</div>
                            </div>
                            
                            <div class="date-time">
                                ${date_html}
                                <div class="time">${time_string}</div>
                            </div>
                        </div>
                        
                        <div class="accepted-date-time">
                            <div class="accepted ${accepted_qty > 0 ? 'w-qty' : ''}">
                                <div class="label">Accepted</div>
                                <div class="qty">${accepted_qty}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="location">${activity.data.location_name}</div>
                    <div class="address">${activity.data.location_address}, ${activity.data.location_locality}, ${activity.data.location_region}</div>
                </div>
            `;
        }

        let activities = befriend.activities.data.all;

        activities = Object.values(activities);

        activities.sort(function (a, b) {
            return b.activity_start - a.activity_start;
        });

        let currentActivityEl = befriend.els.mainActivitiesView.querySelector('.current-activity .container');
        let notificationsEl = befriend.els.mainActivitiesView.querySelector('.notifications .container');

        let upcomingActivitiesEl = befriend.els.mainActivitiesView.querySelector('.upcoming-activities .container');
        let pastActivitiesEl = befriend.els.mainActivitiesView.querySelector('.past-activities .container');

        let currentActivityHtml = '';
        let notificationsHtml = '';
        let upcomingActivitiesHtml = '';
        let pastActivitiesHtml = '';

        let currentTime = timeNow(true);

        let activities_organized = {
            current: null,
            upcoming: [],
            past: []
        }

        for (let activity of activities) {
            const start = activity.activity_start;
            const end = activity.activity_end;

            // add to corresponding section
            if (currentTime >= start && currentTime <= end) {
                activities_organized.current = activity;
            } else if (start > currentTime) {
                activities_organized.upcoming.push(activity);
            } else if (end < currentTime) {
                activities_organized.past.push(activity);
            }
        }

        if(!activities_organized.current) {
            //move from upcoming to current
            for(let activity of activities_organized.upcoming) {
                if(activity.activity_start - currentTime < 600) {
                    activities_organized.current = activity;
                    break;
                }
            }

            if(activities_organized.current) {
                removeArrItem(activities_organized.upcoming, activities_organized.current);
            }
        }

        if(activities_organized.current) {
            currentActivityHtml = getActivityHtml(activities_organized.current, true);
        }

        //organize upcoming by today/tomorrow/date
        let upcoming_dates = new Map();
        let upcoming_activities = activities_organized.upcoming;

        upcoming_activities.sort(function (a, b) {
           return a.activity_start - b.activity_start;
        });

        for(let activity of upcoming_activities) {
            let date = befriend.activities.displayActivity.getViewHtml(activity, 'getDate');

            if(!upcoming_dates.has(date)) {
                upcoming_dates.set(date, []);
            }

            upcoming_dates.get(date).push(activity);
        }

        for(let [date, activities] of upcoming_dates) {
            let dateActivitiesHtml = '';

            for(let activity of activities) {
                dateActivitiesHtml += getActivityHtml(activity, false, true);
            }

            upcomingActivitiesHtml += `<div class="group">
                                            <div class="date">${date}</div>
                                            <div class="activities">${dateActivitiesHtml}</div>
                                       </div>`;
        }

        for(let activity of activities_organized.past) {
            pastActivitiesHtml += getActivityHtml(activity);
        }

        if (!currentActivityHtml) {
            currentActivityHtml = `<div class="no-items">No current activity</div>`;
        }

        if(!notificationsHtml) {
            notificationsHtml = `<div class="no-items">No current notifications</div>`;
        }

        if (!upcomingActivitiesHtml) {
            upcomingActivitiesHtml = `<div class="no-items">No upcoming activities</div>`;
        }

        if (!pastActivitiesHtml) {
            pastActivitiesHtml = `<div class="no-items">No past activities</div>`;
        }

        currentActivityEl.innerHTML = currentActivityHtml;
        notificationsEl.innerHTML = notificationsHtml;
        upcomingActivitiesEl.innerHTML = upcomingActivitiesHtml;
        pastActivitiesEl.innerHTML = `<div class="activities">${pastActivitiesHtml}</div>`;

        befriend.activities.events.onShowActivity();
    },
    getDurationStr: function(minutes) {
        let duration_str = `${minutes} minutes`;

        if (minutes >= 60 && minutes < 120) {
            if (minutes === 60) {
                duration_str = '1 hour';
            } else {
                duration_str = `1 hour, ${minutes - 60} minutes`;
            }
        } else if (minutes >= 120) {
            let hours = Math.floor(minutes / 60);
            let half = (minutes % 60) / 60;

            if (half) {
                let half_str = half.toFixed(1).replace(/0/g, '');
                duration_str = `${hours}${half_str} hours`;
            } else {
                duration_str = `${hours} hours`;
            }
        }

        return duration_str;
    },
    activityTypes: {
        data: null,
        lookup: {
            byId: {},
            byToken: {}
        },
        colors: [
            '#8E44AD', // Bright Yellow
            '#C70039', // Bold Crimson
            '#31a663', // Bold Leaf Green
            '#e0f3fd', // Light Blue
            '#79A881', // Bold Green
            '#D35400', // Bold Carrot Orange
            '#3498DB', // Bold Sky Blue
            '#2980B9', // Bold Blue
            '#cc6b6b', // Bold Fruit
            '#9B59B6', // Bold Lavender
            '#E74C3C', // Bright Red
            '#F39C12', // Bold Orange
            '#33b1d1', // Light Teal
            '#16A085', // Bold Teal
            '#F1C40F', // Bold Yellow-Green
        ],
        selected: {
            level_1: null,
            level_2: null,
            level_3: null,
        },
        getActivityType: function (token) {
            return this.lookup.byToken[token];
        },
        getActivityTypes: function() {
            return new Promise(async (resolve, reject) => {
                try {
                    let r = await befriend.api.get('activity_types');
                    befriend.activities.activityTypes.data = r.data;
                    befriend.user.setLocal('activities.type', r.data);
                } catch (e) {
                    console.error(e);
                    
                    if (befriend.user.local?.data?.activities) {
                        console.log('Using local activity types data');
                        befriend.activities.activityTypes.data = befriend.user.local.data.activities.type;
                    } else {
                        return reject();
                    }
                }

                for(let id_1 in befriend.activities.activityTypes.data) {
                    let level_1 = befriend.activities.activityTypes.data[id_1];

                    befriend.activities.activityTypes.lookup.byId[id_1] = level_1;
                    befriend.activities.activityTypes.lookup.byToken[level_1.token] = level_1;

                    if(Object.keys(level_1.sub || {}).length) {
                        for(let id_2 in level_1.sub) {
                            let level_2 = level_1.sub[id_2];

                            befriend.activities.activityTypes.lookup.byId[id_2] = level_2;
                            befriend.activities.activityTypes.lookup.byToken[level_2.token] = level_2;

                            if(Object.keys(level_2.sub || {}).length) {
                                for(let id_3 in level_2.sub) {
                                    let level_3 = level_2.sub[id_3];

                                    befriend.activities.activityTypes.lookup.byId[id_3] = level_3;
                                    befriend.activities.activityTypes.lookup.byToken[level_3.token] = level_3;
                                }
                            }
                        }
                    }
                }

                resolve();
            });
        },
        setActivityTypes: function() {
            return new Promise(async (resolve, reject) => {
                try {
                    await befriend.activities.activityTypes.getActivityTypes();
                    await befriend.activities.activityTypes.setHtml();
                    resolve();
                } catch (e) {
                    return reject();
                }
            });
        },
        setHtml: function () {
            return new Promise(async (resolve, reject) => {
                try {
                    let activities = befriend.activities.activityTypes.data;

                    let html = ``;
                    let level_1_html = ``;

                    //create rows and add hidden placeholder row below each row for multi-level select
                    let activities_row = [];

                    let level_1_ids = Object.keys(activities);

                    for (let i = 0; i < level_1_ids.length; i++) {
                        let level_1_id = level_1_ids[i];

                        if (activities_row.length === befriend.variables.activity_row_items) {
                            let row_html = activities_row.join('');

                            level_1_html += `<div class="level_1_row">
                                            ${row_html}
                                        </div>`;
                            level_1_html += `<div class="level_2"></div>`;

                            activities_row.length = [];
                        }

                        let activity = activities[level_1_id];

                        let image_html = ``;

                        if (activity.image) {
                            image_html += `<div class="image">
                                        ${activity.image}
                                    </div>`;
                        } else if (activity.emoji) {
                            // image_html += `<div class="emoji">
                            //                 ${activity.emoji}
                            //             </div>`;
                        }

                        let icon_html = ``;

                        if (image_html) {
                            icon_html = `<div class="icon">${image_html}</div>`;
                        }

                        let center_class = icon_html ? '' : 'center';

                        let bc = befriend.activities.activityTypes.colors[i];

                        let font_white_class = useWhiteOnBackground(bc) ? 'font_white' : '';

                        activities_row.push(`
                        <div class="activity level_1_activity ${font_white_class}" data-id="${level_1_id}" style="background-color: ${bc}">
                            <div class="activity_wrapper ${center_class}">
                                ${icon_html}
                                <div class="name">${activity.name}</div>
                            </div>
                        </div>
                    `);
                    }

                    if (activities_row.length) {
                        let row_html = activities_row.join('');
                        level_1_html += `<div class="level_1_row">
                                            ${row_html}
                                        </div>`;
                        level_1_html += `<div class="level_2"></div>`;
                    }

                    html = `
                    <div class="level_1">${level_1_html}</div>
                `;

                    befriend.els.activityTypes.querySelector('.activities').innerHTML = html;

                    let last_row = lastArrItem(
                        befriend.els.activityTypes.getElementsByClassName('level_1_row'),
                    );

                    last_row.style.marginBottom = '0px';

                    resolve();
                } catch (e) {
                    console.error(e);
                    return reject(e);
                }
            });
        },
        getCurrent: function() {
            let obj = befriend.activities.activityTypes.selected;
            return obj.level_3 || obj.level_2 || obj.level_1;
        },
        updateLevelHeight: async function(level_num, skip_set_prev) {
            let level_el = befriend.els.activityTypes.querySelector(`.level_${level_num}.show`);
            if (!level_el) {
                return;
            }

            let last_row = lastArrItem(level_el.getElementsByClassName(`level_${level_num}_row`));
            last_row.style.marginBottom = '0px';

            let level_height = await setElHeightDynamic(level_el, true);

            if (!skip_set_prev) {
                level_el.setAttribute('data-prev-height', `${level_height}px`);
            }

            level_el.style.height = `${level_height}px`;
        },
        events: {
            init: function () {
                befriend.activities.activityTypes.events.level1();
            },
            level1: function () {
                let els = befriend.els.activityTypes.getElementsByClassName('level_1_activity');

                for (let i = 0; i < els.length; i++) {
                    let el = els[i];

                    el.addEventListener('click', function (e) {
                        e.preventDefault();
                        e.stopPropagation();

                        let parent_id = this.getAttribute('data-id');
                        let activity = befriend.activities.activityTypes.data[parent_id];

                        let level_2_el = this.closest('.level_1_row').nextSibling;

                        //remove activity selection and hide level 2 if same activity clicked
                        if (elHasClass(this, 'active')) {
                            removeClassEl('active', this);

                            hideLevel(level_2_el);

                            befriend.activities.activityTypes.selected.level_1 = null;
                            befriend.activities.activityTypes.selected.level_2 = null;
                            befriend.activities.activityTypes.selected.level_3 = null;

                            befriend.places.activity.hidePlaces();

                            return;
                        } else {
                            //remove active from any previously selected activity
                            removeElsClass(els, 'active');
                            addClassEl('active', this);
                            befriend.activities.activityTypes.selected.level_1 = activity;
                            befriend.activities.activityTypes.selected.level_2 = null;
                            befriend.activities.activityTypes.selected.level_3 = null;
                        }

                        let prev_level_2 = befriend.els.activityTypes.querySelector('.level_2.show');

                        //do not proceed if no sub categories
                        if (!activity.sub || !Object.keys(activity.sub).length) {
                            if (prev_level_2) {
                                hideLevel(prev_level_2);
                            }

                            return;
                        }

                        //hide other level 2s if different from this one
                        if (prev_level_2) {
                            if (prev_level_2 !== level_2_el) {
                                hideLevel(prev_level_2);
                                addClassEl('show', level_2_el);
                            }
                        } else {
                            addClassEl('show', level_2_el);
                        }

                        level_2_el.setAttribute('data-parent-id', parent_id);

                        let level_2_html = ``;

                        let activities_level_2 = [];

                        for (let level_2_id in activity.sub) {
                            if (
                                activities_level_2.length ===
                                befriend.variables.activity_level_2_row_items
                            ) {
                                let row_html = activities_level_2.join('');

                                level_2_html += `<div class="level_2_row">
                                            ${row_html}
                                        </div>`;

                                level_2_html += `<div class="level_3"></div>`;

                                activities_level_2.length = [];
                            }

                            let activity = befriend.activities.activityTypes.data[parent_id].sub[level_2_id];

                            let image_html = '';

                            if (activity.image) {
                                if(!activity.token.endsWith('-any')) {
                                    image_html += `<div class="image">
                                        ${activity.image}
                                    </div>`;
                                }
                            }

                            let icon_html = ``;

                            if (image_html) {
                                icon_html = `<div class="icon">${image_html}</div>`;
                            }

                            let no_icon_class = icon_html ? '' : 'no_icon';

                            activities_level_2.push(`
                            <div class="activity level_2_activity" data-id="${level_2_id}">
                                <div class="activity_wrapper ${no_icon_class}">
                                    ${icon_html}
                                    <div class="name">${activity.name}</div>
                                </div>
                            </div>`);
                        }

                        if (activities_level_2.length) {
                            let row_html = activities_level_2.join('');
                            level_2_html += `<div class="level_2_row">
                                            ${row_html}
                                        </div>`;
                            level_2_html += `<div class="level_3"></div>`;
                        }

                        level_2_el.innerHTML = `<div class="level_2_container">
                                                ${level_2_html}
                                            </div>`;

                        befriend.activities.activityTypes.updateLevelHeight(2);

                        befriend.activities.activityTypes.events.level2();
                    });
                }
            },
            level2: function () {
                let level_2_activity_els =
                    befriend.els.activityTypes.getElementsByClassName('level_2_activity');

                for (let i = 0; i < level_2_activity_els.length; i++) {
                    let el = level_2_activity_els[i];

                    el.addEventListener('click', function (e) {
                        e.preventDefault();
                        e.stopPropagation();

                        let parent_id = this.closest('.level_2').getAttribute('data-parent-id');

                        let level_2_id = this.getAttribute('data-id');

                        let level_2_activity =
                            befriend.activities.activityTypes.data[parent_id].sub[level_2_id];

                        let level_3_el = this.closest('.level_2_row').nextSibling;

                        let closest_level_2_el = this.closest('.level_2');

                        let prev_height_level_2 = closest_level_2_el.getAttribute('data-prev-height');

                        //remove activity selection and hide level 3 if same activity clicked
                        if (elHasClass(this, 'active')) {
                            removeClassEl('active', this);

                            hideLevel(level_3_el);

                            closest_level_2_el.style.height = prev_height_level_2;

                            befriend.activities.activityTypes.selected.level_2 = null;
                            befriend.activities.activityTypes.selected.level_3 = null;

                            return;
                        } else {
                            //remove active from any previously selected activity
                            removeElsClass(level_2_activity_els, 'active');
                            addClassEl('active', this);
                            befriend.activities.activityTypes.selected.level_2 = level_2_activity;
                            befriend.activities.activityTypes.selected.level_3 = null;

                            // only show places when there are no level 3 categories
                            if (!level_2_activity.sub || !Object.keys(level_2_activity.sub).length) {
                                befriend.places.activity.displayPlaces(befriend.activities.activityTypes.selected.level_2);

                                setTimeout(function () {
                                    removeClassEl('active', el);
                                }, befriend.variables.places_transition_ms);
                            }
                        }

                        let prev_level_3 = befriend.els.activityTypes.querySelector('.level_3.show');

                        //do not proceed if no sub categories
                        if (!level_2_activity.sub || !Object.keys(level_2_activity.sub).length) {
                            if (prev_level_3) {
                                hideLevel(prev_level_3);
                            }

                            closest_level_2_el.style.height = prev_height_level_2;

                            return;
                        }

                        //hide other level 3s if different from this one
                        if (prev_level_3) {
                            if (prev_level_3 !== level_3_el) {
                                hideLevel(prev_level_3);
                                addClassEl('show', level_3_el);
                            }
                        } else {
                            addClassEl('show', level_3_el);
                        }

                        level_3_el.setAttribute('data-parent-id', parent_id);
                        level_3_el.setAttribute('data-level-2-id', level_2_id);

                        let level_3_html = ``;

                        let activities_level_3 = [];

                        for (let level_3_id in level_2_activity.sub) {
                            if (
                                activities_level_3.length ===
                                befriend.variables.activity_level_3_row_items
                            ) {
                                let row_html = activities_level_3.join('');

                                level_3_html += `<div class="level_3_row">
                                            ${row_html}
                                        </div>`;

                                activities_level_3.length = [];
                            }

                            let activity =
                                befriend.activities.activityTypes.data[parent_id].sub[level_2_id].sub[
                                    level_3_id
                                    ];

                            let image_html = '';

                            if (activity.image) {
                                if(!activity.token.endsWith('-any')) {
                                    image_html += `<div class="image">
                                        ${activity.image}
                                    </div>`;
                                }
                            }

                            let icon_html = ``;

                            if (image_html) {
                                icon_html = `<div class="icon">${image_html}</div>`;
                            }

                            let no_icon_class = icon_html ? '' : 'no_icon';

                            activities_level_3.push(`
                            <div class="activity level_3_activity" data-id="${level_3_id}">
                                <div class="activity_wrapper ${no_icon_class}">
                                    ${icon_html}
                                    <div class="name">${activity.name}</div>
                                </div>
                            </div>`);
                        }

                        if (activities_level_3.length) {
                            let row_html = activities_level_3.join('');
                            level_3_html += `<div class="level_3_row">
                                            ${row_html}
                                        </div>`;
                        }

                        level_3_el.innerHTML = `<div class="level_3_container">
                                                ${level_3_html}
                                            </div>`;

                        befriend.activities.activityTypes.updateLevelHeight(3);

                        requestAnimationFrame(function () {
                            befriend.activities.activityTypes.updateLevelHeight(2, true);
                        });

                        // let last_row = lastArrItem(level_3_el.getElementsByClassName("level_3_row"));
                        //
                        // last_row.style.marginBottom = "0px";
                        //
                        // let level_3_height = getElHeightHidden(level_3_el);
                        //
                        // level_3_el.style.height = `${level_3_height}px`;
                        //
                        // let total_level_2_height = parseFloat(prev_height_level_2) + level_3_height;
                        //
                        // closest_level_2_el.style.height = `${total_level_2_height}px`;

                        befriend.activities.activityTypes.events.level3();
                    });
                }
            },
            level3: function () {
                let level_3_activity_els =
                    befriend.els.activities.getElementsByClassName('level_3_activity');

                for (let i = 0; i < level_3_activity_els.length; i++) {
                    let el = level_3_activity_els[i];

                    el.addEventListener('click', function (e) {
                        e.preventDefault();
                        e.stopPropagation();

                        console.log('level 3 clicked');

                        let level_3_el = this.closest('.level_3');

                        let parent_id = level_3_el.getAttribute('data-parent-id');

                        let level_2_id = level_3_el.getAttribute('data-level-2-id');

                        let level_3_id = this.getAttribute('data-id');

                        let level_3_activity =
                            befriend.activities.activityTypes.data[parent_id].sub[level_2_id].sub[level_3_id];

                        //remove activity selection and hide level 3 if same activity clicked
                        if (elHasClass(this, 'active')) {
                            removeClassEl('active', this);
                            befriend.activities.activityTypes.selected.level_3 = null;
                            // befriend.places.displayPlaces(befriend.activities.activityTypes.selected.level_2);
                        } else {
                            //remove active from any previously selected activity
                            removeElsClass(level_3_activity_els, 'active');
                            addClassEl('active', this);
                            befriend.activities.activityTypes.selected.level_3 = level_3_activity;

                            befriend.places.activity.displayPlaces(befriend.activities.activityTypes.selected.level_3);

                            setTimeout(function () {
                                removeClassEl('active', el);
                            }, befriend.variables.places_transition_ms);
                        }
                    });
                }
            },
        }
    },
    createActivity: {
        data: {
            draft: null,
            current: null,
            all: null,
        },
        duration: {
            selected: null,
            default: 30, //min
            groups: {
                60: {
                    max: 60,
                    num: '15 - 60',
                    unit: 'minutes',
                    options: [
                        [{num: 15, unit: 'min', minutes: 15}],
                        [{num: 20, unit: 'min', minutes: 20}],
                        [{num: 30, unit: 'min', minutes: 30}],
                        [{num: 40, unit: 'min', minutes: 40}],
                        [{num: 45, unit: 'min', minutes: 45}],
                        [{num: 50, unit: 'min', minutes: 50}]
                    ]
                },
                120: {
                    max: 120,
                    num: '1 - 2',
                    unit: 'hours',
                    options: [
                        [{num: 1, unit: 'hr', minutes: 60}],
                        [{num: 1, unit: 'hr', minutes: 70}, {num: 10, unit: 'min', minutes: 70}],
                        [{num: 1, unit: 'hr', minutes: 80}, {num: 20, unit: 'min', minutes: 80}],
                        [{num: 1, unit: 'hr', minutes: 90}, {num: 30, unit: 'min', minutes: 90}],
                        [{num: 1, unit: 'hr', minutes: 100}, {num: 40, unit: 'min', minutes: 100}],
                        [{num: 1, unit: 'hr', minutes: 110}, {num: 50, unit: 'min', minutes: 110}]
                    ]
                },
                240: {
                    max: 240,
                    num: '2 - 4',
                    unit: 'hours',
                    options: [
                        [{num: 2, unit: 'hrs', minutes: 120}],
                        [{num: 2.5, unit: 'hrs', minutes: 150}],
                        [{num: 3, unit: 'hrs', minutes: 180}],
                        [{num: 3.5, unit: 'hrs', minutes: 210}]
                    ]
                },
                360: {
                    max: 360,
                    num: '4 - 6',
                    unit: 'hours',
                    options: [
                        [{num: 4, unit: 'hrs', minutes: 240}],
                        [{num: 4.5, unit: 'hrs', minutes: 270}],
                        [{num: 5, unit: 'hrs', minutes: 300}],
                        [{num: 5.5, unit: 'hrs', minutes: 330}],
                        [{num: 6, unit: 'hrs', minutes: 360}]
                    ]
                }
            }
        },
        person: {
            mode: 'solo' // [solo, partner, kids]
        },
        travel: {
            mode: 'driving', // [driving, walking, bicycle]
            token: null,
            times: null
        },
        setHtml: function () {
            let place = befriend.places.selected.place;

            let parent_el = befriend.els.createActivity.querySelector('.main');
            let activity_el = parent_el.querySelector('.activity');
            let place_el = parent_el.querySelector('.place').querySelector('.info');
            let when_el = parent_el.querySelector('.when');
            let friends_el = parent_el.querySelector('.friends');
            let filters_el = parent_el.querySelector('.filters');

            //set activity
            let activity_name = null;
            let activity_type = null;

            if (befriend.places.selected.is_activity_type) {
                activity_type = befriend.activities.activityTypes.getCurrent();
                activity_name = activity_type.notification;
            } else {
                activity_name = 'Meet';
            }

            activity_el.querySelector('.info').innerHTML = activity_name;

            //set place
            let place_name_html = ``;

            if (place.name) {
                place_name_html = `<div class="place-name">${place.name}</div>`;
            }

            let location_html = befriend.places.getPlaceLocation(place);

            place_el.innerHTML = `${place_name_html}<div class="location">${location_html}</div>`;

            //set when
            let when_current = befriend.when.selected.main;

            let when_str = '';

            if (when_current.is_schedule) {
                //todo
                when_str = 'Scheduled';
            } else {
                when_str = when_current.time.formatted;
            }

            when_el.querySelector('.time').innerHTML = when_str;
            when_el.querySelector('.duration').querySelector('.value').innerHTML =
                befriend.activities.getDurationStr(befriend.activities.createActivity.duration.selected);

            //set friends
            let friend_type_str = '';

            if (befriend.friends.type.is_new) {
                friend_type_str = 'New';
            } else if (befriend.friends.type.is_existing) {
                friend_type_str = 'Existing';
            } else if (befriend.friends.type.is_both) {
                friend_type_str = 'New/Existing';
            }

            //friend type
            friends_el.querySelector('.type').querySelector('.value').innerHTML = friend_type_str;

            //number of persons
            friends_el.querySelector('.quantity').querySelector('.value').innerHTML =
                befriend.friends.activity_qty;

            //show filters
            let filters_html = befriend.activities.createActivity.getFilterList();

            filters_el.querySelector('.info').innerHTML = filters_html ?
                `<div class="active-filters">${filters_html}</div>` :
                `<div class="no-filters">No active filters</div>`;

            //data for activity
            befriend.activities.draft.create({
                activity: {
                    name: activity_name,
                    token: activity_type ? activity_type.token : null,
                },
                place: {
                    id: place.fsq_place_id ? place.fsq_place_id : place.fsq_address_id,
                    is_address: !!place.fsq_address_id,
                },
                travel: {
                    mode: befriend.activities.createActivity.travel.mode,
                    token: null,
                },
                duration: befriend.activities.createActivity.duration.selected,
                when: befriend.when.selected.main,
                friends: {
                    type: befriend.friends.type,
                    qty: befriend.friends.activity_qty,
                },
                filters: {},
            });

            //set dynamic mode options
            let modes_el = befriend.els.createActivity.querySelector('.modes');
            let modes_html = '';

            let valid_modes = [];
            let modes_enabled = structuredClone(befriend.me.modes.selected);
            let has_valid_partner = false;
            let has_valid_kid = false;

            for(let option of befriend.modes.options) {
                if(modes_enabled.includes(option.id)) {
                    if(option.id === 'mode-solo') {
                        valid_modes.push(option);
                    } else if(option.id === 'mode-partner') {
                        if(befriend.me.modes.hasValidPartner()) {
                            has_valid_partner = true;
                            valid_modes.push(option);
                        }
                    } else if(option.id === 'mode-kids') {
                        if(befriend.me.modes.hasValidKids()) {
                            has_valid_kid = true;
                            valid_modes.push(option);
                        }
                    }
                }
            }

            if(!valid_modes.length) {
                valid_modes.push(befriend.modes.options.find(mode => mode.id === 'mode-solo'));
            }

            if(valid_modes.length > 1) {
                removeClassEl('hide', modes_el);

                for(let mode of valid_modes) {
                    modes_html += `<div class="mode-option ${mode.id}" data-mode="${mode.id}">
                                <div class="icon">${mode.icon}</div>
                                <div class="name">${mode.label}</div>
                            </div>`;
                }
            } else {
                let hadInvalidPartnerKidSelected = false;

                if(modes_enabled.includes('mode-partner') && !has_valid_partner) {
                    hadInvalidPartnerKidSelected = true;
                } else if(modes_enabled.includes('mode-kids') && has_valid_kid) {
                    hadInvalidPartnerKidSelected = true;
                }

                if(!hadInvalidPartnerKidSelected) {
                    addClassEl('hide', modes_el);
                }
            }

            modes_el.innerHTML = modes_html;

            befriend.activities.createActivity.events.appMode();

            //select active mode
            if(valid_modes.length > 1) {
                fireClick(befriend.els.createActivity.querySelector('.modes').querySelector('.mode-option'));
            } else {
                befriend.activities.createActivity.setAppMode(valid_modes[0].id);
            }

        },
        setAppMode: function(mode) {
            befriend.activities.createActivity.person.mode = mode;
            befriend.activities.draft.update('person.mode', mode, true);
        },
        setTravelTimes: function(from, to) {
            return new Promise(async (resolve, reject) => {
                try {
                    let data = await befriend.places.getTravelTimes(from, to);
                    befriend.activities.createActivity.travel.times = data;
                    befriend.activities.createActivity.travel.token = data.token;
                    befriend.activities.draft.update('travel.token', data.token);
                    befriend.activities.createActivity.updateWhenAuto();

                    for (let mode_name in data.modes) {
                        let mode = data.modes[mode_name];
                        let el = befriend.els.travelTimes.querySelector(`.mode.${mode_name}`);
                        let value_el = el.querySelector('.value');
                        value_el.style.opacity = 0;

                        let time_str = '';
                        if (mode.hours) {
                            time_str = `${mode.hours} hr`;
                            if (mode.hours > 1) time_str += 's';
                            if (mode.mins > 0) time_str += ' ';
                        }
                        if (mode.mins) {
                            time_str += `${mode.mins}`;
                            if (mode.hours < 1) time_str += ' min';
                        }

                        value_el.innerHTML = time_str;
                        requestAnimationFrame(() => {
                            value_el.style.opacity = 1;
                        });
                    }
                } catch (e) {
                    console.error(e);
                }
                resolve();
            });
        },
        setDurations: function() {
            let level_1_el = befriend.els.activityDuration.querySelector('.level_1');
            let level_2_el = befriend.els.activityDuration.querySelector('.level_2');

            //set level 1
            let level_1_html = '';

            let keys = Object.keys(befriend.activities.createActivity.duration.groups);

            let current_duration = befriend.activities.createActivity.duration.selected;

            if (!current_duration) {
                current_duration = befriend.activities.createActivity.duration.default;
                befriend.activities.createActivity.duration.selected = current_duration;
            }

            let active_set = false;

            for (let i = 0; i < keys.length; i++) {
                let key = keys[i];
                let group = befriend.activities.createActivity.duration.groups[key];

                let active_class = '';

                if (!active_set && group.max > current_duration) {
                    active_class = 'active';
                    active_set = true;
                }

                level_1_html += `
                <div class="button ${active_class}" data-min-max="${group.max}">
                    <div class="num">${group.num}</div>
                    <div class="unit">${group.unit}</div>
                </div>
            `;
            }

            level_1_el.innerHTML = level_1_html;

            //set level 2
            let level_2_html = ``;

            active_set = false;

            for (let i = 0; i < keys.length; i++) {
                let key = keys[i];
                let group = befriend.activities.createActivity.duration.groups[key];

                let active_class = '';

                if (!active_set && group.max > current_duration) {
                    active_class = 'active';
                    active_set = true;
                }

                let options_html = '';

                for (let option of group.options) {
                    let selected_class = option[0].minutes === current_duration ? 'selected' : '';

                    let option_html = ``;

                    for (let i = 0; i < option.length; i++) {
                        let item = option[i];

                        option_html += `<div class="num-unit">
                                        <div class="num">${item.num}</div><div class="unit">${item.unit}</div>
                                    </div>`;
                    }

                    options_html += `<div class="option ${selected_class}" data-min="${option[0].minutes}">
                                    ${option_html}
                                </div>`;
                }

                level_2_html += `
                <div class="options min-${group.max} ${active_class}" data-min-max="${group.max}">
                    ${options_html}
                </div>
            `;
            }

            level_2_el.innerHTML = level_2_html;
        },
        updateDuration: function(duration, update_buttons) {
            befriend.activities.createActivity.duration.selected = duration;
            befriend.activities.draft.update('duration', duration, true);

            befriend.els.createActivity
                .querySelector('.when')
                .querySelector('.duration')
                .querySelector('.value').innerHTML = befriend.activities.getDurationStr(befriend.activities.createActivity.duration.selected);

            if (update_buttons) {
                let level_1 = befriend.els.createActivity.querySelector('.level_1');
                let buttons = befriend.els.activityDuration.getElementsByClassName('button');
                let options = befriend.els.activityDuration.getElementsByClassName('options');
                let option_els = befriend.els.activityDuration.getElementsByClassName('option');

                removeElsClass(buttons, 'active');
                removeElsClass(options, 'active');

                for (let i = 0; i < option_els.length; i++) {
                    let option = option_els[i];
                    if (parseInt(option.getAttribute('data-min')) === duration) {
                        let group = option.closest('.options');
                        addClassEl('active', group);
                        removeElsClass(group.getElementsByClassName('option'), 'selected');
                        addClassEl('selected', option);

                        for (let i = 0; i < buttons.length; i++) {
                            let button = buttons[i];
                            if (button.getAttribute('data-min-max') === group.getAttribute('data-min-max')) {
                                addClassEl('active', button);
                                let cls = level_1.classList;
                                for (let j = 0; j < cls.length; j++) {
                                    if (cls[j].includes('group')) {
                                        removeClassEl(cls[j], level_1);
                                    }
                                }
                                addClassEl(`group-${i + 1}`, level_1);
                            }
                        }
                    }
                }
            }
        },
        getCurrentTravelTime: function() {
            if (!befriend.activities.createActivity.travel.times) {
                return null;
            }

            return befriend.activities.createActivity.travel.times.modes[befriend.activities.createActivity.travel.mode].total;
        },
        updateWhenAuto: async function() {
            const originalTimes = {
                driving: null,
                walking: null,
                bicycle: null
            };

            let needs_update = false;
            let when = befriend.when.selected.createActivity;
            let mins_to = befriend.activities.createActivity.getCurrentTravelTime();
            let new_when_str = '';

            // Store original time for current mode if not already stored
            const currentMode = befriend.activities.createActivity.travel.mode;
            if (originalTimes[currentMode] === null) {
                let when_str = '';
                if (befriend.when.selected.createActivity.is_schedule) {
                    when_str = 'Schedule';
                } else {
                    when_str = befriend.when.selected.createActivity.time.formatted;
                }
                originalTimes[currentMode] = {
                    mins: mins_to,
                    whenStr: when_str
                };
            }

            let when_el = befriend.els.createActivity.querySelector('.when');
            let message_el = document.getElementById('create-activity-top-message');

            // Check if update is needed
            if (!when.is_schedule) {
                if (mins_to > when.in_mins + befriend.when.thresholds.future) {
                    needs_update = true;
                } else {
                    // Restore original time if within threshold
                    if (originalTimes[currentMode]) {
                        when_el.querySelector('.time').innerHTML = originalTimes[currentMode].whenStr;
                        for (let i = 0; i < befriend.when.options.length; i++) {
                            let option = befriend.when.options[i];
                            if (option.id === befriend.when.selected.createActivity.id) {
                                befriend.when.selectOptionIndex(i);
                                break;
                            }
                        }
                        if (befriend.when.selected.createActivity.time) {
                            befriend.when.selected.createActivity.time.formatted = originalTimes[currentMode].whenStr;
                        }
                    }
                    message_el.querySelector('.message').style.height = '0';
                    removeClassEl('show', message_el);
                    return;
                }
            }

            if (needs_update) {
                // Find closest possible time
                for (let i = 0; i < befriend.when.options.length; i++) {
                    let option = befriend.when.options[i];
                    if (option.in_mins && mins_to < option.in_mins) {
                        befriend.when.selectOptionIndex(i);
                        new_when_str = befriend.when.selected.main.time.formatted;
                        originalTimes[currentMode] = {
                            mins: mins_to,
                            whenStr: new_when_str
                        };
                        break;
                    }
                }

                let inner = message_el.querySelector('.inner');
                if (new_when_str) {
                    when_el.querySelector('.time').innerHTML = new_when_str;
                    inner.innerHTML = 'Your activity time has been updated automatically.';
                    inner.style.backgroundColor = befriend.variables.color_green;
                } else {
                    inner.innerHTML = 'Please update your activity location and/or schedule for a later time.';
                    inner.style.backgroundColor = befriend.variables.color_red;
                }

                // Calculate height of message
                setElHeightDynamic(message_el.querySelector('.message'));
                befriend.styles.createActivity.updateCloseMessagePosition();
                addClassEl('show', message_el);
            }
        },
        display: async function() {
            befriend.when.selected.createActivity = structuredClone(befriend.when.selected.main);
            befriend.activities.createActivity.setHtml();

            //reset view to initial scroll top
            befriend.els.createActivity.querySelector('.main').scrollTop = 0;

            try {
                befriend.activities.createActivity.getMatchCounts();
            } catch(e) {
                console.error(e);
            }

            let map_el = befriend.els.activityMap;
            let status_bar_height = await befriend.styles.getStatusBarHeight();

            befriend.styles.transformStatusBar(
                status_bar_height + 5,
                befriend.variables.hide_statusbar_ms / 1000,
            );

            // Remove previous messages
            befriend.activities.createActivity.toggleError(false);
            let message_el = document.getElementById('create-activity-top-message');
            message_el.querySelector('.message').style.transition = 'none';
            removeClassEl('show', message_el);
            message_el.querySelector('.message').style.removeProperty('height');
            message_el.querySelector('.inner').style.removeProperty('backgroundColor');

            befriend.activities.createActivity.toggle(true);

            // Handle location and mapping
            let place = befriend.places.selected.place;
            let from = befriend.location.device;

            if (befriend.location.isCustom()) {
                befriend.maps.removeMarkers(befriend.maps.markers.pin);
                from = befriend.location.search;
                from.is_custom = true;
            }

            try {
                await befriend.activities.createActivity.resizeAndRepositionMap(map_el);
            } catch (e) {
                console.error(e);
            }

            message_el.querySelector('.message').style.removeProperty('transition');

            try {
                let to = await befriend.activities.createActivity.getPlaceCoordinates(place);
                befriend.activities.createActivity.setTravelTimes(from, to);

                await befriend.activities.createActivity.addPlaceMarkerToMap(to);
            } catch (e) {
                console.error(e);
            }

            befriend.maps.fitMarkersWithMargin(
                befriend.maps.maps.activities,
                [befriend.maps.markers.me, befriend.maps.markers.place],
                befriend.maps.markers.place,
                0.2,
                befriend.variables.create_activity_transition_ms,
            );

            setTimeout(async function() {
                befriend.places.activity.toggleDisplayPlaces(false);
            }, befriend.variables.create_activity_transition_ms);
        },
        toggle: function(show) {
            if (show) {
                befriend.timing.showCreateActivity = timeNow();
                addClassEl(befriend.classes.createActivityShown, document.documentElement);
            } else {
                removeClassEl(befriend.classes.createActivityShown, document.documentElement);
            }
        },
        isShown: function() {
            return elHasClass(document.documentElement, befriend.classes.createActivityShown);
        },
        toggleError: function(show, message) {
            let error_message = document.getElementById('create-activity-error');
            if(show) {
                error_message.innerHTML = message;
                addClassEl('error', error_message);
            } else {
                removeClassEl('error', error_message);
            }
        },
        toggleSpinner: function(show) {
            if (show) {
                addClassEl('show', befriend.els.createActivitySpinner);
            } else {
                removeClassEl('show', befriend.els.createActivitySpinner);
            }
        },
        getMatchCounts: function() {
            return new Promise(async (resolve, reject) => {
                let matches_el = befriend.els.createActivity.querySelector('.matches-overview');
                let update_circle_el = matches_el.querySelector('.update-circle');
                let send_el = matches_el.querySelector('.send');
                let interests_el = matches_el.querySelector('.interests');

                let ts = timeNow();
                addClassEl('show', update_circle_el);

                try {
                    let draft = befriend.activities.data.draft;
                    let response = await befriend.auth.get('/activities/matches', {
                        activity: {
                            person: draft.person,
                            duration: draft.duration,
                            place: draft.place,
                            when: draft.when,
                        }
                    });

                    if(response.data?.counts) {
                        send_el.querySelector('.count').innerHTML = formattedNumberDisplay(response.data.counts.send);
                        interests_el.querySelector('.count').innerHTML = `
                            <div class="ultra category">
                                <div class="name">Ultra</div>
                                <div class="number">${formattedNumberDisplay(response.data.counts.interests.ultra)}</div>
                            </div>
                            <div class="super category">
                                <div class="name">Super</div>
                                <div class="number">${formattedNumberDisplay(response.data.counts.interests.super)}</div>
                            </div>
                        `;
                    }
                } catch(e) {
                    console.error(e);
                }

                let transition_duration = 2000;
                let td = timeNow() - ts;

                setTimeout(function() {
                    removeClassEl('show', update_circle_el);
                }, Math.max(transition_duration - td, 0));
            });
        },
        getFilterList: function () {
            let filters = befriend.filters.data.filters;

            let html = '';

            let networks_html = '';
            let networkFilter = filters.networks;

            if(networkFilter?.is_active && networkFilter.is_send) {
                let selectedName = '';

                if (networkFilter.is_any_network) {
                    selectedName = 'Any Network';
                } else if(networkFilter.is_all_verified) {
                    selectedName = 'Any Verified Network';
                } else if (networkFilter.items) {
                    const activeNetworks = Object.values(networkFilter.items).filter(
                        (item) => item.is_active && !item.deleted,
                    );

                    selectedName = `${activeNetworks.length} Network${activeNetworks.length > 1 ? 's' : ''}`;
                }

                networks_html = `<div class="filter networks">
                                <div class="filter-name">Networks</div>
                                <div class="filter-value">${selectedName}</div>
                            </div>`;

                html += networks_html;
            }

            let reviews_html = '';
            let reviewsFilter = filters.reviews;

            if(reviewsFilter.is_active && reviewsFilter.is_send) {
                let review_items = [];

                if(!filters.reviews_new || filters.reviews_new.is_active && filters.reviews_new.is_send) {
                    review_items.push(`Match with new members`);
                }

                for(let k in befriend.filters.reviews.ratings) {
                    let d = befriend.filters.reviews.ratings[k];

                    let filter = filters[d.token];

                    if(filter?.is_active) {
                        if(typeof filter.is_send === 'undefined' || filter.is_send) {
                            review_items.push(`${d.name} <span class="review-rating">${d.current_rating}</span>`);
                        }
                    }
                }

                if(review_items.length) {
                    let items = review_items.map(item => `<div class="item review-item">${item}</div>`).join('\n');

                    reviews_html = `<div class="filter reviews">
                                    <div class="filter-name">Reviews</div>
                                    <div class="filter-value">${items}</div>
                                </div>`;

                    html += reviews_html;
                }
            }

            let verifications_html = '';
            let verificationsFilter = filters.verifications;

            if (verificationsFilter.is_active) {
                let filter_items = [];

                const inPersonFilter = filters.verification_in_person;

                if (inPersonFilter?.is_active) {
                    if(typeof inPersonFilter.is_send === 'undefined' || inPersonFilter.is_send) {
                        filter_items.push('In-Person');
                    }
                }

                const linkedinFilter = filters.verification_linkedin;

                if (linkedinFilter?.is_active) {
                    if(typeof linkedinFilter.is_send === 'undefined' || linkedinFilter.is_send) {
                        filter_items.push('LinkedIn');
                    }
                }

                if (filter_items.length) {
                    let items = filter_items.map(item => `<div class="item">${item}</div>`).join('\n');

                    verifications_html = `<div class="filter verifications">
                                <div class="filter-name">Verifications</div>
                                <div class="filter-value">${items}</div>
                            </div>`;

                    html += verifications_html;
                }
            }

            let distance_html = '';
            let distanceFilter = filters.distance;

            if(distanceFilter.is_active && distanceFilter.is_send) {
                distance_html = `<div class="filter distance">
                                <div class="filter-name">Distance <span class="small">(max)</span></div>
                                <div class="filter-value">${befriend.filters.distance.current} ${befriend.filters.distance.unit}</div>
                            </div>`;

                html += distance_html;
            }

            let ages_html = '';
            let agesFilter = filters.ages;

            if (agesFilter?.is_active && agesFilter.is_send) {
                let ageRange = `${befriend.filters.age.current.min} - ${befriend.filters.age.current.max}`;

                if(befriend.filters.age.current.max === befriend.filters.age.max) {
                    ageRange += '+';
                }

                ages_html = `<div class="filter ages">
                            <div class="filter-name">Age</div>
                            <div class="filter-value">${ageRange}</div>
                        </div>`;

                html += ages_html;
            }

            // Gender filter section
            let genders_html = '';
            let gendersFilter = filters.genders;

            if (gendersFilter?.is_active && gendersFilter.is_send) {
                let selectedGenders = [];

                if (gendersFilter?.items) {
                    const activeGenders = Object.values(gendersFilter.items).filter(
                        item => !item.is_negative && item.is_active
                    );

                    for (let gender of activeGenders) {
                        const genderData = befriend.me.data.genders.find(g => g.id === gender.gender_id);
                        if (genderData) {
                            selectedGenders.push(genderData.name);
                        }
                    }
                } else {
                    selectedGenders.push('Any');
                }

                // Create display string
                let genderDisplay = selectedGenders.length > 0 ? selectedGenders.join(', ') : 'Any';

                genders_html = `<div class="filter genders">
                            <div class="filter-name">Gender</div>
                            <div class="filter-value">${genderDisplay}</div>
                        </div>`;

                html += genders_html;
            }

            let movies_html = '';
            let moviesFilter = filters.movies;

            if (moviesFilter?.is_active && moviesFilter.is_send) {
                let selectedMovies = [];

                if (moviesFilter?.items) {
                    const activeMovies = Object.values(moviesFilter.items).filter(
                        item => item.is_active && !item.deleted
                    );

                    if (activeMovies.length > 0) {
                        selectedMovies = activeMovies.map(movie => ({
                            name: movie.name,
                            importance: movie.importance || befriend.filters.sections.movies.importance.default
                        }));
                    }
                }

                let moviesDisplay = selectedMovies.length > 0
                    ? `${selectedMovies.length} Movie${selectedMovies.length > 1 ? 's' : ''}`
                    : 'Any';

                movies_html = `<div class="filter movies with-importance">
                            <div class="filter-name">Movies</div>
                            <div class="filter-value">
                                ${selectedMovies.length > 0
                    ? selectedMovies.map(movie => `<div class="item">
                                                    <div class="name">${movie.name}</div>
                                                    <div class="importance">${movie.importance}</div>

                                                  </div>`).join('\n')
                    : moviesDisplay}
                            </div>
                        </div>`;

                html += movies_html;
            }

            let tv_shows_html = '';
            let tvShowsFilter = filters.tv_shows;

            if (tvShowsFilter?.is_active && tvShowsFilter.is_send) {
                let selectedShows = [];

                if (tvShowsFilter?.items) {
                    const activeShows = Object.values(tvShowsFilter.items).filter(
                        item => item.is_active && !item.deleted
                    );

                    if (activeShows.length > 0) {
                        selectedShows = activeShows.map(show => ({
                            name: show.name,
                            importance: show.importance || befriend.filters.sections.tv_shows.importance.default
                        }));
                    }
                }

                let showsDisplay = selectedShows.length > 0
                    ? `${selectedShows.length} TV Show${selectedShows.length > 1 ? 's' : ''}`
                    : 'Any';

                tv_shows_html = `<div class="filter tv-shows with-importance">
                            <div class="filter-name">TV Shows</div>
                            <div class="filter-value">
                                ${selectedShows.length > 0
                    ? selectedShows.map(show => `<div class="item">
                                                    <div class="name">${show.name}</div>
                                                    <div class="importance">${show.importance}</div>
                                                  </div>`).join('\n')
                    : showsDisplay}
                            </div>
                        </div>`;

                html += tv_shows_html;
            }

            let sports_html = '';
            let sportsFilter = filters.sports;

            if (sportsFilter?.is_active && sportsFilter.is_send) {
                let sportsByType = {
                    teams: [],
                    leagues: [],
                    play: []
                };

                if (sportsFilter?.items) {
                    const activeSports = Object.values(sportsFilter.items).filter(
                        item => item.is_active && !item.deleted
                    );

                    // Sort sports into their respective categories
                    for(let sport of activeSports) {
                        if (sport.table_key && sportsByType[sport.table_key]) {
                            sportsByType[sport.table_key].push({
                                name: sport.name,
                                importance: sport.importance || befriend.filters.sections.sports.importance.default
                            });
                        }
                    }
                }

                const totalSports = Object.values(sportsByType).reduce(
                    (total, sports) => total + sports.length, 0
                );

                let sportsDisplay = totalSports > 0
                    ? `${totalSports} Sport${totalSports > 1 ? 's' : ''}`
                    : 'Any';

                let categoriesHtml = '';

                const categories = [
                    { key: 'teams', name: 'Teams' },
                    { key: 'leagues', name: 'Leagues' },
                    { key: 'play', name: 'Play' }
                ];

                for(let category of categories) {
                    const sports = sportsByType[category.key];

                    if (sports.length > 0) {
                        categoriesHtml += `
                            <div class="category">
                                <div class="category-name">${category.name}</div>
                                ${sports.map(sport => `
                                    <div class="item">
                                        <div class="name">${sport.name}</div>
                                        <div class="importance">${sport.importance}</div>
                                    </div>
                                `).join('\n')}
                            </div>
                        `;
                    }
                }

                sports_html = `<div class="filter sports with-importance">
                            <div class="filter-name">Sports</div>
                            <div class="filter-value">
                                ${totalSports > 0 ? categoriesHtml : sportsDisplay}
                            </div>
                        </div>`;

                html += sports_html;
            }

            let music_html = '';
            let musicFilter = filters.music;

            if (musicFilter?.is_active && musicFilter.is_send) {
                let musicByType = {
                    genres: [],
                    artists: []
                };

                if (musicFilter?.items) {
                    const activeMusic = Object.values(musicFilter.items).filter(
                        item => item.is_active && !item.deleted
                    );

                    // Sort music into their respective categories
                    for(let item of activeMusic) {
                        if (item.table_key && musicByType[item.table_key]) {
                            musicByType[item.table_key].push({
                                name: item.name,
                                importance: item.importance || befriend.filters.sections.music.importance.default
                            });
                        }
                    }
                }

                const totalMusic = Object.values(musicByType).reduce(
                    (total, music) => total + music.length, 0
                );

                let musicDisplay = totalMusic === 0 ? 'Any' : '';

                let categoriesHtml = '';

                const categories = [
                    { key: 'genres', name: 'Genres' },
                    { key: 'artists', name: 'Artists' },
                ];

                for(let category of categories) {
                    const music = musicByType[category.key];

                    if (music.length > 0) {
                        categoriesHtml += `
                            <div class="category">
                                <div class="category-name">${category.name}</div>
                                ${music.map(item => `
                                    <div class="item">
                                        <div class="name">${item.name}</div>
                                        <div class="importance">${item.importance}</div>
                                    </div>
                                `).join('\n')}
                            </div>
                        `;
                    }
                }

                music_html = `<div class="filter music with-importance">
                            <div class="filter-name">Music</div>
                            <div class="filter-value">
                                ${totalMusic > 0 ? categoriesHtml : musicDisplay}
                            </div>
                        </div>`;

                html += music_html;
            }

            let instruments_html = '';
            let instrumentsFilter = filters.instruments;

            if (instrumentsFilter?.is_active && instrumentsFilter.is_send) {
                let selectedInstruments = [];

                if (instrumentsFilter?.items) {
                    const activeInstruments = Object.values(instrumentsFilter.items).filter(
                        item => item.is_active && !item.deleted
                    );

                    if (activeInstruments.length > 0) {
                        selectedInstruments = activeInstruments.map(instrument => ({
                            name: instrument.name,
                            importance: instrument.importance || befriend.filters.sections.instruments.importance.default
                        }));
                    }
                }

                let instrumentsDisplay = selectedInstruments.length === 0 ? 'Any' : '';

                instruments_html = `<div class="filter instruments with-importance">
                        <div class="filter-name">Instruments</div>
                        <div class="filter-value">
                            ${selectedInstruments.length > 0
                    ? selectedInstruments.map(instrument => `<div class="item">
                                                    <div class="name">${instrument.name}</div>
                                                    <div class="importance">${instrument.importance}</div>
                                                  </div>`).join('\n')
                    : instrumentsDisplay}
                        </div>
                    </div>`;

                html += instruments_html;
            }

            let schools_html = '';
            let schoolsFilter = filters.schools;

            if (schoolsFilter?.is_active && schoolsFilter.is_send) {
                let selectedSchools = [];

                if (schoolsFilter?.items) {
                    const activeSchools = Object.values(schoolsFilter.items).filter(
                        item => item.is_active && !item.deleted
                    );

                    if (activeSchools.length > 0) {
                        selectedSchools = activeSchools.map(school => ({
                            name: school.name,
                            importance: school.importance || befriend.filters.sections.schools.importance.default
                        }));
                    }
                }

                let schoolsDisplay = selectedSchools.length === 0 ? 'Any' : '';

                schools_html = `<div class="filter schools with-importance">
                        <div class="filter-name">Schools</div>
                        <div class="filter-value">
                            ${selectedSchools.length > 0
                    ? selectedSchools.map(school => `<div class="item">
                                                    <div class="name">${school.name}</div>
                                                    <div class="importance">${school.importance}</div>
                                                  </div>`).join('\n')
                    : schoolsDisplay}
                        </div>
                    </div>`;

                html += schools_html;
            }

            let work_html = '';
            let workFilter = filters.work;

            if (workFilter?.is_active && workFilter.is_send) {
                let workByType = {
                    industries: [],
                    roles: []
                };

                if (workFilter?.items) {
                    const activeWork = Object.values(workFilter.items).filter(
                        item => item.is_active && !item.deleted
                    );

                    // Sort work into their respective categories
                    for(let item of activeWork) {
                        if (item.table_key && workByType[item.table_key]) {
                            workByType[item.table_key].push({
                                name: item.name,
                                importance: item.importance || befriend.filters.sections.work.importance.default
                            });
                        }
                    }
                }

                const totalWork = Object.values(workByType).reduce(
                    (total, work) => total + work.length, 0
                );

                let workDisplay = totalWork === 0 ? 'Any' : '';

                work_html = `<div class="filter work with-importance">
                    <div class="filter-name">Work</div>
                    <div class="filter-value">
                        ${totalWork > 0 ? `
                            ${Object.entries(workByType).map(([key, items]) =>
                        items.length > 0 ? `
                                    <div class="category">
                                        <div class="category-name">${key.charAt(0).toUpperCase() + key.slice(1)}</div>
                                        ${items.map(item => `
                                            <div class="item">
                                                <div class="name">${item.name}</div>
                                                <div class="importance">${item.importance}</div>
                                            </div>
                                        `).join('\n')}
                                    </div>
                                ` : ''
                    ).join('\n')}`
                    : workDisplay}
                    </div>
                </div>`;

                html += work_html;
            }

            let life_stages_html = '';
            let lifeStagesFilter = filters.life_stages;

            if (lifeStagesFilter?.is_active && lifeStagesFilter.is_send) {
                let selectedStages = [];

                if (lifeStagesFilter?.items) {
                    const activeStages = Object.values(lifeStagesFilter.items).filter(
                        item => item.is_active && !item.is_negative && !item.deleted
                    );

                    if (activeStages.length > 0) {
                        selectedStages = activeStages.map(stage => ({
                            name: stage.name,
                            importance: stage.importance || befriend.filters.sections.life_stages.importance.default
                        }));
                    }
                }

                let stagesDisplay = selectedStages.length === 0 ? 'Any' : '';

                life_stages_html = `<div class="filter life-stages with-importance">
                            <div class="filter-name">Life Stages</div>
                            <div class="filter-value">
                                ${selectedStages.length > 0
                    ? selectedStages.map(stage => `<div class="item">
                                                        <div class="name">${stage.name}</div>
                                                        <div class="importance">${stage.importance}</div>
                                                      </div>`).join('\n')
                    : stagesDisplay}
                            </div>
                        </div>`;

                html += life_stages_html;
            }

            let relationship_status_html = '';
            let relationshipStatusFilter = filters.relationship_status;

            if (relationshipStatusFilter?.is_active && relationshipStatusFilter.is_send) {
                let selectedStatuses = [];

                if (relationshipStatusFilter?.items) {
                    const activeStatuses = Object.values(relationshipStatusFilter.items).filter(
                        item => item.is_active && !item.is_negative && !item.deleted
                    );

                    if (activeStatuses.length > 0) {
                        selectedStatuses = activeStatuses.map(status => ({
                            name: status.name,
                            importance: status.importance || befriend.filters.sections.relationship_status.importance.default
                        }));
                    }
                }

                let statusDisplay = selectedStatuses.length === 0 ? 'Any' : '';

                relationship_status_html = `<div class="filter relationship-status with-importance">
                            <div class="filter-name">Relationships</div>
                            <div class="filter-value">
                                ${selectedStatuses.length > 0
                    ? selectedStatuses.map(status => `<div class="item">
                                                        <div class="name">${status.name}</div>
                                                        <div class="importance">${status.importance}</div>
                                                      </div>`).join('\n')
                    : statusDisplay}
                            </div>
                        </div>`;

                html += relationship_status_html;
            }

            let languages_html = '';
            let languagesFilter = filters.languages;

            if (languagesFilter?.is_active && languagesFilter.is_send) {
                let selectedLanguages = [];

                if (languagesFilter?.items) {
                    const activeLanguages = Object.values(languagesFilter.items).filter(
                        item => item.is_active && !item.deleted
                    );

                    if (activeLanguages.length > 0) {
                        selectedLanguages = activeLanguages.map(language => ({
                            name: language.name,
                            importance: language.importance || befriend.filters.sections.languages.importance.default
                        }));
                    }
                }

                let languagesDisplay = selectedLanguages.length === 0 ? 'Any' : '';

                languages_html = `<div class="filter languages with-importance">
                            <div class="filter-name">Languages</div>
                            <div class="filter-value">
                                ${selectedLanguages.length > 0
                    ? selectedLanguages.map(language => `<div class="item">
                                                        <div class="name">${language.name}</div>
                                                        <div class="importance">${language.importance}</div>
                                                      </div>`).join('\n')
                    : languagesDisplay}
                            </div>
                        </div>`;

                html += languages_html;
            }

            let politics_html = '';
            let politicsFilter = filters.politics;

            if (politicsFilter?.is_active && politicsFilter.is_send) {
                let selectedPolitics = [];

                if (politicsFilter?.items) {
                    const activePolitics = Object.values(politicsFilter.items).filter(
                        item => item.is_active && !item.is_negative && !item.deleted
                    );

                    if (activePolitics.length > 0) {
                        selectedPolitics = activePolitics.map(politics => ({
                            name: politics.name,
                            importance: politics.importance || befriend.filters.sections.politics.importance.default
                        }));
                    }
                }

                let politicsDisplay = selectedPolitics.length === 0 ? 'Any' : '';

                politics_html = `<div class="filter politics with-importance">
                            <div class="filter-name">Politics</div>
                            <div class="filter-value">
                                ${selectedPolitics.length > 0
                    ? selectedPolitics.map(politics => `<div class="item">
                                                        <div class="name">${politics.name}</div>
                                                        <div class="importance">${politics.importance}</div>
                                                      </div>`).join('\n')
                    : politicsDisplay}
                            </div>
                        </div>`;

                html += politics_html;
            }

            let religion_html = '';
            let religionFilter = filters.religion;

            if (religionFilter?.is_active && religionFilter.is_send) {
                let selectedReligions = [];

                if (religionFilter?.items) {
                    const activeReligions = Object.values(religionFilter.items).filter(
                        item => item.is_active && !item.is_negative && !item.deleted
                    );

                    if (activeReligions.length > 0) {
                        selectedReligions = activeReligions.map(religion => ({
                            name: religion.name,
                            importance: religion.importance || befriend.filters.sections.religion.importance.default
                        }));
                    }
                }

                let religionDisplay = selectedReligions.length === 0 ? 'Any' : '';

                religion_html = `<div class="filter religion with-importance">
                            <div class="filter-name">Religion</div>
                            <div class="filter-value">
                                ${selectedReligions.length > 0
                    ? selectedReligions.map(religion => `<div class="item">
                                                        <div class="name">${religion.name}</div>
                                                        <div class="importance">${religion.importance}</div>
                                                      </div>`).join('\n')
                    : religionDisplay}
                            </div>
                        </div>`;

                html += religion_html;
            }

            let drinking_html = '';
            let drinkingFilter = filters.drinking;

            if (drinkingFilter?.is_active && drinkingFilter.is_send) {
                let selectedDrinking = [];

                if (drinkingFilter?.items) {
                    const activeDrinking = Object.values(drinkingFilter.items).filter(
                        item => item.is_active && !item.is_negative && !item.deleted
                    );

                    if (activeDrinking.length > 0) {
                        selectedDrinking = activeDrinking.map(drinking => ({
                            name: drinking.name,
                            importance: drinking.importance || befriend.filters.sections.drinking.importance.default
                        }));
                    }
                }

                let drinkingDisplay = selectedDrinking.length === 0 ? 'Any' : '';

                drinking_html = `<div class="filter drinking with-importance">
                            <div class="filter-name">Drinking</div>
                            <div class="filter-value">
                                ${selectedDrinking.length > 0
                    ? selectedDrinking.map(drinking => `<div class="item">
                                                        <div class="name">${drinking.name}</div>
                                                        <div class="importance">${drinking.importance}</div>
                                                      </div>`).join('\n')
                    : drinkingDisplay}
                            </div>
                        </div>`;

                html += drinking_html;
            }

            let smoking_html = '';
            let smokingFilter = filters.smoking;

            if (smokingFilter?.is_active && smokingFilter.is_send) {
                let selectedSmoking = [];

                if (smokingFilter?.items) {
                    const activeSmoking = Object.values(smokingFilter.items).filter(
                        item => item.is_active && !item.is_negative && !item.deleted
                    );

                    if (activeSmoking.length > 0) {
                        selectedSmoking = activeSmoking.map(smoking => ({
                            name: smoking.name,
                            importance: smoking.importance || befriend.filters.sections.smoking.importance.default
                        }));
                    }
                }

                let smokingDisplay = selectedSmoking.length === 0 ? 'Any' : '';

                smoking_html = `<div class="filter smoking with-importance">
                            <div class="filter-name">Smoking</div>
                            <div class="filter-value">
                                ${selectedSmoking.length > 0
                    ? selectedSmoking.map(smoking => `<div class="item">
                                                        <div class="name">${smoking.name}</div>
                                                        <div class="importance">${smoking.importance}</div>
                                                      </div>`).join('\n')
                    : smokingDisplay}
                            </div>
                        </div>`;

                html += smoking_html;
            }

            return html;
        },
        resizeAndRepositionMap: function (mapEl) {
            return new Promise(async (resolve, reject) => {
                mapEl.style.transition = 'initial';
                mapEl.style.width = '100vw';
                mapEl.style.height = `${befriend.variables.map_create_activity_h}px`;

                const mapBox = mapEl.getBoundingClientRect();

                await rafAwait();

                befriend.maps.maps.activities.resize();

                await rafAwait();

                mapEl.style.position = 'absolute';
                mapEl.style.removeProperty('transition');

                await rafAwait();

                mapEl.style.transform = `translate(${-mapBox.x}px, ${-mapBox.y}px)`;

                await rafAwait();

                resolve();
            });
        },
        getPlaceCoordinates: function (place) {
            return new Promise(async (resolve, reject) => {
                if (!place.location_lat || !place.location_lon) {
                    try {
                        const addressGeo = await befriend.places.getAddressGeo(place);
                        place.location_lat = addressGeo.lat;
                        place.location_lon = addressGeo.lon;
                    } catch (e) {
                        console.error('Error getting address geo:', e);
                        return reject();
                    }
                }

                resolve({
                    lat: place.location_lat,
                    lon: place.location_lon,
                });
            });
        },
        addPlaceMarkerToMap: function (to) {
            befriend.maps.addMarker(
                befriend.maps.maps.activities,
                { lat: to.lat, lon: to.lon },
                { is_place: true },
                true,
            );

            // Wait for the place marker to be added
            const startTime = timeNow();

            return new Promise((resolve) => {
                const checkMarker = () => {
                    if (befriend.maps.markers.place || timeNow() - startTime > 500) {
                        resolve();
                    } else {
                        requestAnimationFrame(checkMarker);
                    }
                };
                checkMarker();
            });
        },
        backButton: async function () {
            let back_el = document.getElementById('create-activity-back');

            back_el.style.display = 'none';

            befriend.els.travelTimes.style.display = 'none';

            befriend.styles.transformStatusBar(
                0,
                befriend.variables.create_activity_transition_ms / 1000,
            );

            let map_to_box = document
                .getElementById('activities-map-wrapper')
                .getBoundingClientRect();

            let map_el = befriend.els.activityMap;

            map_el.style.removeProperty('transition');

            await rafAwait();

            map_el.style.transform = `translate(${map_to_box.x}px, ${map_to_box.y}px)`;

            await rafAwait();

            map_el.style.removeProperty('transform');

            map_el.style.removeProperty('height');
            map_el.style.removeProperty('width');

            map_el.style.transition = 'initial';

            await rafAwait();

            befriend.maps.maps.activities.resize();

            map_el.style.removeProperty('transition');

            befriend.activities.createActivity.toggle(false);

            befriend.maps.removeMarkers(befriend.maps.markers.place);

            befriend.maps.setMapCenter(
                befriend.maps.maps.activities,
                befriend.location.current,
            );

            befriend.maps.centerMap();

            if (befriend.location.isCustom()) {
                befriend.maps.addMarkerCustom();
            }

            back_el.style.removeProperty('display');
            befriend.els.travelTimes.style.removeProperty('display');
        },
        events: {
            init: function () {
                befriend.activities.createActivity.events.activityDuration();
                befriend.activities.createActivity.events.travelTimeMode();
                befriend.activities.createActivity.events.hideCreateActivityMessage();
                befriend.activities.createActivity.events.onCreateActivityBack();
                befriend.activities.createActivity.events.createActivity();
                befriend.activities.createActivity.events.onEditFilters();
            },
            createActivity: function() {
                befriend.els.createActivityBtn.addEventListener('click', async function(e) {
                    if(this._ip) return false;
                    this._ip = true;

                    e.preventDefault();
                    e.stopPropagation();

                    try {
                        befriend.activities.createActivity.toggleError(false);
                        befriend.activities.createActivity.toggleSpinner(true);

                        let r = await befriend.auth.post('/activities', {
                            activity: befriend.activities.data.draft,
                        });

                        befriend.activities.data.addActivity(r.data);

                        //update main view
                        befriend.activities.setView();

                        //show current activity view
                        befriend.activities.displayActivity.display(r.data.activity_token);
                    } catch (e) {
                        let error = e.response?.data?.error;

                        if(Array.isArray(error)) {
                            befriend.activities.createActivity.toggleError(true, error.join(', ') + '.');
                        } else {
                            befriend.activities.createActivity.toggleError(true, error);
                        }
                    }

                    this._ip = false;
                    befriend.activities.createActivity.toggleSpinner(false);
                });
            },
            onCreateActivityBack: function () {
                let back_el = document.getElementById('create-activity-back');

                back_el.addEventListener('click', async function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    befriend.activities.createActivity.backButton();
                });
            },
            onEditFilters: function () {
                let el = befriend.els.createActivity.querySelector('.filters').querySelector('.edit');

                el.addEventListener('click', async function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    befriend.activities.createActivity.backButton();

                    befriend.navigateToView('filters');

                    befriend.maps.needsResize = true;
                });
            },
            activityDuration: function () {
                let level_1_el = befriend.els.activityDuration.querySelector('.level_1');
                let level_1_els = level_1_el.getElementsByClassName('button');
                let level_2_el = befriend.els.activityDuration.querySelector('.level_2');
                let level_2_options = level_2_el.getElementsByClassName('options');
                let all_duration_options = level_2_el.getElementsByClassName('option');

                //handle click on level 1
                for (let level_1_i = 0; level_1_i < level_1_els.length; level_1_i++) {
                    let el = level_1_els[level_1_i];

                    el.addEventListener('click', function (e) {
                        e.preventDefault();
                        e.stopPropagation();

                        removeElsClass(level_1_els, 'active');

                        addClassEl('active', el);

                        let cls = level_1_el.classList;

                        for (let j = 0; j < cls.length; j++) {
                            if (cls[j].includes('group')) {
                                removeClassEl(cls[j], level_1_el);
                            }
                        }

                        addClassEl(`group-${level_1_i + 1}`, level_1_el);

                        //set active options
                        for (let level_2_i = 0; level_2_i < level_2_options.length; level_2_i++) {
                            let group = level_2_options[level_2_i];

                            if (
                                parseInt(group.getAttribute('data-min-max')) ===
                                parseInt(el.getAttribute('data-min-max'))
                            ) {
                                //show group
                                addClassEl('active', group);

                                //select option
                                let option_els = group.getElementsByClassName('option');

                                removeElsClass(option_els, 'selected');

                                let min_selected = null;

                                //previously selected by user
                                for (let i = 0; i < option_els.length; i++) {
                                    let option_el = option_els[i];

                                    if (elHasClass(option_el, 'is_user')) {
                                        let min = parseInt(option_el.getAttribute('data-min'));
                                        min_selected = min;
                                        addClassEl('selected', option_el);
                                    }
                                }

                                if (!min_selected) {
                                    //custom for group
                                    if (level_1_i === 0) {
                                        for (let i = 0; i < option_els.length; i++) {
                                            let option_el = option_els[i];

                                            let min = parseInt(option_el.getAttribute('data-min'));

                                            if (min === 30) {
                                                addClassEl('selected', option_el);
                                                min_selected = min;
                                            }
                                        }
                                    } else {
                                        min_selected = parseInt(option_els[0].getAttribute('data-min'));
                                        addClassEl('selected', option_els[0]);
                                    }
                                }

                                befriend.activities.createActivity.updateDuration(min_selected);
                            } else {
                                removeClassEl('active', group);
                            }
                        }
                    });
                }

                //handle selection of duration
                for (let i = 0; i < all_duration_options.length; i++) {
                    let el = all_duration_options[i];

                    el.addEventListener('click', function (e) {
                        e.preventDefault();
                        e.stopPropagation();

                        let group_options = el.closest('.options').getElementsByClassName('option');

                        removeElsClass(group_options, 'selected');
                        removeElsClass(group_options, 'is_user');

                        addClassEl('selected', el);
                        addClassEl('is_user', el);

                        let min = parseInt(el.getAttribute('data-min'));

                        befriend.activities.createActivity.updateDuration(min);
                    });
                }
            },
            travelTimeMode: function () {
                let els = befriend.els.travelTimes.getElementsByClassName('mode');

                for (let i = 0; i < els.length; i++) {
                    let mode_el = els[i];

                    mode_el.addEventListener('click', function (e) {
                        e.preventDefault();
                        e.stopPropagation();

                        //already selected
                        if (elHasClass(mode_el, 'active')) {
                            return false;
                        }

                        removeElsClass(els, 'active');

                        addClassEl('active', mode_el);

                        befriend.activities.createActivity.travel.mode = mode_el.getAttribute('data-mode');

                        befriend.activities.draft.update(
                            'travel.mode',
                            befriend.activities.createActivity.travel.mode
                        );

                        befriend.activities.createActivity.updateWhenAuto();
                    });
                }
            },
            appMode: function () {
                let els = befriend.els.createActivity.querySelector('.modes').getElementsByClassName('mode-option');

                for (let i = 0; i < els.length; i++) {
                    let mode_el = els[i];

                    mode_el.addEventListener('click', function (e) {
                        e.preventDefault();
                        e.stopPropagation();

                        //already selected
                        if (elHasClass(mode_el, 'active')) {
                            return false;
                        }

                        removeElsClass(els, 'active');

                        addClassEl('active', mode_el);

                        befriend.activities.createActivity.setAppMode(mode_el.getAttribute('data-mode'));
                    });
                }
            },
            hideCreateActivityMessage: function () {
                let message_el = document.getElementById('create-activity-top-message');
                let close_el = message_el.querySelector('.close');

                close_el.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    message_el.querySelector('.message').style.removeProperty('height');
                    removeClassEl('show', message_el);
                });
            },
            notifications: {
                init: function () {
                    return new Promise(async (resolve, reject) => {
                        befriend.activities.events.notifications.onLaunched();
                        befriend.activities.events.notifications.onNotification();
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

                            befriend.notifications.fetchActivity(notification, true);

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
                                befriend.notifications.fetchActivity(notification.notification);
                            } else {
                                //show in-app notification
                                befriend.notifications.showNotificationBar();

                                //tmp - todo remove
                                befriend.notifications.fetchActivity(notification);
                            }
                        });
                    } catch (e) {
                        console.error(e);
                    }
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

                            try {
                                let responseData;

                                if(currentNotification.access?.token) { //3rd-party network
                                    let url = joinPaths(currentNotification.access.domain, `activities/networks/notifications/accept/${activity.activity_token}/${currentNotification.access.token}`);

                                    let r = await axios.put(url, {
                                        person_token: befriend.user.person.token
                                    });

                                    responseData = r.data;
                                } else { //own network
                                    let r = await befriend.auth.put(`/activities/${activity_token}/notification/accept`);
                                    responseData = r.data;
                                }

                                if(responseData.success) {
                                    currentNotification.notification.accepted_at = timeNow();

                                    accept_el.querySelector('.text').innerHTML = `You're going!`;
                                    addClassEl('accepted', parent_el);
                                    befriend.notifications.updateAvailableSpots(activity_token, responseData.spots.available);
                                } else {
                                    befriend.notifications.showUnavailable(responseData.data.error);
                                }
                            } catch(e) {
                                if(e.response?.data?.error) {
                                    befriend.notifications.showUnavailable(e.response.data.error);
                                }
                                console.error(e);
                            }
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
                                    let url = joinPaths(currentNotification.access.domain, `activities/networks/notifications/decline/${activity.activity_token}/${currentNotification.access.token}`);

                                    let r = await axios.put(url, {
                                        person_token: befriend.user.person.token
                                    });

                                    responseData = r.data;
                                } else { //own network
                                    let r = await befriend.auth.put(`/activities/${activity_token}/notification/decline`);
                                    responseData = r.data;
                                }

                                if(responseData.success) {
                                    currentNotification.notification.declined_at = timeNow();
                                    decline_el.querySelector('.text').innerHTML = 'You declined this invitation';
                                    addClassEl('declined', parent_el);
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
            }
        }
    },
    displayActivity: {
        currentToken: null,
        display: async function (activity_token, no_transition) {
            try {
                let activity_data = befriend.activities.data.all[activity_token];

                if(!activity_data) {
                    return;
                }

                //get/set dynamic properties
                const propertyRequests = {};

                if(!activity_data.data?.place) {
                    propertyRequests.place = befriend.auth.get(`/places/fsq/${activity_data.data.fsq_place_id}`);
                }

                if(Object.keys(propertyRequests).length) {
                    try {
                        await Promise.all(
                            Object.entries(propertyRequests).map(async ([key, promise]) => {
                                let response = await promise;
                                activity_data.data[key] = response.data;
                            })
                        );
                    } catch(e) {
                        console.error(e);
                    }
                }

                this.currentToken = activity_token;

                this.setHtml(activity_data);

                if(!no_transition) {
                    //prevent navigation
                    befriend.preventNavigation(true);
                }

                removeClassEl('show', befriend.els.mainActivitiesView);
                removeClassEl('show', befriend.els.activityNotificationView);
                addClassEl('show', befriend.els.currentActivityView);

                if(!no_transition) {
                    document.getElementById('create-activity-back').style.display = 'none';
                    befriend.els.travelTimes.style.display = 'none';

                    befriend.styles.transformStatusBar(
                        0,
                        befriend.variables.create_activity_transition_ms / 1000,
                    );

                    let view_el = befriend.els.views.querySelector(`.view-activities`);
                    let map_el = befriend.els.activityMap.querySelector('canvas');

                    view_el.style.position = 'fixed';
                    view_el.style.backgroundColor = 'white';
                    view_el.style.zIndex = '10';
                    view_el.style.top = '0';
                    view_el.style.width = '100vw';
                    view_el.style.height = '100vh';
                    view_el.style.transform = `translateX(-100vw)`;

                    addClassEl('active', view_el);

                    await rafAwait();

                    view_el.style.transition = `all ${befriend.variables.display_activity_transition_ms}ms`;

                    map_el.style.transition = `all ${befriend.variables.display_activity_transition_ms}ms`;

                    befriend.els.createActivity.style.transition = `all ${befriend.variables.display_activity_transition_ms}ms`;

                    await rafAwait();

                    view_el.style.transform = `translateX(0)`;

                    befriend.els.createActivity.style.transform = `translateX(100vw)`;
                    map_el.style.transform = `translateX(100vw)`;

                    befriend.navigateToView('activities', true);

                    setTimeout(async function () {
                        let remove_props = ['position', 'background-color', 'z-index', 'top', 'width', 'height', 'transition'];

                        for(let prop of remove_props) {
                            view_el.style.removeProperty(prop);
                        }

                        befriend.els.createActivity.style.removeProperty('transition');
                        befriend.els.createActivity.style.removeProperty('transform');

                        map_el.style.removeProperty('transition');
                        map_el.style.transform = `translateX(0)`;

                        await rafAwait();

                        befriend.activities.createActivity.toggle(false);

                        befriend.maps.needsResize = true;

                        befriend.activities.createActivity.backButton();

                        befriend.preventNavigation(false);

                    }, befriend.variables.display_activity_transition_ms);
                }
            } catch(e) {
                console.error(e);
            }
        },
        getViewHtml(activity_data, view_fn) {
            let activity = activity_data.data;

            if(!activity) {
                console.error("No data for activity");
                return '';
            }

            let fns = {
                getInvite: function () {
                    let activity_type = befriend.activities.activityTypes.lookup.byToken[activity.activity_type_token];

                    return `<div class="invite">
                                <div class="image">
                                    ${activity_type?.image}
                                </div>
                                
                                <div class="name-duration">
                                    <div class="name">
                                        ${activity_type?.notification} @ ${activity?.human_time}
                                    </div>
                                    
                                    <div class="duration">
                                        ${befriend.activities.getDurationStr(activity.activity_duration_min)}
                                    </div>
                                </div>
                            </div>`;
                },
                getOverview: function () {
                    let friends_type = '';

                    if(activity.is_new_friends && activity.is_existing_friends) {
                        friends_type = 'Both';
                    } else if(activity.is_new_friends) {
                        friends_type = 'New';
                    } else if(activity.is_existing_friends) {
                        friends_type = 'Existing';
                    }

                    let selected_mode = befriend.modes.options.find(mode => mode.id === activity?.mode?.token);
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
                                            ${activity?.mode?.name}
                                        </div>
                                    </div>
                                    
                                    <div class="friend-type sub-section">
                                        <div class="title">Friends</div>
                                        <div class="text">${friends_type}</div>
                                    </div>
                                    
                                    <div class="total-persons sub-section">
                                        <div class="title">Total Spots</div>
                                        <div class="text">${activity?.persons_qty}</div>
                                    </div>
                                    
                                    <div class="persons-accepted sub-section">
                                        <div class="title">Accepted</div>
                                        <div class="text">
                                            <div class="new"></div>
                                            <div class="current">${activity?.persons_qty - activity.spots_available}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>`;
                },
                getNetwork: function () {
                    let network = activity.network;

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
                },
                getWho: function () {
                    //do not show who section if nobody has accepted the activity yet
                    if(!activity_data.matching || !(Object.keys(activity_data.matching).length)) {
                        return '';
                    }

                    // debugger;
                    return `<div class="who section">
                            <div class="label">Who</div>
                            
                            <div class="content">
                            </div>
                        </div>`;
                },
                getPlace: function () {
                    let rating_price = `
        <div class="rating-price">
            <div class="rating">${befriend.places.activity.html.getRating(activity.place)}</div>
            <div class="price">${befriend.places.activity.html.getPrice(activity.place)}</div>
        </div>`;

                    let distance_km = calculateDistance(
                        befriend.location.device,
                        {
                            lat: activity.location_lat,
                            lon: activity.location_lon
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
                                    <div class="name">
                                        <div class="distance">${distance_str}</div>
                                        ${activity?.location_name} 
                                    </div>
                                    
                                    ${rating_price}
                                    
                                    <div class="address-container">
                                        ${befriend.places.getPlaceLocation(activity)}
                                    </div>
                                </div>
                           </div>`;
                },
                getDate: function () {
                    let date = getFriendlyDateFromString(activity.human_date);

                    if(isToday(activity.activity_start)) {
                        date = 'Today';
                    } else if(isTomorrow(activity.activity_start)) {
                        date = 'Tomorrow';
                    }

                    return date;
                },
                getMatching: function () {
                    return '';
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
                        let items = activity.matching.items;

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
                            <div class="count">${activity.matching.count} item${activity.matching.count > 1 ? 's' : ''}</div>
                            <div class="score">
                                <div class="text">Score</div>
                                <div class="number">${numberWithCommas(activity.matching.total_score, true)}</div>
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
            }

            if(view_fn) {
                return fns[view_fn]();
            }

            console.log(activity);

            let date = fns.getDate();

            let invite_html = fns.getInvite();

            let overview_html = fns.getOverview();

            let network_html = fns.getNetwork();

            let who_html = fns.getWho();

            let place_html = fns.getPlace();

            let matching_html = fns.getMatching();

            return `<div class="activity">
                    <div class="top-row">
                        <div class="back-button">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 416.001 351.9995"><path id="Left_Arrow" d="M400.001,159.9995H54.625L187.313,27.3115c6.252-6.252,6.252-16.376,0-22.624s-16.376-6.252-22.624,0L4.689,164.6875c-6.252,6.252-6.252,16.376,0,22.624l160,160c3.124,3.124,7.22,4.688,11.312,4.688s8.188-1.564,11.312-4.688c6.252-6.252,6.252-16.376,0-22.624L54.625,191.9995h345.376c8.836,0,16-7.164,16-16s-7.164-16-16-16Z"></path></svg>
                        </div>
                        <h2>Activity</h2>
                        <div class="date">${date}</div>
                    </div>
                    
                    <div class="max-recipients">Temp placeholder</div>
                    
                    ${invite_html}
                    
                    <div class="activity-wrapper">
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
        setHtml: function (activity_data) {
            let view_el = befriend.els.currentActivityView.querySelector('.container');

            view_el.innerHTML = this.getViewHtml(activity_data);

            befriend.styles.displayActivity.updateSectionsHeight();

            befriend.activities.displayActivity.events.onBack();
            befriend.activities.displayActivity.events.onCancel();
            befriend.activities.displayActivity.events.onViewImage();
            befriend.activities.displayActivity.events.onMapsNavigate();
            befriend.activities.displayActivity.events.onReport();
        },
        updateData: function (data) {
            if(!data.activity_token) {
                return;
            }

            if(!befriend.activities.data.all) {
                befriend.activities.data.all = {};
            }

            if(!befriend.activities.data.all[data.activity_token]) {
                befriend.activities.data.all[data.activity_token] = {};
            }

            befriend.activities.data.all[data.activity_token] = {
                ...befriend.activities.data.all[data.activity_token],
                ...data
            }

            //update main view on data update
            befriend.activities.setView();

            //update displayed activity view with new data
            this.updateView(data.activity_token);
        },
        updateView: function (activity_token) {
            if(activity_token !== this.currentToken) {
                return;
            }

            this.updateSpotsAccepted(activity_token);
            this.updateWho(activity_token);
        },
        updateSpotsAccepted: function (activity_token) {
            let activity = befriend.activities.data.all[activity_token];

            let spots = activity.spots?.accepted;

            if(!isNumeric(spots)) {
                return;
            }

            const personsAcceptedEl = befriend.els.currentActivityView.querySelector('.persons-accepted .text');

            if(!personsAcceptedEl) {
                return;
            }

            const currentEl = personsAcceptedEl.querySelector('.current');
            const newEl = personsAcceptedEl.querySelector('.new');

            newEl.textContent = spots;

            addClassEl('fade-out', currentEl);
            addClassEl('fade-in', newEl);

            setTimeout(async () => {
                currentEl.textContent = spots;

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
        updateWho: function (activity_token) {
            let activity = befriend.activities.data.all[activity_token];

            let html = this.getViewHtml(activity, 'getWho');

            let place_section = befriend.els.currentActivityView.querySelector('.place.section');
            let existing_who = befriend.els.currentActivityView.querySelector('.place.who');

            if(!existing_who) {
                place_section.insertAdjacentHTML('afterend', html);
            }
        },
        events: {
            onBack: function () {
                let el = befriend.els.currentActivityView.querySelector('.back-button');

                if(el._listener) {
                    return;
                }

                el._listener = true;

                el.addEventListener('click', function (e) {
                    removeClassEl('show', befriend.els.currentActivityView);
                    addClassEl('show', befriend.els.mainActivitiesView);
                });
            },
            onCancel: function () {

            },
            onViewImage: function () {
                let image_els = befriend.els.currentActivityView.querySelectorAll('.person .image');

                for(let i = 0; i < image_els.length; i++) {
                    let image_el = image_els[i];

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
                }
            },
            onMapsNavigate: function () {

            },
            onReport: function () {

            },
        }
    },
    events: {
        init: function() {
            return new Promise(async (resolve, reject) => {
                try {
                    befriend.activities.activityTypes.events.init();
                    befriend.activities.createActivity.events.init();
                } catch (e) {
                    console.error(e);
                }
                
                resolve();
            });
        },
        onShowActivity: function () {
            let activityEls = befriend.els.mainActivitiesView.getElementsByClassName('activity');

            for(let i = 0; i < activityEls.length; i++) {
                let activityEl = activityEls[i];

                if(activityEl._listener) {
                    continue;
                }

                activityEl._listener = true;

                activityEl.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    let activityToken = activityEl.getAttribute('data-activity-token');

                    if(activityToken) {
                        befriend.activities.displayActivity.display(activityToken, true);
                    }
                });
            }
        }
    }
};