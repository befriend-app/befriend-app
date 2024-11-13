befriend.when = {
    selected: {
        main: null,
        createActivity: null,
    },
    thresholds: {
        //min
        now: 10,
        future: 5,
    },
    options: [
        { id: 'schedule', name: 'Schedule', is_schedule: true },
        { id: 'now', value: 'Now', name: 'Now', is_now: true, mins: 5 },
        { id: 15, value: '15', unit: 'mins', mins: 15 },
        { id: 30, value: '30', unit: 'mins', mins: 30 },
        { id: 45, value: '45', unit: 'mins', mins: 45 },
        { id: 60, value: '1', unit: 'hr', mins: 60 },
        { id: 90, value: '1.5', unit: 'hrs', mins: 90 },
        { id: 120, value: '2', unit: 'hrs', mins: 120 },
        { id: 150, value: '2.5', unit: 'hrs', mins: 150 },
        { id: 180, value: '3', unit: 'hrs', mins: 180 },
        { id: 240, value: '4', unit: 'hrs', mins: 240 },
    ],
    colors: [
        '#FFF7A1', // Light Yellow
        '#FFE0B2', // Light Orange
        '#FFCC80', // Light Apricot
        '#FFB74D', // Medium Orange
        '#FFA000', // Dark Yellow
        '#A2DFF7', // Light Sky Blue
        '#B3E5FC', // Light Cyan
        '#99CCFF', // Light Blue
        '#64B5F6', // Soft Blue
        '#3BA4F4', // Blue
    ],
    init: function () {
        return new Promise(async (resolve, reject) => {
            console.log('[init] When');

            try {
                await befriend.html.setWhen();
            } catch (e) {
                console.error(e);
            }

            resolve();
        });
    },
    setWhenTimes: function () {
        function updateTimes() {
            let when_options_els = befriend.els.when.getElementsByClassName('when-option');

            for (let i = 0; i < when_options_els.length; i++) {
                let el = when_options_els[i];
                let index = el.getAttribute('data-index');
                let data = befriend.when.options[index];

                if (data.is_schedule) {
                    continue;
                }

                let date = befriend.when.getOptionDateTime(data);

                let time_formatted = date.format(`h:mm a`);

                data.time = {
                    formatted: time_formatted,
                    unix: date.unix(),
                };

                el.querySelector('.time').innerHTML = time_formatted;
            }

            if (befriend.places.isPlacesShown()) {
                befriend.places.updatePlacesOpen();
            } else if (befriend.activities.isCreateActivityShown()) {
                //updates time on selected obj for createActivity
                befriend.when.selected.createActivity = structuredClone(
                    befriend.when.selected.main,
                );
                befriend.activities.updateWhenAuto();
            }
        }

        updateTimes();

        //update every minute
        setInterval(updateTimes, 60 * 1000);
    },
    getOptionDateTime: function (option) {
        if (!option) {
            throw new Error('No option provided');
        }

        let date_now = dayjs();

        let date = date_now.add(option.mins, 'minutes');

        let round_minutes = 5;

        //make time round
        let js_date = roundTimeMinutes(date, round_minutes);
        date = dayjs(js_date);

        //add more time if activity starts in less than an hour
        let minutes_diff = date.diff(date_now, 'minutes') - option.mins;

        if (minutes_diff < 0) {
            let add_mins = Math.ceil(Math.abs(minutes_diff) / 5) * 5;

            date = date.add(add_mins, 'minutes');
        }

        return date;
    },
    getCurrentlySelectedDateTime() {
        let activity_time = null;

        let when_selected = befriend.when.selected.main;

        if (when_selected) {
            if (when_selected.is_now) {
                activity_time = dayjs();
            } else if (when_selected.is_schedule) {
                //todo
            } else {
                try {
                    activity_time = befriend.when.getOptionDateTime(when_selected);
                } catch (e) {
                    console.error(e);
                    return null;
                }
            }
        } else {
            return null;
        }

        return activity_time;
    },
    selectOptionIndex: function (index) {
        let when_els = befriend.els.when.getElementsByClassName('when-option');

        removeElsClass(when_els, 'active');

        addClassEl('active', when_els[index]);

        befriend.when.selected.main = befriend.when.options[index];

        befriend.activities.draft.update('when', befriend.when.selected.main);
    },
    updateArrowsVisibility: function () {
        let containerEl = befriend.els.when.querySelector('.when-options-container');
        let arrowLeft = befriend.els.when.querySelector('.arrow-left');
        let arrowRight = befriend.els.when.querySelector('.arrow-right');
        
        const scrollLeft = containerEl.scrollLeft;
        const scrollWidth = containerEl.scrollWidth;
        const clientWidth = containerEl.clientWidth;

        // Check if content is wider than container
        const hasOverflow = scrollWidth > clientWidth;

        // Show/hide left arrow based on scroll position
        hasOverflow && scrollLeft > 0 ? addClassEl('show', arrowLeft) : removeClassEl('show', arrowLeft);

        // Show/hide right arrow based on remaining scroll and overflow
        const lastItemVisible = scrollLeft + clientWidth >= scrollWidth;

        !lastItemVisible ? addClassEl('show', arrowRight) : removeClassEl('show', arrowRight);
    },
    events: {
        init: function () {
            return new Promise(async (resolve, reject) => {
                try {
                    befriend.when.events.onScroll();
                    await befriend.when.events.whenOptions();
                } catch (e) {
                    console.error(e);
                }

                resolve();
            });
        },
        whenOptions: function () {
            return new Promise(async (resolve, reject) => {
                let now_el = null;
                let when_els = befriend.els.when.getElementsByClassName('when-option');

                for (let i = 0; i < when_els.length; i++) {
                    let el = when_els[i];

                    if(el.getAttribute('data-id') === 'now') {
                        now_el = el;
                    }

                    el.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        befriend.when.selectOptionIndex(i);
                    });
                }

                //select now option by default
                if (now_el) {
                    befriend.when.selectOptionIndex(now_el.getAttribute('data-index'));
                }

                resolve();
            });
        },
        onScroll: function () {
            function scrollDirection(direction) {
                const itemWidth = befriend.variables.when_option_width + befriend.variables.when_option_gap_lr;
                const scrollAmount = itemWidth * 3;

                const currentScroll = container.scrollLeft;

                const newScroll = direction === 'left'
                    ? currentScroll - scrollAmount
                    : currentScroll + scrollAmount;

                container.scrollTo({
                    left: newScroll,
                    behavior: 'smooth'
                });
            }

            // Debounce resize handler
            let resizeTimeout;
            let container = befriend.els.when.querySelector('.when-options-container');
            let arrowLeft = befriend.els.when.querySelector('.arrow-left');
            let arrowRight = befriend.els.when.querySelector('.arrow-right');

            window.addEventListener('resize', () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => befriend.when.updateArrowsVisibility(), 150);
            });

            // Scroll handler
            container.addEventListener('scroll', () => {
                befriend.when.updateArrowsVisibility();
            });

            // Arrow click handlers
            arrowLeft.addEventListener('click', () => scrollDirection('left'));
            arrowRight.addEventListener('click', () => scrollDirection('right'));

            befriend.when.updateArrowsVisibility();
        }
    },
};
