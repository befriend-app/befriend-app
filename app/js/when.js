befriend.when = {
    selected: null,
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
        "#3BA4F4"   // Blue
    ],
    events: function () {
        return new Promise(async (resolve, reject) => {
            let when_els = befriend.els.when.getElementsByClassName('when-option');

            for(let i = 0; i < when_els.length; i++) {
                let el = when_els[i];

                el.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    removeElsClass(when_els, 'active');
                    addClassEl('active', el);

                    befriend.when.selected = befriend.when.options[i];
                });
            }

            //select first option by default
            if(when_els.length) {
                fireClick(when_els[0]);
            }

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
                let data = befriend.when.options[index];

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
    setWhen: function () {
        return new Promise(async (resolve, reject) => {
            try {
                 await befriend.html.setWhen();
            } catch(e) {
                console.error(e);
            }

            resolve();
        });
    }
}

