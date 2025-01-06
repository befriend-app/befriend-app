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
        { id: 'now', value: 'Now', name: 'Now', is_now: true, in_mins: 5 },
        { id: 15, value: '15', unit: 'mins', in_mins: 15 },
        { id: 30, value: '30', unit: 'mins', in_mins: 30 },
        { id: 45, value: '45', unit: 'mins', in_mins: 45 },
        { id: 60, value: '1', unit: 'hr', in_mins: 60 },
        { id: 90, value: '1.5', unit: 'hrs', in_mins: 90 },
        { id: 120, value: '2', unit: 'hrs', in_mins: 120 },
        { id: 150, value: '2.5', unit: 'hrs', in_mins: 150 },
        { id: 180, value: '3', unit: 'hrs', in_mins: 180 },
        { id: 210, value: '3.5', unit: 'hrs', in_mins: 210 },
        { id: 240, value: '4', unit: 'hrs', in_mins: 240 },
        { id: 270, value: '4.5', unit: 'hrs', in_mins: 270 },
        { id: 300, value: '5', unit: 'hrs', in_mins: 300 },
        { id: 330, value: '5.5', unit: 'hrs', in_mins: 330 },
        { id: 360, value: '6', unit: 'hrs', in_mins: 360 },
        { id: 390, value: '6.5', unit: 'hrs', in_mins: 390 },
        { id: 420, value: '7', unit: 'hrs', in_mins: 420 },
        { id: 450, value: '7.5', unit: 'hrs', in_mins: 450 },
        { id: 480, value: '8', unit: 'hrs', in_mins: 480 },
    ],
    colors: [
        // '#FFF7A1', // Light Yellow
        '#FFE0B2', // Light Orange
        '#FFCC80', // Light Apricot
        '#FFB74D', // Medium Orange
        '#FFA000', // Dark Yellow
        '#EBF5FF', // Lightest Sky Blue
        '#E1F0FF', // Pale Sky Blue
        '#D6EBFF', // Soft Sky Blue
        '#CCE5FF', // Light Sky Blue
        '#C2E0FF', // Cool Sky Blue
        '#B8DBFF', // Medium Sky Blue
        '#ADD6FF', // Bright Sky Blue
        '#A3D1FF', // Light Azure
        '#99CCFF', // Pale Azure
        '#8FC7FF', // Soft Azure
        '#85C1FF', // Medium Azure
        '#7ABCFF', // Bright Azure
        '#70B7FF', // Light Ocean Blue
        '#66B2FF', // Soft Ocean Blue
        '#5CADFF', // Medium Ocean Blue
        '#52A8FF', // Bright Ocean Blue
        '#47A3FF', // Clear Blue
        '#3D9EFF', // Medium Clear Blue
        '#3399FF', // Rich Blue
        '#2894FF', // Bright Medium Blue
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

            if (befriend.places.activity.isPlacesShown()) {
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

        let date = date_now.add(option.in_mins, 'minutes');

        let round_minutes;

        if (option.in_mins >= 240) {
            // 4 hours or more
            round_minutes = 30;
        } else if (option.in_mins >= 120) {
            // 2 hours or more
            round_minutes = 15;
        } else {
            round_minutes = 5;
        }

        //make time round
        let js_date = roundTimeMinutes(date, round_minutes);
        date = dayjs(js_date);

        //add more time if activity starts in less than an hour
        let minutes_diff = date.diff(date_now, 'minutes') - option.in_mins;

        if (minutes_diff < 0) {
            let add_mins = Math.ceil(Math.abs(minutes_diff) / round_minutes) * round_minutes;

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
    events: {
        init: function () {
            return new Promise(async (resolve, reject) => {
                try {
                    // befriend.when.events.onScroll();
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

                    if (el.getAttribute('data-id') === 'now') {
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
                const itemWidth =
                    befriend.variables.when_option_width + befriend.variables.when_option_gap_lr;
                const scrollAmount = itemWidth * 3;

                const currentScroll = container.scrollLeft;

                const newScroll =
                    direction === 'left'
                        ? currentScroll - scrollAmount
                        : currentScroll + scrollAmount;

                container.scrollTo({
                    left: newScroll,
                    behavior: 'smooth',
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
        },
    },
    // updateArrowsVisibility: function () {
    //     let containerEl = befriend.els.when.querySelector('.when-options-container');
    //     let arrowLeft = befriend.els.when.querySelector('.arrow-left');
    //     let arrowRight = befriend.els.when.querySelector('.arrow-right');
    //
    //     const scrollLeft = containerEl.scrollLeft;
    //     const scrollWidth = containerEl.scrollWidth;
    //     const clientWidth = containerEl.clientWidth;
    //
    //     // Check if content is wider than container
    //     const hasOverflow = scrollWidth > clientWidth;
    //
    //     // Show/hide left arrow based on scroll position
    //     hasOverflow && scrollLeft > 0
    //         ? addClassEl('show', arrowLeft)
    //         : removeClassEl('show', arrowLeft);
    //
    //     // Show/hide right arrow based on remaining scroll and overflow
    //     const lastItemVisible = scrollLeft + clientWidth >= scrollWidth;
    //
    //     !lastItemVisible ? addClassEl('show', arrowRight) : removeClassEl('show', arrowRight);
    // },
};
