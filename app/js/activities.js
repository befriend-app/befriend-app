befriend.activities = {
    data: null,
    when: {
        options: [
            {name: 'Now', is_now: true},
            {value: '15', unit: 'mins', mins: 15},
            {value: '30', unit: 'mins', mins: 30},
            {value: '45', unit: 'mins', mins: 45},
            {value: '1', unit: 'hr', mins: 60},
            {value: '1.5', unit: 'hrs', mins: 90},
            {value: '2', unit: 'hrs', mins: 120},
            {value: '3', unit: 'hrs', mins: 180},
            {value: '4', unit: 'hrs', mins: 240},
            {name: 'Schedule', is_schedule: true},
        ]
    },
    selected: {
        level_1: null,
        level_2: null,
        level_3: null,
    },
    colors: [
        "#FFF7A1",  // Light Yellow
        "#FFE0B2",  // Light Orange
        "#FFCC80",  // Light Apricot
        "#FFB74D",  // Medium Orange
        "#FFA000",  // Dark Yellow
        "#A2DFF7",  // Light Sky Blue
        "#B3E5FC",  // Light Cyan
        "#99CCFF",  // Light Blue
        "#64B5F6",  // Soft Blue
        "#FF6F20"   // Dark Orange
    ],
    events: function () {
        return new Promise(async (resolve, reject) => {
            try {
                await befriend.activities.whenEvents();
                 await befriend.activities.level1Events();
                 await befriend.activities.sliderEvents();
            } catch(e) {
                console.error(e);
            }

            resolve();
        });
    },
    setWhen: function () {
        return new Promise(async (resolve, reject) => {
            let html = '';

            for(let i = 0; i < befriend.activities.when.options.length; i++) {
                let option = befriend.activities.when.options[i];

                let name_html = ``;
                let tab_html = ``;

                if(option.is_now || option.is_schedule) {
                    name_html = option.name;
                } else {
                    tab_html = `<div class="value">${option.value}</div>
                                    <div class="unit">${option.unit}</div>`;
                }

                let time_class = '';

                if(option.is_now) {
                    time_class = 'now';
                } else if(option.is_schedule) {
                    time_class = 'schedule';
                } else {
                    time_class = 'time';
                }

                let bc = befriend.activities.colors[i];

                let font_white_class = useWhiteOnBackground(bc) ? 'font_white' : '';

                html += `<div class="when-option ${time_class}" data-index="${i}">
                            <div class="tab ${font_white_class}" style="background-color: ${bc}">${tab_html}</div>

                            <div class="when-container">
                                <div class="name">${name_html}</div>
                                <div class="time"></div>
                            </div>
                         </div>`;
            }

            befriend.els.when.querySelector('.when-options').innerHTML = html;

            befriend.activities.setWhenTimes();
            resolve();
        });
    },
    setWhenTimes: function () {
        function updateTimes() {
            function roundTimeMinutes(time, minutes) {
                var timeToReturn = new Date(time);

                timeToReturn.setMilliseconds(Math.round(timeToReturn.getMilliseconds() / 1000) * 1000);
                timeToReturn.setSeconds(Math.round(timeToReturn.getSeconds() / 60) * 60);
                timeToReturn.setMinutes(Math.round(timeToReturn.getMinutes() / minutes) * minutes);
                return timeToReturn;
            }

            let when_options_els =  befriend.els.when.getElementsByClassName('when-option');

            let date_now = dayjs();

            for(let i = 0; i < when_options_els.length; i++) {
                let el = when_options_els[i];
                let index = el.getAttribute('data-index');
                let data = befriend.activities.when.options[index];

                if(data.is_now || data.is_schedule) {
                    continue;
                }

                let date = date_now.add(data.mins, 'minutes');

                let round_minutes = 5;

                //make time round
                let js_date = roundTimeMinutes(date, round_minutes);
                date = dayjs(js_date);

                //add more time if activity starts in less than an hour
                let minutes_diff = date.diff(date_now, 'minutes') - data.mins;

                if(minutes_diff < 0) {
                    let add_mins = Math.ceil(Math.abs(minutes_diff) / 5) * 5;

                    date = date.add(add_mins, 'minutes');
                }

                console.log({
                    minutes_diff,
                    mins: data.mins
                })

                let time_str = date.format(`h:mm a`);

                el.querySelector('.time').innerHTML = time_str;
            }
        }

        updateTimes();

        //update every minute
        setInterval(updateTimes, 60 * 1000);
    },
    whenEvents: function () {
        return new Promise(async (resolve, reject) => {
            let when_els = befriend.els.when.getElementsByClassName('when-option');

            for(let i = 0; i < when_els.length; i++) {
                let el = when_els[i];

                el.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    removeElsClass(when_els, 'active');

                    addClassEl('active', el);
                });
            }

            resolve();
        });
    },
    setActivities: function () {
        return new Promise(async (resolve, reject) => {
            try {
                await befriend.html.activityTypes();

                resolve();
            } catch (e) {
                return reject();
            }
        });
    },
    createNewActivity: function (persons_count) {
        return new Promise(async (resolve, reject) => {
            try {
                let r = await axios.post(joinPaths(api_domain, 'activities'), {
                    persons: persons_count,
                    filters: {}
                });
            } catch(e) {
                console.error(e);
            }

            resolve();
        });
    },
    level1Events: function () {
        return new Promise(async (resolve, reject) => {
             let els = befriend.els.activities.getElementsByClassName('level_1_activity');

             for(let i = 0; i < els.length; i++) {
                 let el = els[i];

                 el.addEventListener('click', function (e) {
                     e.preventDefault();
                     e.stopPropagation();

                     let parent_id = this.getAttribute('data-id');
                     let activity = befriend.activities.data[parent_id];

                     let level_2_el = this.closest('.level_1_row').nextSibling;

                     //remove activity selection and hide level 2 if same activity clicked
                     if(elHasClass(this, 'active')) {
                         removeClassEl('active', this);

                         hideLevel(level_2_el);

                         befriend.activities.selected.level_1 =  null;
                         befriend.activities.selected.level_2 =  null;
                         befriend.activities.selected.level_3 =  null;

                         befriend.places.hidePlaces();

                         return;
                     } else { //remove active from any previously selected activity
                         removeElsClass(els, 'active');
                         addClassEl('active', this);
                         befriend.activities.selected.level_1 =  activity;
                         befriend.activities.selected.level_2 =  null;
                         befriend.activities.selected.level_3 =  null;
                         befriend.places.displayPlaces(activity);
                     }

                     let prev_level_2 = befriend.els.activities.querySelector('.level_2.show');

                     //do not proceed if no sub categories
                     if(!activity.sub || !Object.keys(activity.sub).length) {
                         if(prev_level_2) {
                             hideLevel(prev_level_2);
                         }

                         return;
                     }

                     //hide other level 2s if different from this one
                     if(prev_level_2) {
                         if(prev_level_2 !== level_2_el) {
                             hideLevel(prev_level_2);
                             addClassEl('show', level_2_el);
                         }
                     } else {
                         addClassEl('show', level_2_el);
                     }

                     level_2_el.setAttribute('data-parent-id', parent_id);

                     let level_2_html = ``;

                     let activities_level_2 = [];

                     for(let level_2_id in activity.sub) {
                         if(activities_level_2.length === befriend.styles.activity_level_2_row_items) {
                             let row_html = activities_level_2.join('');

                             level_2_html += `<div class="level_2_row">
                                            ${row_html}
                                        </div>`;

                             level_2_html += `<div class="level_3"></div>`;

                             activities_level_2.length = [];
                         }

                         let activity = befriend.activities.data[parent_id].sub[level_2_id];

                         let image_html = '';

                         if(activity.image) {
                             image_html += `<div class="image">
                                        ${activity.image}
                                    </div>`;
                         } else if(activity.emoji) {
                             image_html += `<div class="emoji">
                                        ${activity.emoji}
                                    </div>`;
                         }

                         let icon_html = ``;

                         if(image_html) {
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

                     if(activities_level_2.length) {
                         let row_html = activities_level_2.join('');
                         level_2_html += `<div class="level_2_row">
                                            ${row_html}
                                        </div>`;
                         level_2_html += `<div class="level_3"></div>`;
                     }

                     level_2_el.innerHTML = `<div class="level_2_container">
                                                ${level_2_html}
                                            </div>`;

                     let last_row = lastArrItem(level_2_el.getElementsByClassName('level_2_row'));

                     last_row.style.marginBottom = '0px';

                     let level_2_height = getElHeightHidden(level_2_el);

                     level_2_el.setAttribute('data-prev-height', `${level_2_height}px`);

                     level_2_el.style.height = `${level_2_height}px`;

                     befriend.activities.level2Events();
                 });
             }

             resolve();
        });
    },
    level2Events: function () {
        return new Promise(async (resolve, reject) => {
            let level_2_activity_els = befriend.els.activities.getElementsByClassName('level_2_activity');

            for(let i = 0; i < level_2_activity_els.length; i++) {
                let el = level_2_activity_els[i];

                el.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    let parent_id = this.closest('.level_2').getAttribute('data-parent-id');

                    let level_2_id = this.getAttribute('data-id');

                    let level_2_activity = befriend.activities.data[parent_id].sub[level_2_id];

                    let level_3_el = this.closest('.level_2_row').nextSibling;

                    let closest_level_2_el = this.closest('.level_2');
                    let prev_height_level_2 = closest_level_2_el.getAttribute('data-prev-height');

                    //remove activity selection and hide level 3 if same activity clicked
                    if(elHasClass(this, 'active')) {
                        removeClassEl('active', this);

                        hideLevel(level_3_el);

                        closest_level_2_el.style.height = prev_height_level_2;

                        befriend.activities.selected.level_2 =  null;
                        befriend.activities.selected.level_3 =  null;

                        befriend.places.displayPlaces(befriend.activities.selected.level_1);

                        return;
                    } else { //remove active from any previously selected activity
                        removeElsClass(level_2_activity_els, 'active');
                        addClassEl('active', this);
                        befriend.activities.selected.level_2 =  level_2_activity;
                        befriend.activities.selected.level_3 =  null;

                        befriend.places.displayPlaces(befriend.activities.selected.level_2);
                    }

                    let prev_level_3 = befriend.els.activities.querySelector('.level_3.show');

                    //do not proceed if no sub categories
                    if(!level_2_activity.sub || !Object.keys(level_2_activity.sub).length) {
                        if(prev_level_3) {
                            hideLevel(prev_level_3);
                        }

                        closest_level_2_el.style.height = prev_height_level_2;

                        return;
                    }

                    //hide other level 3s if different from this one
                    if(prev_level_3) {
                        if(prev_level_3 !== level_3_el) {
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

                    for(let level_3_id in level_2_activity.sub) {
                        if(activities_level_3.length === befriend.styles.activity_level_3_row_items) {
                            let row_html = activities_level_3.join('');

                            level_3_html += `<div class="level_3_row">
                                            ${row_html}
                                        </div>`;

                            activities_level_3.length = [];
                        }

                        let activity = befriend.activities.data[parent_id].sub[level_2_id].sub[level_3_id];

                        let image_html = '';

                        if(activity.image) {
                            image_html += `<div class="image">
                                        ${activity.image}
                                    </div>`;
                        } else if(activity.emoji) {
                            image_html += `<div class="emoji">
                                        ${activity.emoji}
                                    </div>`;
                        }

                        let icon_html = ``;

                        if(image_html) {
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

                    if(activities_level_3.length) {
                        let row_html = activities_level_3.join('');
                        level_3_html += `<div class="level_3_row">
                                            ${row_html}
                                        </div>`;
                    }

                    level_3_el.innerHTML = `<div class="level_3_container">
                                                ${level_3_html}
                                            </div>`;

                    let last_row = lastArrItem(level_3_el.getElementsByClassName('level_3_row'));

                    last_row.style.marginBottom = '0px';

                    let level_3_height = getElHeightHidden(level_3_el);

                    level_3_el.style.height = `${level_3_height}px`;

                    let total_level_2_height = parseFloat(prev_height_level_2) + level_3_height;

                    closest_level_2_el.style.height = `${total_level_2_height}px`;

                    befriend.activities.level3Events();
                });
            }

             resolve();
        });
    },
    level3Events: function () {
        return new Promise(async (resolve, reject) => {
            let level_3_activity_els = befriend.els.activities.getElementsByClassName('level_3_activity');

            for(let i = 0; i < level_3_activity_els.length; i++) {
                let el = level_3_activity_els[i];

                el.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    let level_3_el = this.closest('.level_3');

                    let parent_id = level_3_el.getAttribute('data-parent-id');

                    let level_2_id = level_3_el.getAttribute('data-level-2-id');

                    let level_3_id = this.getAttribute('data-id');

                    let level_3_activity = befriend.activities.data[parent_id].sub[level_2_id].sub[level_3_id];

                    //remove activity selection and hide level 3 if same activity clicked
                    if(elHasClass(this, 'active')) {
                        removeClassEl('active', this);
                        befriend.activities.selected.level_3 = null;

                        befriend.places.displayPlaces(befriend.activities.selected.level_2);

                    } else { //remove active from any previously selected activity
                        removeElsClass(level_3_activity_els, 'active');
                        addClassEl('active', this);
                        befriend.activities.selected.level_3 =  level_3_activity;

                        befriend.places.displayPlaces(befriend.activities.selected.level_3);
                    }

                });
            }

            resolve();
        });
    },
    sliderEvents: function () {
        return new Promise(async (resolve, reject) => {
            //slider
            let personsCount = 1;
            let sliderRange = document.getElementById('range-num-persons');

            function updatePosition() {
                let widthSubtract = 0;

                if(window.innerWidth < 450) {
                    // widthSubtract = 25;
                }

                let width = sliderRange.offsetWidth - widthSubtract;

                let min = sliderRange.getAttribute('min');
                let max = sliderRange.getAttribute('max');

                let percent = (sliderRange.valueAsNumber - min) / (max);

                let offset = 0;

                let newPosition = width * percent + offset;

                rangeSpan.innerHTML = personsCount;
                rangeSpan.style.left = `${newPosition}px`;
            }

            window.addEventListener('resize', function (e) {
                updatePosition();
            });

            window.addEventListener('orientationchange', function (e) {
                updatePosition();
            });

            //set position of number for range
            let rangeSpan = befriend.els.num_persons.querySelector('.slider span');

            //load prev setting
            // let prevSetting = localStorage.getItem(settings_key);
            //
            // if(prevSetting) {
            //     personsCount = parseInt(prevSetting);
            // }

            sliderRange.setAttribute('value', personsCount);

            sliderRange.addEventListener('input', function (e) {
                let val = this.value;

                if(!isNumeric(val)) {
                    return;
                }

                personsCount = parseInt(val);

                // localStorage.setItem(settings_key, personsCount);

                updatePosition();
            });

            updatePosition();

            //button
            let button_el = document.getElementById('activity-button');

            button_el.addEventListener('click', async function (e) {
                e.preventDefault();
                e.stopPropagation();

                console.log("Activity button");

                try {
                    await befriend.activities.createNewActivity(personsCount);
                } catch(e) {
                    console.error(e);
                }
            });

            resolve();
        });
    }
};