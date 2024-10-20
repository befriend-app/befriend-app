befriend.activities = {
    types: {
        data: null,
        colors: [
            "#C70039", // Bold Crimson
            "#FFC300", // Bright Yellow
            "#31a663", // Bold Leaf Green
            "#79A881", // Bold Green
            "#D35400", // Bold Carrot Orange
            "#3498DB", // Bold Sky Blue
            "#2980B9", // Bold Blue
            "#cc6b6b", // Bold Fruit
            "#9B59B6", // Bold Lavender
            "#E74C3C", // Bright Red
            "#F39C12", // Bold Orange
            "#33b1d1", // Light Teal
            "#16A085", // Bold Teal
            "#F1C40F", // Bold Yellow-Green
        ],
    },
    selected: {
        level_1: null,
        level_2: null,
        level_3: null,
    },
    duration: {
        selected: null,
        default: 30, //min
        groups: {
            "60": {
                max: 60,
                num: '10 - 60',
                unit: 'minutes',
                options: [
                    [{
                       num: 10,
                       unit: 'min',
                        minutes: 10
                    }],
                    [{
                        num: 15,
                        unit: 'min',
                        minutes: 15
                    }],
                    [{
                        num: 20,
                        unit: 'min',
                        minutes: 20
                    }],
                    [{
                        num: 30,
                        unit: 'min',
                        minutes: 30
                    }],
                    [{
                        num: 40,
                        unit: 'min',
                        minutes: 40
                    }],
                    [{
                        num: 50,
                        unit: 'min',
                        minutes: 50
                    }],
                ]
            },
            "120": {
                max: 120,
                num: '1 - 2',
                unit: 'hours',
                options: [
                    [{
                        num: 1,
                        unit: 'hr',
                        minutes: 60
                    }],
                    [{
                        num: 1,
                        unit: 'hr',
                        minutes: 70
                    },
                        {
                            num: 10,
                            unit: 'min',
                            minutes: 70
                        }
                    ],
                    [{
                        num: 1,
                        unit: 'hr',
                        minutes: 80
                    },
                        {
                            num: 20,
                            unit: 'min',
                            minutes: 80
                        }
                    ],
                    [{
                        num: 1,
                        unit: 'hr',
                        minutes: 90
                    },
                        {
                            num: 30,
                            unit: 'min',
                            minutes: 90
                        }
                    ],
                    [{
                        num: 1,
                        unit: 'hr',
                        minutes: 100
                    },
                        {
                            num: 40,
                            unit: 'min',
                            minutes: 100
                        }
                    ],
                    [{
                        num: 1,
                        unit: 'hr',
                        minutes: 110
                    },
                        {
                            num: 50,
                            unit: 'min',
                            minutes: 110
                        }
                    ],
                ]
            },
            "240": {
                max: 240,
                num: '2 - 4',
                unit: 'hours',
                options: [
                    [{
                        num: 2,
                        unit: 'hrs',
                        minutes: 120
                    }],
                    [{
                        num: 2.5,
                        unit: 'hrs',
                        minutes: 150
                    }],
                    [{
                        num: 3,
                        unit: 'hrs',
                        minutes: 180
                    }],
                    [{
                        num: 3.5,
                        unit: 'hrs',
                        minutes: 210
                    }],
                ]
            },
            "360": {
                max: 360,
                num: '4 - 6',
                unit: 'hours',
                options: [
                    [{
                        num: 4,
                        unit: 'hrs',
                        minutes: 240
                    }],
                    [{
                        num: 4.5,
                        unit: 'hrs',
                        minutes: 270
                    }],
                    [{
                        num: 5,
                        unit: 'hrs',
                        minutes: 300
                    }],
                    [{
                        num: 5.5,
                        unit: 'hrs',
                        minutes: 330
                    }],
                    [{
                        num: 6,
                        unit: 'hrs',
                        minutes: 360
                    }],
                ]
            }
        }
    },
    init: function () {
        return new Promise(async (resolve, reject) => {
            //add brand color to top of activity colors
            befriend.activities.types.colors.unshift(befriend.variables.brand_color_a);

            //set activity durations
            befriend.activities.setDurations();

            try {
                await befriend.activities.setActivityTypes();
            } catch (e) {
                console.error(e);
            }

            resolve();
        });
    },
    getActivityTypes: function () {
        return new Promise(async (resolve, reject) => {
            try {
                let r = await axios.get(joinPaths(api_domain, "activity_types"));

                befriend.activities.types.data = r.data;

                resolve();
            } catch (e) {
                console.error(e);
                return reject();
            }
        });
    },
    setActivityTypes: function () {
        return new Promise(async (resolve, reject) => {
            try {
                await befriend.activities.getActivityTypes();
                await befriend.html.setActivityTypes();

                resolve();
            } catch (e) {
                return reject();
            }
        });
    },
    setDurations: function () {
        befriend.html.setDurations();
    },
    updateDuration: function (duration) {
        befriend.activities.duration.selected = duration;

        //set duration in when string
        befriend.els.create_activity.querySelector('.when').querySelector('.duration').querySelector('.value').innerHTML = befriend.activities.getDurationStr();

    },
    displayCreateActivity: async function () {
        //set html
        befriend.html.createActivity();

        //transition logic
        let map_el = befriend.els.activities_map;

        let status_bar_height = 0;

        try {
            status_bar_height = await befriend.styles.getStatusBarHeight();
        } catch (e) {}

        //transform/transition system status bar
        befriend.styles.transformStatusBar(
            status_bar_height + 5,
            befriend.variables.create_activity_transition_ms / 1000,
        );

        befriend.activities.toggleCreateActivity(true);

        //add place marker to map
        let place = befriend.places.selected.place;

        let lat = place.location_lat;
        let lon = place.location_lon;

        befriend.maps.addMarker(
            befriend.maps.maps.activities,
            {
                lat,
                lon,
            },
            {
                is_place: true,
            },
            true,
        );

        //remove pin marker if custom location
        if (befriend.location.isCustom()) {
            befriend.maps.removeMarkers(befriend.maps.markers.pin);
        }

        //change height, move map to top

        //remove transition for resizing map canvas
        map_el.style.transition = "initial";
        map_el.style.width = "100vw";
        map_el.style.height = `${befriend.variables.map_create_activity_h}px`;

        //calculate transform
        let map_box = map_el.getBoundingClientRect();

        await rafAwait();

        befriend.maps.maps.activities.resize();

        await rafAwait();

        while (!befriend.maps.markers.place) {
            await rafAwait();
        }

        //update map zoom to show all markers
        befriend.maps.fitMarkersWithMargin(
            befriend.maps.maps.activities,
            [befriend.maps.markers.me, befriend.maps.markers.place],
            befriend.maps.markers.place,
            0.2,
        );

        //remove removed-transition
        map_el.style.removeProperty("transition");
        map_el.style.position = "absolute";

        await rafAwait();

        map_el.style.transform = `translate(${-map_box.x}px, ${-map_box.y}px)`;

        setTimeout(async function () {
            //hide display places/overlay
            befriend.places.toggleDisplayPlaces(false);
        }, befriend.variables.create_activity_transition_ms);
    },
    createNewActivity: function (persons_count) {
        return new Promise(async (resolve, reject) => {
            try {
                let r = await axios.post(joinPaths(api_domain, "activities"), {
                    persons: persons_count,
                    filters: {},
                });
            } catch (e) {
                console.error(e);
            }

            resolve();
        });
    },
    toggleCreateActivity: function (show) {
        if (show) {
            befriend.timing.showCreateActivity = timeNow();

            addClassEl(befriend.classes.createActivityShown, document.documentElement);
        } else {
            removeClassEl(befriend.classes.createActivityShown, document.documentElement);
        }
    },
    isCreateActivityShown: function () {
        return elHasClass(document.documentElement, befriend.classes.createActivityShown);
    },
    updateLevelHeight: function (level_num, skip_set_prev) {
        let level_el = befriend.els.activities.querySelector(`.level_${level_num}.show`);

        if (!level_el) {
            return;
        }

        let last_row = lastArrItem(level_el.getElementsByClassName(`level_${level_num}_row`));

        last_row.style.marginBottom = "0px";

        let level_height = getElHeightHidden(level_el);

        if (!skip_set_prev) {
            level_el.setAttribute("data-prev-height", `${level_height}px`);
        }

        level_el.style.height = `${level_height}px`;
    },
    getDurationStr: function () {
        let minutes = befriend.activities.duration.selected;

        let duration_str = `${minutes} minutes`;

        if(minutes >= 60 && minutes < 120) {
            if(minutes === 60) {
                duration_str = `1 hour`;
            } else {
                duration_str = `1 hour, ${minutes - 60} minutes`;
            }

        } else if(minutes >= 120) {
            let hours = Math.floor(minutes / 60);
            let half = (minutes % 60) / 60;

            if(half) {
                let half_str = half.toFixed(1).replace(/0/g, '');

                duration_str = `${hours}${half_str} hours`;
            } else {
                duration_str = `${hours} hours`;
            }
        }

        return duration_str;
    },
    events: {
        init: function () {
            return new Promise(async (resolve, reject) => {
                try {
                    await befriend.activities.events.level1();
                    befriend.activities.events.onCreateActivityBack();
                    befriend.activities.events.activityDuration();
                } catch (e) {
                    console.error(e);
                }

                resolve();
            });
        },
        onCreateActivityBack: function () {
            let back_el = document.getElementById("create-activity-back");

            back_el.addEventListener("click", async function (e) {
                e.preventDefault();
                e.stopPropagation();

                back_el.style.display = "none";

                befriend.styles.transformStatusBar(0, befriend.variables.create_activity_transition_ms / 1000);

                let map_to_box = document.getElementById("activities-map-wrapper").getBoundingClientRect();

                let map_el = befriend.els.activities_map;

                map_el.style.removeProperty("transition");

                await rafAwait();

                map_el.style.transform = `translate(${map_to_box.x}px, ${map_to_box.y}px)`;

                await rafAwait();

                map_el.style.removeProperty("transform");

                map_el.style.removeProperty("height");
                map_el.style.removeProperty("width");

                map_el.style.transition = "initial";

                await rafAwait();

                befriend.maps.maps.activities.resize();

                map_el.style.removeProperty("transition");

                befriend.activities.toggleCreateActivity(false);

                befriend.maps.removeMarkers(befriend.maps.markers.place);

                befriend.maps.setMapCenter(befriend.maps.maps.activities, befriend.location.current);

                if (befriend.location.isCustom()) {
                    befriend.maps.addMarkerCustom();
                }

                back_el.style.removeProperty('display');
            });
        },
        activityDuration: function () {
            let level_1_el = befriend.els.activity_duration.querySelector('.level_1');
            let level_1_els = level_1_el.getElementsByClassName('button');
            let level_2_el = befriend.els.activity_duration.querySelector('.level_2');
            let level_2_options = level_2_el.getElementsByClassName('options');
            let all_duration_options = level_2_el.getElementsByClassName('option');

            //handle click on level 1
            for(let level_1_i = 0; level_1_i < level_1_els.length; level_1_i++) {
                let el = level_1_els[level_1_i];

                el.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    removeElsClass(level_1_els, 'active');

                    addClassEl('active', el);

                    //set active options
                    for(let level_2_i = 0; level_2_i < level_2_options.length; level_2_i++) {
                        let group = level_2_options[level_2_i];

                        if(parseInt(group.getAttribute('data-min-max')) === parseInt(el.getAttribute('data-min-max'))) {
                            //show group
                            addClassEl('active', group);

                            //select option
                            let option_els = group.getElementsByClassName('option');

                            removeElsClass(option_els, 'selected');

                            let min_selected = null;

                            //previously selected by user
                            for(let i = 0; i < option_els.length; i++) {
                                let option_el = option_els[i];

                                if(elHasClass(option_el, 'is_user')) {
                                    let min = parseInt(option_el.getAttribute('data-min'));
                                    min_selected = min;
                                    addClassEl('selected', option_el);
                                    //
                                    // if(min === befriend.activities.duration.selected) {
                                    //
                                    // }
                                }
                            }

                            if(!min_selected) {
                                //custom for group
                                if(level_1_i === 0) {
                                    for(let i = 0; i < option_els.length; i++) {
                                        let option_el = option_els[i];

                                        let min = parseInt(option_el.getAttribute('data-min'));

                                        if(min === 30) {
                                            addClassEl('selected', option_el);
                                            min_selected = min;
                                        }
                                    }
                                } else {
                                    min_selected = parseInt(option_els[0].getAttribute('data-min'));
                                    addClassEl('selected', option_els[0]);
                                }
                            }

                            befriend.activities.updateDuration(min_selected);
                        } else {
                            removeClassEl('active', group);
                        }
                    }
                });
            }

            //handle selection of duration
            for(let i = 0; i < all_duration_options.length; i++) {
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

                    befriend.activities.updateDuration(min);
                });
            }

        },
        level1: function () {
            return new Promise(async (resolve, reject) => {
                let els = befriend.els.activities.getElementsByClassName("level_1_activity");

                for (let i = 0; i < els.length; i++) {
                    let el = els[i];

                    el.addEventListener("click", function (e) {
                        e.preventDefault();
                        e.stopPropagation();

                        let parent_id = this.getAttribute("data-id");
                        let activity = befriend.activities.types.data[parent_id];

                        let level_2_el = this.closest(".level_1_row").nextSibling;

                        //remove activity selection and hide level 2 if same activity clicked
                        if (elHasClass(this, "active")) {
                            removeClassEl("active", this);

                            hideLevel(level_2_el);

                            befriend.activities.selected.level_1 = null;
                            befriend.activities.selected.level_2 = null;
                            befriend.activities.selected.level_3 = null;

                            befriend.places.hidePlaces();

                            return;
                        } else {
                            //remove active from any previously selected activity
                            removeElsClass(els, "active");
                            addClassEl("active", this);
                            befriend.activities.selected.level_1 = activity;
                            befriend.activities.selected.level_2 = null;
                            befriend.activities.selected.level_3 = null;
                        }

                        let prev_level_2 = befriend.els.activities.querySelector(".level_2.show");

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
                                addClassEl("show", level_2_el);
                            }
                        } else {
                            addClassEl("show", level_2_el);
                        }

                        level_2_el.setAttribute("data-parent-id", parent_id);

                        let level_2_html = ``;

                        let activities_level_2 = [];

                        for (let level_2_id in activity.sub) {
                            if (activities_level_2.length === befriend.variables.activity_level_2_row_items) {
                                let row_html = activities_level_2.join("");

                                level_2_html += `<div class="level_2_row">
                                            ${row_html}
                                        </div>`;

                                level_2_html += `<div class="level_3"></div>`;

                                activities_level_2.length = [];
                            }

                            let activity = befriend.activities.types.data[parent_id].sub[level_2_id];

                            let image_html = "";

                            if (activity.image) {
                                image_html += `<div class="image">
                                        ${activity.image}
                                    </div>`;
                            } else if (activity.emoji) {
                                image_html += `<div class="emoji">
                                        ${activity.emoji}
                                    </div>`;
                            }

                            let icon_html = ``;

                            if (image_html) {
                                icon_html = `<div class="icon">${image_html}</div>`;
                            }

                            let no_icon_class = icon_html ? "" : "no_icon";

                            activities_level_2.push(`
                            <div class="activity level_2_activity" data-id="${level_2_id}">
                                <div class="activity_wrapper ${no_icon_class}">
                                    ${icon_html}
                                    <div class="name">${activity.name}</div>
                                </div>
                            </div>`);
                        }

                        if (activities_level_2.length) {
                            let row_html = activities_level_2.join("");
                            level_2_html += `<div class="level_2_row">
                                            ${row_html}
                                        </div>`;
                            level_2_html += `<div class="level_3"></div>`;
                        }

                        level_2_el.innerHTML = `<div class="level_2_container">
                                                ${level_2_html}
                                            </div>`;

                        befriend.activities.updateLevelHeight(2);

                        befriend.activities.events.level2();
                    });
                }

                resolve();
            });
        },
        level2: function () {
            return new Promise(async (resolve, reject) => {
                let level_2_activity_els = befriend.els.activities.getElementsByClassName("level_2_activity");

                for (let i = 0; i < level_2_activity_els.length; i++) {
                    let el = level_2_activity_els[i];

                    el.addEventListener("click", function (e) {
                        e.preventDefault();
                        e.stopPropagation();

                        let parent_id = this.closest(".level_2").getAttribute("data-parent-id");

                        let level_2_id = this.getAttribute("data-id");

                        let level_2_activity = befriend.activities.types.data[parent_id].sub[level_2_id];

                        let level_3_el = this.closest(".level_2_row").nextSibling;

                        let closest_level_2_el = this.closest(".level_2");

                        let prev_height_level_2 = closest_level_2_el.getAttribute("data-prev-height");

                        //remove activity selection and hide level 3 if same activity clicked
                        if (elHasClass(this, "active")) {
                            removeClassEl("active", this);

                            hideLevel(level_3_el);

                            closest_level_2_el.style.height = prev_height_level_2;

                            befriend.activities.selected.level_2 = null;
                            befriend.activities.selected.level_3 = null;

                            return;
                        } else {
                            //remove active from any previously selected activity
                            removeElsClass(level_2_activity_els, "active");
                            addClassEl("active", this);
                            befriend.activities.selected.level_2 = level_2_activity;
                            befriend.activities.selected.level_3 = null;

                            // only show places when there are no level 3 categories
                            if (!level_2_activity.sub || !Object.keys(level_2_activity.sub).length) {
                                befriend.places.displayPlaces(befriend.activities.selected.level_2);

                                setTimeout(function () {
                                    removeClassEl("active", el);
                                }, befriend.variables.places_transition_ms);
                            }
                        }

                        let prev_level_3 = befriend.els.activities.querySelector(".level_3.show");

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
                                addClassEl("show", level_3_el);
                            }
                        } else {
                            addClassEl("show", level_3_el);
                        }

                        level_3_el.setAttribute("data-parent-id", parent_id);
                        level_3_el.setAttribute("data-level-2-id", level_2_id);

                        let level_3_html = ``;

                        let activities_level_3 = [];

                        for (let level_3_id in level_2_activity.sub) {
                            if (activities_level_3.length === befriend.variables.activity_level_3_row_items) {
                                let row_html = activities_level_3.join("");

                                level_3_html += `<div class="level_3_row">
                                            ${row_html}
                                        </div>`;

                                activities_level_3.length = [];
                            }

                            let activity = befriend.activities.types.data[parent_id].sub[level_2_id].sub[level_3_id];

                            let image_html = "";

                            if (activity.image) {
                                image_html += `<div class="image">
                                        ${activity.image}
                                    </div>`;
                            } else if (activity.emoji) {
                                image_html += `<div class="emoji">
                                        ${activity.emoji}
                                    </div>`;
                            }

                            let icon_html = ``;

                            if (image_html) {
                                icon_html = `<div class="icon">${image_html}</div>`;
                            }

                            let no_icon_class = icon_html ? "" : "no_icon";

                            activities_level_3.push(`
                            <div class="activity level_3_activity" data-id="${level_3_id}">
                                <div class="activity_wrapper ${no_icon_class}">
                                    ${icon_html}
                                    <div class="name">${activity.name}</div>
                                </div>
                            </div>`);
                        }

                        if (activities_level_3.length) {
                            let row_html = activities_level_3.join("");
                            level_3_html += `<div class="level_3_row">
                                            ${row_html}
                                        </div>`;
                        }

                        level_3_el.innerHTML = `<div class="level_3_container">
                                                ${level_3_html}
                                            </div>`;

                        befriend.activities.updateLevelHeight(3);

                        requestAnimationFrame(function () {
                            befriend.activities.updateLevelHeight(2, true);
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

                        befriend.activities.events.level3();
                    });
                }

                resolve();
            });
        },
        level3: function () {
            return new Promise(async (resolve, reject) => {
                let level_3_activity_els = befriend.els.activities.getElementsByClassName("level_3_activity");

                for (let i = 0; i < level_3_activity_els.length; i++) {
                    let el = level_3_activity_els[i];

                    el.addEventListener("click", function (e) {
                        e.preventDefault();
                        e.stopPropagation();

                        console.log("level 3 clicked");

                        let level_3_el = this.closest(".level_3");

                        let parent_id = level_3_el.getAttribute("data-parent-id");

                        let level_2_id = level_3_el.getAttribute("data-level-2-id");

                        let level_3_id = this.getAttribute("data-id");

                        let level_3_activity =
                            befriend.activities.types.data[parent_id].sub[level_2_id].sub[level_3_id];

                        //remove activity selection and hide level 3 if same activity clicked
                        if (elHasClass(this, "active")) {
                            removeClassEl("active", this);
                            befriend.activities.selected.level_3 = null;
                            // befriend.places.displayPlaces(befriend.activities.selected.level_2);
                        } else {
                            //remove active from any previously selected activity
                            removeElsClass(level_3_activity_els, "active");
                            addClassEl("active", this);
                            befriend.activities.selected.level_3 = level_3_activity;

                            befriend.places.displayPlaces(befriend.activities.selected.level_3);

                            setTimeout(function () {
                                removeClassEl("active", el);
                            }, befriend.variables.places_transition_ms);
                        }
                    });
                }

                resolve();
            });
        },
    },
};
