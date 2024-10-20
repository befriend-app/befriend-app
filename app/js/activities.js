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
        default: 30,
        current: 30
    },
    init: function () {
        return new Promise(async (resolve, reject) => {
            //add brand color to top of activity colors
            befriend.activities.types.colors.unshift(befriend.variables.brand_color_a);

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
            let minutes = befriend.activities.duration.default;

            let sliderRange = document.getElementById("range-activity-duration");

            function updatePosition() {
                let widthSubtract = 0;

                if (window.innerWidth < 450) {
                    // widthSubtract = 25;
                }

                let width = sliderRange.offsetWidth - widthSubtract;

                let min = sliderRange.getAttribute("min");
                let max = sliderRange.getAttribute("max");

                let percent = (sliderRange.valueAsNumber - min) / max;

                let offset = - befriend.variables.range_duration_dim / 2;

                let position = width * percent + offset;

                rangeVal.innerHTML = minutes;
                rangeVal.style.left = `${position}px`;
            }

            window.addEventListener("resize", function (e) {
                updatePosition();
            });

            window.addEventListener("orientationchange", function (e) {
                updatePosition();
            });

            //set position of number for range
            let rangeVal = befriend.els.activity_duration.querySelector(".slider div");

            sliderRange.setAttribute("value", minutes);

            sliderRange.addEventListener("input", function (e) {
                let val = this.value;

                if (!isNumeric(val)) {
                    return;
                }

                minutes = parseInt(val);

                befriend.activities.duration.current = minutes;

                updatePosition();
            });

            updatePosition();
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
