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

            let accepted_qty = activity.data?.spots?.accepted ?? activity.data?.persons_qty - activity.data?.spots_available;

            if(!isNumeric(accepted_qty)) {
                accepted_qty = 0;
            }

            let date = befriend.activities.displayActivity.html.getDate(activity.data);

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
            let date = befriend.activities.displayActivity.html.getDate(activity.data);

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
                    let activeNetworks = Object.values(networkFilter.items).filter(
                        (item) => item.is_active && !item.deleted,
                    );

                    if(Object.keys(activeNetworks).length === 0) {
                        selectedName = 'My network only';
                    } else {
                        selectedName = `${activeNetworks.length} Network${activeNetworks.length === 1 ? '' : 's'}`;
                    }
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
                        befriend.activities.displayActivity.display(r.data.activity_token, false, true);
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
        }
    },
    displayActivity: {
        currentToken: null,
        getActivity: function () {
            return befriend.activities.data.all[this.currentToken] || null;
        },
        display: async function (activity_token, no_transition, skip_enrich) {
            try {
                let activity_data = befriend.activities.data.all[activity_token];

                if(!activity_data) {
                    return;
                }

                this.currentToken = activity_token;

                if(!activity_data.enriched && !skip_enrich) {
                    try {
                        let r = await befriend.auth.get(`/activities/${activity_token}`);

                        activity_data = r.data;

                        activity_data.enriched = true;
                    } catch(e) {
                        console.error(e);
                    }
                }

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

                    befriend.navigateToView('activities', true, true);

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
        html: {
            getInvite: function (activity) {
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
            getOverview: function (activity) {
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
            getPlace: function (activity) {
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
            getDate: function (activity) {
                let date = getFriendlyDateFromString(activity.human_date);

                if(isToday(activity.activity_start)) {
                    date = 'Today';
                } else if(isTomorrow(activity.activity_start)) {
                    date = 'Tomorrow';
                }

                return date;
            },
            getWho: function (activity) {
                let matching = activity.matching || {};
                let persons = activity.persons || {};

                let html = '';

                let person_tokens = Object.keys(matching);

                if(person_tokens.length) {
                    let persons_nav_html = '';
                    let person_html = '';

                    let unknown_person_int = 1;

                    for(let i = 0; i < person_tokens.length; i++) {
                        let person_token = person_tokens[i];
                        let person = persons[person_token];

                        if(!person) {
                            console.warn('Person not found for activity data');
                            continue;
                        }

                        if(i === 0) {
                            person_html = this.getWhoPerson(activity, person_token);
                        }

                        persons_nav_html += `<div class="person-nav ${i === 0 ? 'active' : ''}" data-person-token="${person_token}">
                                                    <div class="image" style="background-image: url(${person.image_url})"></div>
                                                    <div class="name">${person.first_name || `Person ${unknown_person_int++}`}</div>
                                                </div>`;
                    }

                    html = `<div class="persons-nav">
                                    ${persons_nav_html}
                                </div>
                                
                                <div class="person">
                                ${person_html}
                                </div>`;
                } else {
                    html = `<div class="no-persons">No matches have accepted this activity yet.</div>`
                }

                return `<div class="who section">
                            <div class="label">Who</div>
                            
                            <div class="content">
                                ${html}
                            </div>
                        </div>`;
            },
            getWhoPerson: function (activity, person_token) {
                let age = null;
                let gender_name = null;

                let person = activity?.persons[person_token];

                if(!person) {
                    return '';
                }

                age = person.age;
                gender_name = person.gender?.gender_name || '';

                return `<div class="about">
                            <div class="age">
                                <div class="icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 433.2848 484.2606"><path d="M389.6874,441.4878H37.5974c-3.8212,0-6.9189-3.0977-6.9189-6.9189v-150.8947c0-3.8212,3.0977-6.9189,6.9189-6.9189s6.9189,3.0977,6.9189,6.9189v143.9758h338.2521v-143.9758c0-3.8212,3.0977-6.9189,6.9189-6.9189s6.9189,3.0977,6.9189,6.9189v150.8947c0,3.8212-3.0977,6.9189-6.9189,6.9189Z"/><path d="M235.6515,189.9989c-3.8212,0-6.9189-3.0977-6.9189-6.9189v-87.0123h-30.1803v87.0123c0,3.8212-3.0977,6.9189-6.9189,6.9189s-6.9189-3.0977-6.9189-6.9189v-87.6627c.0076-7.2915,5.9167-13.2006,13.2082-13.2082h31.4326c7.2942.0038,13.2075,5.914,13.2151,13.2082v87.6627c0,3.8212-3.0977,6.9189-6.9189,6.9189Z"/><path d="M213.6424,76.8262c-13.9946-.0152-25.3357-11.3563-25.3509-25.3509,0-11.0703,14.7304-39.597,19.2415-48.0865,2.1068-3.3741,6.5501-4.4015,9.9242-2.2946.9294.5804,1.7142,1.3652,2.2946,2.2946,4.5111,8.4895,19.2415,37.0439,19.2415,48.0865-.0153,13.9946-11.3563,25.3356-25.3509,25.3509ZM213.6424,21.9246c-5.104,9.3088-8.9742,19.2425-11.5131,29.5507.0048,6.3585,5.1633,11.5092,11.5218,11.5044,6.3517-.0048,11.4996-5.1527,11.5044-11.5044-2.5388-10.3082-6.4091-20.2419-11.5131-29.5507Z"/><path d="M213.6424,96.1092c-3.8212,0-6.9189-3.0977-6.9189-6.9189v-19.283c0-3.8212,3.0977-6.9189,6.9189-6.9189s6.9189,3.0977,6.9189,6.9189v19.283c0,3.8212-3.0977,6.9189-6.9189,6.9189Z"/><path d="M280.7559,290.5931c-13.8526.1544-27.2732-4.8185-37.6804-13.9624-16.7421-14.924-42.0134-14.924-58.7555,0-21.6794,18.6154-53.7022,18.6154-75.3816,0-16.7603-14.9319-42.0506-14.9319-58.8108,0-6.0497,5.0154-12.9482,8.9075-20.3693,11.4923-5.6912,1.7797-11.8893.7527-16.7023-2.7676-4.7582-3.4634-7.5596-9.0044-7.5278-14.8895v-55.9533c.0267-21.1726,17.1859-38.3287,38.3585-38.3516h339.5114c21.1726.0229,38.3318,17.1789,38.3585,38.3516v55.9533c.0281,5.891-2.7814,11.4354-7.5486,14.8964-4.7969,3.552-11.0089,4.5818-16.6954,2.7676-7.4116-2.584-14.3007-6.4738-20.3416-11.4854-16.7342-14.917-41.9936-14.917-58.7278,0-10.411,9.1404-23.8341,14.1085-37.6873,13.9485ZM213.6908,251.605c13.8526-.1544,27.2732,4.8185,37.6804,13.9624,16.7456,14.9219,42.0168,14.9219,58.7624,0,21.6638-18.6152,53.6763-18.6152,75.3401,0,4.8033,4.0515,10.2874,7.2188,16.1972,9.3544,1.4777.4809,3.0963.2236,4.352-.6919,1.2053-.8632,1.9131-2.2607,1.8958-3.7431v-55.9741c-.0191-13.5333-10.9873-24.4985-24.5206-24.5137H43.8867c-13.5334.0152-24.5016,10.9804-24.5206,24.5137v55.9533c-.0131,1.4779.6909,2.8706,1.8889,3.7362,1.259.92,2.884,1.1775,4.3658.6919,5.92-2.1349,11.4137-5.3046,16.2249-9.3613,10.4118-9.1453,23.8372-14.1183,37.6943-13.9624,13.8571-.1559,27.2825,4.817,37.6943,13.9624,16.7478,14.9229,42.0215,14.9229,58.7693,0,10.4147-9.1318,23.8371-14.0921,37.6873-13.9278Z"/><path d="M389.6874,375.4744c-14.3104.1994-28.2237-4.7066-39.2441-13.8378-18.0802-15.0518-44.3284-15.0518-62.4087,0-22.8872,18.4852-55.5733,18.4852-78.4605,0-18.0659-15.0482-44.3013-15.0482-62.3671,0-11.0167,9.1282-24.9246,14.0339-39.2303,13.8378-14.3022.2001-28.207-4.7063-39.2164-13.8378-8.6599-7.452-19.7533-11.4674-31.1767-11.2848-3.8212,0-6.9189-3.0977-6.9189-6.9189s3.0977-6.9189,6.9189-6.9189c14.3022-.2001,28.207,4.7063,39.2164,13.8378,18.0659,15.0482,44.3013,15.0482,62.3671,0,22.8828-18.483,55.5639-18.483,78.4467,0,18.0713,15.0476,44.3097,15.0476,62.381,0,22.8979-18.4843,55.5903-18.4843,78.4882,0,8.6684,7.4561,19.7719,11.4716,31.2043,11.2848,3.8212,0,6.9189,3.0977,6.9189,6.9189s-3.0977,6.9189-6.9189,6.9189Z"/><path d="M420.3658,484.2606H6.9189c-3.8212,0-6.9189-3.0977-6.9189-6.9189v-28.5129c.0114-11.692,9.4868-21.1674,21.1788-21.1788h384.9271c11.692.0115,21.1673,9.4868,21.1788,21.1788v28.5129c0,3.8212-3.0977,6.9189-6.9189,6.9189ZM13.8378,470.4227h399.6091v-21.594c-.0038-4.0527-3.2882-7.3372-7.341-7.341H21.1788c-4.0527.0038-7.3371,3.2882-7.341,7.341v21.594Z"/></svg>
                                </div>
                                
                                <div class="text">${age}</div>
                            </div>
                            
                            <div class="gender">
                                <div class="icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 495.114 512.0002"><path d="M454.451,247.8192h-.073c-13.284,0-24.795,7.735-30.268,18.937l-45.856-45.857c17.131-27.83,24.362-61.106,20.364-93.722-4.077-33.256-19.752-64.327-44.138-87.49C327.157,13.7342,291.226-.3898,253.256.0082c-37.944.367-73.621,15.142-100.462,41.604-10.967,10.813-19.99,23.062-26.911,36.323C55.163,85.8582,0,146.0072,0,218.8132c0,32.31,11.16,63.918,31.423,89.001,2.604,3.224,7.329,3.728,10.556,1.122,3.225-2.605,3.728-7.331,1.122-10.556-18.113-22.421-28.088-50.678-28.088-79.567,0-62.004,44.747-113.739,103.639-124.638-4.224,11.334-7.025,23.223-8.298,35.451-36.733,12.982-63.124,48.058-63.124,89.187,0,52.13,42.411,94.54,94.539,94.54,27.254,0,51.841-11.602,69.109-30.114,9.004,2.857,18.299,4.846,27.752,5.888,2.697.297,5.398.511,8.1.656-18.324,27.087-46.928,46.927-80.842,53.471-3.532.681-6.084,3.773-6.084,7.37v39.504c0,4.146,3.36,7.506,7.506,7.506h20.567c9.961,0,18.065,8.091,18.065,18.035,0,9.961-8.104,18.065-18.065,18.065h-20.567c-4.146,0-7.506,3.36-7.506,7.506v37.702c0,4.837-1.871,9.371-5.262,12.763-3.414,3.406-7.95,5.283-12.773,5.283-9.962,0-18.065-8.095-18.065-18.045v-37.703c0-4.146-3.36-7.506-7.506-7.506h-20.567c-9.951,0-18.045-8.104-18.045-18.065,0-9.944,8.095-18.035,18.045-18.035h20.567c4.146,0,7.506-3.36,7.506-7.506v-39.504c0-3.597-2.552-6.689-6.084-7.37-18.301-3.531-35.248-10.904-50.374-21.912-3.35-2.439-8.046-1.702-10.485,1.652-2.44,3.351-1.701,8.046,1.652,10.485,15.232,11.086,32.121,18.877,50.28,23.205v25.938h-13.061c-18.228,0-33.058,14.825-33.058,33.047,0,18.239,14.83,33.078,33.058,33.078h13.061v30.195c0,18.228,14.839,33.058,33.078,33.058,8.827,0,17.13-3.434,23.384-9.674,6.232-6.233,9.664-14.538,9.664-23.384v-30.195h13.061c18.239,0,33.078-14.839,33.078-33.078,0-18.222-14.839-33.047-33.078-33.047h-13.063v-25.94c38.689-9.24,70.649-34.11,89.68-67.038,23.34-1.609,46.152-8.808,66.098-21.086l45.857,45.858c-11.203,5.476-18.938,17.003-18.938,30.34,0,18.561,15.102,33.663,33.664,33.663h73.501c12.922,0,23.435-10.513,23.435-23.435v-73.502c0-18.561-15.101-33.663-33.663-33.663h0ZM141.768,298.3412c-43.851,0-79.527-35.676-79.527-79.528,0-32.4,19.481-60.307,47.33-72.694.301,38.311,15.34,74.264,42.476,101.402,12.571,12.57,27.343,22.659,43.415,29.846-14.159,13-33.002,20.974-53.694,20.974ZM473.102,354.9842c0,4.644-3.779,8.422-8.422,8.422h-73.501c-10.284,0-18.651-8.366-18.651-18.724,0-10.284,8.367-18.65,18.651-18.65,3.036,0,5.773-1.829,6.935-4.634s.52-6.033-1.626-8.181l-55.471-55.471c-2.831-2.831-6.565-4.295-10.347-4.295-2.669,0-5.364.729-7.782,2.223-24.487,15.123-53.823,21.712-82.611,18.531-29.64-3.269-56.478-16.167-77.611-37.301-24.69-24.689-38.218-57.515-38.095-92.432.124-34.913,13.891-67.646,38.764-92.169,49.205-48.512,130.719-49.308,180.808-1.732,21.866,20.77,35.922,48.625,39.575,78.432,3.594,29.313-2.921,59.211-18.346,84.187-3.608,5.845-2.756,13.3,2.072,18.129l55.47,55.47c2.147,2.146,5.374,2.788,8.181,1.626,2.805-1.161,4.634-3.899,4.634-6.935,0-10.284,8.366-18.65,18.65-18.65h.073c10.284,0,18.65,8.366,18.65,18.65v73.504Z"/><path d="M343.921,122.2012c-4.088.689-6.844,4.561-6.155,8.649,4.532,26.895-4.259,54.448-23.517,73.705-9.013,9.014-19.581,15.54-30.845,19.611.068-1.778.114-3.56.114-5.352,0-59.901-37.337-111.238-89.953-131.97.484-.508.951-1.026,1.449-1.524,32.873-32.873,86.362-32.873,119.235,0,4.909,4.909,9.192,10.386,12.729,16.279,2.134,3.555,6.744,4.705,10.3,2.572,3.554-2.134,4.706-6.745,2.572-10.3-4.168-6.943-9.21-13.392-14.985-19.168-38.728-38.726-101.74-38.726-140.468,0-38.726,38.727-38.726,101.74,0,140.468,19.364,19.363,44.798,29.045,70.234,29.045s50.87-9.682,70.234-29.045c22.685-22.686,33.041-55.14,27.704-86.815-.688-4.088-4.552-6.843-8.648-6.155h0ZM170.367,144.6202c29.757,11.514,50.929,40.415,50.929,74.193,0,1.175-.034,2.342-.087,3.504-9.516-4.097-18.434-10.002-26.194-17.763-16.518-16.517-24.729-38.238-24.648-59.934ZM235.938,227.1062c.239-2.734.37-5.498.37-8.293,0-41.627-27.039-77.044-64.467-89.64,1.983-10.5,5.974-20.687,11.957-29.954,49.287,17.38,84.707,64.424,84.707,119.593,0,3.122-.125,6.219-.351,9.293-10.685,1.724-21.634,1.39-32.216-.999h0Z"/></svg>
                                </div>
                                
                                <div class="text">${gender_name}</div>
                            </div>
                        </div>`
            }
        },
        getViewHtml(activity_data) {
            let activity = activity_data.data;

            if(!activity) {
                console.error("No data for activity");
                return '';
            }

            console.log(activity);

            let date = this.html.getDate(activity);

            let invite_html = this.html.getInvite(activity);

            let overview_html = this.html.getOverview(activity);

            let who_html = this.html.getWho(activity);

            let place_html = this.html.getPlace(activity);

            return `<div class="activity">
                    <div class="top-row">
                        <div class="back-button">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 416.001 351.9995"><path id="Left_Arrow" d="M400.001,159.9995H54.625L187.313,27.3115c6.252-6.252,6.252-16.376,0-22.624s-16.376-6.252-22.624,0L4.689,164.6875c-6.252,6.252-6.252,16.376,0,22.624l160,160c3.124,3.124,7.22,4.688,11.312,4.688s8.188-1.564,11.312-4.688c6.252-6.252,6.252-16.376,0-22.624L54.625,191.9995h345.376c8.836,0,16-7.164,16-16s-7.164-16-16-16Z"></path></svg>
                        </div>
                        
                        <h2>Activity</h2>
                        
                        <div class="date">${date}</div>
                    </div>
                    
                    <div class="max-recipients"></div>
                    
                    ${invite_html}
                    
                    <div class="activity-wrapper">
                        ${overview_html}
                        
                        <div class="sections-wrapper">
                            <div class="sections">
                                ${who_html}
                                ${place_html}
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
            befriend.activities.displayActivity.events.onPersonNav();
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

            let activity = befriend.activities.data.all[data.activity_token];

            activity.data.spots = data.spots;
            activity.data.matching = data.matching;
            activity.data.persons = data.persons;

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

            let spots = activity.data?.spots?.accepted;

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

            let html = this.html.getWho(activity.data);

            let who_el = befriend.els.currentActivityView.querySelector('.section.who');

            if(who_el) {
                let el = document.createElement('div');

                el.innerHTML = html;

                who_el.innerHTML = el.querySelector('.who').innerHTML;
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
            onPersonNav: function () {
                let person_nav_els = befriend.els.currentActivityView.getElementsByClassName('person-nav');

                for(let i = 0; i < person_nav_els.length; i++) {
                    let person_nav_el = person_nav_els[i];

                    if(person_nav_el._listener) {
                        continue;
                    }

                    person_nav_el._listener = true;

                    person_nav_el.addEventListener('click', function (e) {
                        e.preventDefault();
                        e.stopPropagation();

                        if(elHasClass(person_nav_el, 'active')) {
                            return;
                        }

                        let person_token = this.getAttribute('data-person-token');

                        removeElsClass(person_nav_els, 'active');

                        addClassEl('active', person_nav_el);

                        let activity = befriend.activities.displayActivity.getActivity();

                        let person_el = befriend.els.currentActivityView.querySelector('.who .person');

                        person_el.innerHTML = befriend.activities.displayActivity.html.getWhoPerson(activity.data, person_token);
                    });
                }

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