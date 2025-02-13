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

        if(!currentActivityHtml) {
            addClassEl('dni', currentActivityEl.closest('.section'));
        } else {
            removeClassEl('dni', currentActivityEl.closest('.section'));
        }

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
                        //get activity data from own network or 3rd-party network
                        let r;

                        if(activity_data.access?.token) {
                            r = await befriend.networks.get(activity_data.access.domain, `activities/networks/${activity_token}/${activity_data.access.token}`, {
                                person_token: befriend.user.person.token
                            });
                        } else {
                            r = await befriend.auth.get(`/activities/${activity_token}`);
                        }

                        activity_data = befriend.activities.data.all[activity_token] = r.data;

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

                await rafAwait();

                befriend.styles.displayActivity.updateSectionsHeight();
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

                let navigation_buttons = this.getNavigation(activity);

                return `<div class="place section">
                                <div class="label">Place</div> 
                                
                                <div class="content">
                                    <div class="name">
                                        <div class="distance">${distance_str}</div>
                                        ${activity?.location_name} 
                                    </div>
                                    
                                    ${navigation_buttons}
                                    
                                    ${rating_price}
                                    
                                    <div class="address-container">
                                        ${befriend.places.getPlaceLocation(activity)}
                                    </div>
                                </div>
                           </div>`;
            },
            getNavigation: function (activity) {
                let latitude = activity.location_lat;
                let longitude = activity.location_lon;
                let address = `${activity.location_address}, ${activity.location_locality}, ${activity.location_region}`;

                let encodedAddress = encodeURIComponent(address);

                let googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;

                let appleMapsUrl = `maps://maps.apple.com/?address=${encodedAddress}&ll=${latitude},${longitude}`;

                return `
                    <div class="navigation-buttons">
                        <a href="${googleMapsUrl}" target="_blank" class="nav-button google-maps">
                            <svg class="image" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 92.3 132.3"><path fill="#1a73e8" d="M60.2 2.2C55.8.8 51 0 46.1 0 32 0 19.3 6.4 10.8 16.5l21.8 18.3L60.2 2.2z"/><path fill="#ea4335" d="M10.8 16.5C4.1 24.5 0 34.9 0 46.1c0 8.7 1.7 15.7 4.6 22l28-33.3-21.8-18.3z"/><path fill="#4285f4" d="M46.2 28.5c9.8 0 17.7 7.9 17.7 17.7 0 4.3-1.6 8.3-4.2 11.4 0 0 13.9-16.6 27.5-32.7-5.6-10.8-15.3-19-27-22.7L32.6 34.8c3.3-3.8 8.1-6.3 13.6-6.3"/><path fill="#fbbc04" d="M46.2 63.8c-9.8 0-17.7-7.9-17.7-17.7 0-4.3 1.5-8.3 4.1-11.3l-28 33.3c4.8 10.6 12.8 19.2 21 29.9l34.1-40.5c-3.3 3.9-8.1 6.3-13.5 6.3"/><path fill="#34a853" d="M59.1 109.2c15.4-24.1 33.3-35 33.3-63 0-7.7-1.9-14.9-5.2-21.3L25.6 98c2.6 3.4 5.3 7.3 7.9 11.3 9.4 14.5 6.8 23.1 12.8 23.1s3.4-8.7 12.8-23.2"/></svg>
                            <div class="text">Google Maps</div>
                        </a>
                        
                        ${is_ios ? `
                            <a href="${appleMapsUrl}" target="_blank" class="nav-button apple-maps">
                                <div class="image" style="background-image: url(data:image/png;base64,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)"></div>
                                <div class="text">Apple Maps</div>
                            </a>
                        ` : ''}
                    </div>
                `;
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
                let persons = activity.persons || {};

                let html = '';
                let persons_nav_html = '';
                let person_html = '';

                let defaultSet = false;
                let unknown_person_int = 1;

                for(let person_token in persons) {
                    let person = persons[person_token];

                    if(person_token === befriend.user.person.token) {
                        continue;
                    }

                    if(!defaultSet) {
                        person_html = this.getWhoPerson(activity, person_token);
                    }

                    persons_nav_html += `<div class="person-nav ${!defaultSet ? 'active' : ''}" data-person-token="${person_token}">
                                                    <div class="image" style="background-image: url(${person.image_url})"></div>
                                                    <div class="name">${person.first_name || `Person ${unknown_person_int++}`}</div>
                                                </div>`;

                    defaultSet = true;
                }

                if(persons_nav_html) {
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

                let matching = activity.matching[person_token];

                let match_type_html = '';

                if(matching?.total_score >= matching?.thresholds?.ultra) {
                    match_type_html = `<div class="tag match-type ultra">Ultra match</div>`
                } else if(matching?.total_score >= matching?.thresholds?.super) {
                    match_type_html = `<div class="tag match-type super">Super match</div>`
                }

                let new_member_html = '';

                if(person.is_new) {
                    new_member_html = `<div class="tag new-member">New member</div>`;
                }

                let tags_html = ``;

                if(match_type_html || new_member_html) {
                    tags_html = `<div class="tags">
                                ${match_type_html}
                                ${new_member_html}
                                </div>`;
                }

                let reviews_html = `<div class="reviews">${befriend.user.getReviewsHtml(person, true)}</div>`;

                let about_html = `<div class="about">
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
                        </div>`;

                return `${tags_html}
                        ${about_html}
                        ${reviews_html}`

            },
            matching: {
                getItemTags: function (item) {
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
                },
                getItemSecondary: function (item) {
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
                },
                getContent: function (matching) {
                    let items = matching.items;

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
                                let tags = this.getItemTags(item);
                                let secondary = this.getItemSecondary(item);

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
                            <div class="count">${matching.count} item${matching.count > 1 ? 's' : ''}</div>
                            <div class="score">
                                <div class="text">Score</div>
                                <div class="number">${numberWithCommas(matching.total_score, true)}</div>
                            </div>
                        </div>
                        
                        <div class="matching-groups">${html}</div>`;
                },
                getPersonNav: function(activity) {
                    let persons_nav_html = '';
                    let person_tokens = Object.keys(activity.matching || {});

                    if(person_tokens.length) {
                        let unknown_person_int = 1;

                        for(let i = 0; i < person_tokens.length; i++) {
                            let person_token = person_tokens[i];
                            let person = activity.persons[person_token];

                            if(!person) {
                                console.warn('Person not found for activity data');
                                continue;
                            }

                            persons_nav_html += `<div class="person-nav ${i === 0 ? 'active' : ''}" data-person-token="${person_token}">
                                    <div class="image" style="background-image: url(${person.image_url})"></div>
                                    <div class="name">${person.first_name || `Person ${unknown_person_int++}`}</div>
                                </div>`;
                        }
                    }

                    return persons_nav_html;
                },
                getMatching: function (activity) {
                    let html = '';
                    let default_person_matching = null;

                    if(Object.keys(activity.matching || {}).length) {
                        default_person_matching = Object.values(activity.matching)[0];
                    }

                    if(!default_person_matching) {
                        return '';
                    }

                    let persons_nav = this.getPersonNav(activity);
                    let content = this.getContent(default_person_matching);

                    html = `<div class="persons-nav">
                                ${persons_nav}
                            </div>
                            <div class="matching-content">
                                ${content}
                            </div>`;

                    return `<div class="matching section">
                        <div class="label">Matching</div>
                        <div class="content">
                            ${html}
                        </div>
                    </div>`;
                }
            },
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

            let matching_html = this.html.matching.getMatching(activity);

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
            befriend.activities.displayActivity.events.onPersonNav();
            befriend.activities.displayActivity.events.onMatchingPersonNav();
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

            if(data.spots) {
                activity.data.spots = data.spots;
            }

            if(data.matching) {
                activity.data.matching = data.matching;
            }

            if(data.persons) {
                activity.data.persons = data.persons;
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
            this.updateMatching(activity_token);
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
                let prev_selected_person = who_el.querySelector('.person-nav.active');

                let el = document.createElement('div');

                el.innerHTML = html;

                who_el.innerHTML = el.querySelector('.who').innerHTML;

                befriend.activities.displayActivity.events.onPersonNav();

                if(prev_selected_person) {
                    befriend.activities.displayActivity.selectPersonNav(prev_selected_person.getAttribute('data-person-token'));
                }
            }
        },
        updateMatching: function (activity_token) {
            let activity = befriend.activities.data.all[activity_token];

            let html = this.html.matching.getMatching(activity.data);

            let matching_el = befriend.els.currentActivityView.querySelector('.section.matching');
            let place_el = befriend.els.currentActivityView.querySelector('.section.place');

            if(matching_el) {
                let prev_selected_person = matching_el.querySelector('.person-nav.active');

                let el = document.createElement('div');

                el.innerHTML = html;

                matching_el.innerHTML = el.querySelector('.matching').innerHTML;

                if(prev_selected_person) {
                    befriend.activities.displayActivity.selectMatchingPersonNav(prev_selected_person.getAttribute('data-person-token'));
                }
            } else {
                place_el.insertAdjacentHTML('afterend', html);
            }

            befriend.activities.displayActivity.events.onMatchingPersonNav();
        },
        selectPersonNav: function (person_token) {
            let activity = befriend.activities.displayActivity.getActivity();

            let section_el = befriend.els.currentActivityView.querySelector('.section.who');
            let person_nav_els = section_el.getElementsByClassName('person-nav');
            let person_el = section_el.querySelector('.person');

            removeElsClass(person_nav_els, 'active');

            for(let i = 0; i < person_nav_els.length; i++) {
                let person_nav_el = person_nav_els[i];

                if(person_nav_el.getAttribute('data-person-token') === person_token) {
                    addClassEl('active', person_nav_el);
                    person_el.innerHTML = befriend.activities.displayActivity.html.getWhoPerson(activity.data, person_token);
                    break;
                }
            }
        },
        selectMatchingPersonNav: function (person_token) {
            let activity = befriend.activities.displayActivity.getActivity();

            let section_el = befriend.els.currentActivityView.querySelector('.section.matching');
            let matching_nav_els = section_el.getElementsByClassName('person-nav');
            let matching_content_el = section_el.querySelector('.matching-content');

            removeElsClass(matching_nav_els, 'active');

            for(let i = 0; i < matching_nav_els.length; i++) {
                let matching_nav_el = matching_nav_els[i];

                if(matching_nav_el.getAttribute('data-person-token') === person_token) {
                    addClassEl('active', matching_nav_el);

                    let matching = activity.data.matching[person_token];

                    if(matching) {
                        matching_content_el.innerHTML = befriend.activities.displayActivity.html.matching.getContent(matching);
                    }

                    break;
                }
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
                let person_nav_els = befriend.els.currentActivityView.querySelectorAll('.who .person-nav');

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

                        befriend.activities.displayActivity.selectPersonNav(person_token);
                    });
                }
            },
            onMatchingPersonNav: function() {
                let person_nav_els = befriend.els.currentActivityView.querySelectorAll('.matching .person-nav');

                for(let i = 0; i < person_nav_els.length; i++) {
                    let person_nav_el = person_nav_els[i];

                    if(person_nav_el._listener) {
                        continue;
                    }

                    person_nav_el._listener = true;

                    person_nav_el.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();

                        if(elHasClass(person_nav_el, 'active')) {
                            return;
                        }

                        let person_token = this.getAttribute('data-person-token');

                        befriend.activities.displayActivity.selectMatchingPersonNav(person_token);
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