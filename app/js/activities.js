befriend.activities = {
    data: null,
    events: function () {
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
    },
    setActivities: function () {
        return new Promise(async (resolve, reject) => {
            try {
                let r = await axios.get(joinPaths(api_domain, 'activity-venues'));;

                let activities = befriend.activities.data = r.data;

                let html = ``;
                let level_1_html = ``;

                for(let level_1_id in activities) {
                    let activity = activities[level_1_id];

                    let icon_html = ``;

                    if(activity.image) {
                        icon_html += `<div class="image">
                                        ${activity.image}
                                    </div>`;
                    } else {
                        icon_html += `<div class="emoji">
                                        ${activity.emoji}
                                    </div>`;
                    }

                    level_1_html += `
                        <div class="activity">
                            <div class="activity_wrapper">
                                <div class="icon">${icon_html}</div>
                                <div class="name">${activity.name}</div>
                            </div>
                            <div class="level_2"></div>
                        </div>
                    `;
                }

                html = `
                    <div class="level_1">${level_1_html}</div>
                `;

                befriend.els.activities.querySelector('.activities').innerHTML = html;
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
    }
};