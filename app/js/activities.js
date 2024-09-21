befriend.activities = {
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