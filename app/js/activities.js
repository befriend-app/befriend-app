befriend.activities = {
    data: null,
    events: function () {
        return new Promise(async (resolve, reject) => {
            try {
                 await befriend.activities.level1Events();
                 await befriend.activities.sliderEvents();
            } catch(e) {
                console.error(e);
            }

            resolve();
        });
    },
    setActivities: function () {
        return new Promise(async (resolve, reject) => {
            try {
                await befriend.html.activities();

                resolve();
            } catch(e) {
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
                         return;
                     } else { //remove active from any previously selected activity
                         removeElsClass(els, 'active');
                         addClassEl('active', this);
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

                         let center_class = icon_html ? '' : 'center';

                         activities_level_2.push(`
                            <div class="activity level_2_activity" data-id="${level_2_id}">
                                <div class="activity_wrapper ${center_class}">
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

                    //remove activity selection and hide level 3 if same activity clicked
                    if(elHasClass(this, 'active')) {
                        removeClassEl('active', this);

                        hideLevel(level_3_el);
                        return;
                    } else { //remove active from any previously selected activity
                        removeElsClass(level_2_activity_els, 'active');
                        addClassEl('active', this);
                    }

                    let prev_level_3 = befriend.els.activities.querySelector('.level_3.show');

                    //do not proceed if no sub categories
                    if(!level_2_activity.sub || !Object.keys(level_2_activity.sub).length) {
                        if(prev_level_3) {
                            hideLevel(prev_level_3);
                        }

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

                        let center_class = icon_html ? '' : 'center';

                        activities_level_3.push(`
                            <div class="activity level_3_activity" data-id="${level_3_id}">
                                <div class="activity_wrapper ${center_class}">
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
            let rangeSpan = document.getElementById('activities').querySelector('.slider span');

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