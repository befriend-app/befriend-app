befriend.activities = {
    types: {
        data: null,
        colors: [
            "#339DFF",  // Bold Bold
            "#C70039",  // Bold Crimson
            "#FFC300",  // Bright Yellow
            "#FFB142",  // Bold Apricot
            "#79A881",  // Bold Green
            "#28B463",  // Bold Green
            "#3498DB",  // Bold Sky Blue
            "#2980B9",  // Bold Blue
            "#8E44AD",  // Bold Purple
            "#9B59B6",  // Bold Lavender
            "#E74C3C",  // Bright Red
            "#F39C12",  // Bold Orange
            "#7f9aa1",  // Light Grey
            "#16A085",  // Bold Teal
            "#F1C40F",  // Bold Yellow-Green
            "#D35400"   // Bold Carrot Orange
        ],
    },
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
        ],
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
    },
    selected: {
        level_1: null,
        level_2: null,
        level_3: null,
    },
    events: function () {
        return new Promise(async (resolve, reject) => {
            try {
                 await befriend.activities.whenEvents();
                 await befriend.activities.friendEvents();
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

                let schedule_icon = '';

                if(option.is_now) {
                    time_class = 'now';
                } else if(option.is_schedule) {
                    time_class = 'schedule';
                    schedule_icon = `<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 508 423.5801"><path d="M402.059,194.052V51.192c0-11.728-9.542-21.27-21.27-21.27h-16.23v-13.244c0-9.196-7.481-16.678-16.678-16.678h-16.076c-9.197,0-16.68,7.481-16.68,16.678v13.244h-43.109v-13.244C272.016,7.482,264.536,0,255.34,0h-16.078C230.066,0,222.584,7.481,222.584,16.678v13.244h-43.109v-13.244C179.475,7.482,171.994,0,162.797,0h-16.076C137.525,0,130.043,7.481,130.043,16.678v13.244h-43.109v-13.244C86.934,7.482,79.453,0,70.256,0h-16.076C44.983,0,37.5,7.481,37.5,16.678v13.244h-16.23C9.542,29.922,0,39.464,0,51.192v303.018c0,11.728,9.542,21.269,21.27,21.269h278.336c20.874,29.103,54.985,48.101,93.453,48.101,63.379,0,114.941-51.561,114.941-114.939,0-60.35-46.753-109.983-105.941-114.589h0ZM333.125,18h13.434v41.846h-13.434V18ZM240.584,18h13.432v41.846h-13.432V18ZM148.043,18h13.432v41.846h-13.432V18ZM55.5,18h13.434v41.846h-13.434V18ZM21.27,47.922h16.23v13.244c0,9.197,7.482,16.68,16.68,16.68h16.076c9.196,0,16.678-7.482,16.678-16.68v-13.244h43.109v13.244c0,9.197,7.481,16.68,16.678,16.68h16.076c9.196,0,16.678-7.482,16.678-16.68v-13.244h43.109v13.244c0,9.197,7.481,16.68,16.678,16.68h16.078c9.195,0,16.676-7.482,16.676-16.68v-13.244h43.109v13.244c0,9.197,7.482,16.68,16.68,16.68h16.076c9.196,0,16.678-7.482,16.678-16.68v-13.244h16.23c1.772,0,3.27,1.497,3.27,3.27v41.919H18v-41.919c0-1.773,1.497-3.27,3.27-3.27h0ZM21.27,357.479c-1.772,0-3.27-1.497-3.27-3.269V111.11h366.059v82.941c-59.188,4.606-105.939,54.24-105.939,114.589,0,17.454,3.918,34.007,10.908,48.838H21.27v.001ZM393.059,405.58c-53.453,0-96.939-43.486-96.939-96.938s43.486-96.94,96.939-96.94,96.941,43.487,96.941,96.94-43.487,96.938-96.941,96.938h0ZM96.723,278.202h-45.336c-4.971,0-9,4.03-9,9v46.244c0,4.97,4.029,9,9,9h45.336c4.971,0,9-4.03,9-9v-46.244c0-4.971-4.03-9-9-9ZM87.723,324.446h-27.336v-28.244h27.336v28.244ZM305.336,190.389h45.338c4.971,0,9-4.03,9-9v-46.244c0-4.97-4.029-9-9-9h-45.338c-4.971,0-9,4.03-9,9v46.244c0,4.97,4.029,9,9,9ZM314.336,144.145h27.338v28.244h-27.338v-28.244ZM266.023,202.173h-45.338c-4.971,0-9,4.029-9,9v46.243c0,4.97,4.029,9,9,9h45.338c4.971,0,9-4.03,9-9v-46.243c0-4.97-4.029-9-9-9h0ZM257.023,248.416h-27.338v-28.243h27.338v28.243ZM181.373,126.145h-45.338c-4.971,0-9,4.03-9,9v46.244c0,4.97,4.029,9,9,9h45.338c4.971,0,9-4.03,9-9v-46.244c0-4.97-4.029-9-9-9ZM172.373,172.389h-27.338v-28.244h27.338v28.244ZM266.023,278.202h-45.338c-4.971,0-9,4.03-9,9v46.244c0,4.97,4.029,9,9,9h45.338c4.971,0,9-4.03,9-9v-46.244c0-4.971-4.029-9-9-9ZM257.023,324.446h-27.338v-28.244h27.338v28.244ZM266.023,126.145h-45.338c-4.971,0-9,4.03-9,9v46.244c0,4.97,4.029,9,9,9h45.338c4.971,0,9-4.03,9-9v-46.244c0-4.97-4.029-9-9-9ZM257.023,172.389h-27.338v-28.244h27.338v28.244ZM181.373,202.173h-45.338c-4.971,0-9,4.029-9,9v46.243c0,4.97,4.029,9,9,9h45.338c4.971,0,9-4.03,9-9v-46.243c0-4.97-4.029-9-9-9ZM172.373,248.416h-27.338v-28.243h27.338v28.243ZM96.723,202.173h-45.336c-4.971,0-9,4.029-9,9v46.243c0,4.97,4.029,9,9,9h45.336c4.971,0,9-4.03,9-9v-46.243c0-4.97-4.03-9-9-9ZM87.723,248.416h-27.336v-28.243h27.336v28.243ZM96.723,126.145h-45.336c-4.971,0-9,4.03-9,9v46.244c0,4.97,4.029,9,9,9h45.336c4.971,0,9-4.03,9-9v-46.244c0-4.97-4.03-9-9-9ZM87.723,172.389h-27.336v-28.244h27.336v28.244ZM181.373,278.202h-45.338c-4.971,0-9,4.03-9,9v46.244c0,4.97,4.029,9,9,9h45.338c4.971,0,9-4.03,9-9v-46.244c0-4.971-4.029-9-9-9ZM172.373,324.446h-27.338v-28.244h27.338v28.244ZM410.478,298.585c2.485,4.305,1.011,9.809-3.294,12.294l-5.125,2.959v5.917c0,4.971-4.029,9-9,9-3.554,0-6.617-2.065-8.08-5.055l-34.99,20.202c-1.417.818-2.965,1.208-4.491,1.208-3.111,0-6.136-1.614-7.803-4.501-2.485-4.305-1.011-9.809,3.294-12.294l43.07-24.868v-72.763c0-4.971,4.029-9,9-9s9,4.029,9,9v63.433c3.322-.231,6.642,1.39,8.419,4.468h0Z"/></svg>`;
                } else {
                    time_class = 'time';
                }

                let bc = befriend.activities.when.colors[i];

                let font_white_class = useWhiteOnBackground(bc) ? 'font_white' : '';

                let active_class = i === 0 ? 'active' : '';

                html += `<div class="when-option ${time_class} ${active_class}" data-index="${i}">
                            <div class="tab ${font_white_class}" style="background-color: ${bc}">${tab_html}</div>

                            <div class="when-container">
                                <div class="name">${schedule_icon}${name_html}</div>
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
    friendEvents: function () {
        return new Promise(async (resolve, reject) => {
            let friend_els = befriend.els.who.getElementsByClassName('friend-option');

            for(let i = 0; i < friend_els.length; i++) {
                let el = friend_els[i];

                el.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    removeElsClass(friend_els, 'active');
                    addClassEl('active', el);
                });
            }

            resolve();
        });
    },
    setActivityTypes: function () {
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
                     let activity = befriend.activities.types.data[parent_id];

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

                         let activity = befriend.activities.types.data[parent_id].sub[level_2_id];

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

                    let level_2_activity = befriend.activities.types.data[parent_id].sub[level_2_id];

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

                        // befriend.places.displayPlaces(befriend.activities.selected.level_1);

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

                        let activity = befriend.activities.types.data[parent_id].sub[level_2_id].sub[level_3_id];

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

                    let level_3_activity = befriend.activities.types.data[parent_id].sub[level_2_id].sub[level_3_id];

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

            // //button
            // let button_el = document.getElementById('activity-button');
            //
            // button_el.addEventListener('click', async function (e) {
            //     e.preventDefault();
            //     e.stopPropagation();
            //
            //     console.log("Activity button");
            //
            //     try {
            //         await befriend.activities.createNewActivity(personsCount);
            //     } catch(e) {
            //         console.error(e);
            //     }
            // });

            resolve();
        });
    }
};