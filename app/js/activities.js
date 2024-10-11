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
    selected: {
        level_1: null,
        level_2: null,
        level_3: null,
    },
    init: function () {
        return new Promise(async (resolve, reject) => {
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
    events: {
        init: function () {
            return new Promise(async (resolve, reject) => {
                try {
                    await befriend.activities.events.level1();
                } catch (e) {
                    console.error(e);
                }

                resolve();
            });
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
                            if (activities_level_2.length === befriend.styles.activity_level_2_row_items) {
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

                        let last_row = lastArrItem(level_2_el.getElementsByClassName("level_2_row"));

                        last_row.style.marginBottom = "0px";

                        let level_2_height = getElHeightHidden(level_2_el);

                        level_2_el.setAttribute("data-prev-height", `${level_2_height}px`);

                        level_2_el.style.height = `${level_2_height}px`;

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

                        console.log("level 2 clicked");

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
                            if (activities_level_3.length === befriend.styles.activity_level_3_row_items) {
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

                        let last_row = lastArrItem(level_3_el.getElementsByClassName("level_3_row"));

                        last_row.style.marginBottom = "0px";

                        let level_3_height = getElHeightHidden(level_3_el);

                        level_3_el.style.height = `${level_3_height}px`;

                        let total_level_2_height = parseFloat(prev_height_level_2) + level_3_height;

                        closest_level_2_el.style.height = `${total_level_2_height}px`;

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
                        }
                    });
                }

                resolve();
            });
        },
    },
};
