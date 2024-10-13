befriend.when = {
    selected: null,
    options: [
        { name: "Now", is_now: true },
        { value: "15", unit: "mins", mins: 15 },
        { value: "30", unit: "mins", mins: 30 },
        { value: "45", unit: "mins", mins: 45 },
        { value: "1", unit: "hr", mins: 60 },
        { value: "1.5", unit: "hrs", mins: 90 },
        { value: "2", unit: "hrs", mins: 120 },
        { value: "3", unit: "hrs", mins: 180 },
        { value: "4", unit: "hrs", mins: 240 },
        { name: "Schedule", is_schedule: true },
    ],
    colors: [
        "#FFF7A1", // Light Yellow
        "#FFE0B2", // Light Orange
        "#FFCC80", // Light Apricot
        "#FFB74D", // Medium Orange
        "#FFA000", // Dark Yellow
        "#A2DFF7", // Light Sky Blue
        "#B3E5FC", // Light Cyan
        "#99CCFF", // Light Blue
        "#64B5F6", // Soft Blue
        "#3BA4F4", // Blue
    ],
    init: function () {
        return new Promise(async (resolve, reject) => {
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
            let when_options_els = befriend.els.when.getElementsByClassName("when-option");

            for (let i = 0; i < when_options_els.length; i++) {
                let el = when_options_els[i];
                let index = el.getAttribute("data-index");
                let data = befriend.when.options[index];

                if (data.is_now || data.is_schedule) {
                    continue;
                }

                let date = befriend.when.getOptionDateTime(data);

                el.querySelector(".time").innerHTML = date.format(`h:mm a`);

                if (befriend.places.isPlacesShown()) {
                    befriend.places.updatePlacesOpen();
                }
            }
        }

        updateTimes();

        //update every minute
        setInterval(updateTimes, 60 * 1000);
    },
    getOptionDateTime: function (option) {
        if (!option) {
            throw new Error("No option provided");
        }

        let date_now = dayjs();

        let date = date_now.add(option.mins, "minutes");

        let round_minutes = 5;

        //make time round
        let js_date = roundTimeMinutes(date, round_minutes);
        date = dayjs(js_date);

        //add more time if activity starts in less than an hour
        let minutes_diff = date.diff(date_now, "minutes") - option.mins;

        if (minutes_diff < 0) {
            let add_mins = Math.ceil(Math.abs(minutes_diff) / 5) * 5;

            date = date.add(add_mins, "minutes");
        }

        return date;
    },
    getCurrentlySelectedDateTime() {
        let activity_time = null;

        let when_selected = befriend.when.selected;

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
    events: {
        init: function () {
            return new Promise(async (resolve, reject) => {
                try {
                    await befriend.when.events.whenOptions();
                } catch (e) {
                    console.error(e);
                }

                resolve();
            });
        },
        whenOptions: function () {
            return new Promise(async (resolve, reject) => {
                let when_els = befriend.els.when.getElementsByClassName("when-option");

                for (let i = 0; i < when_els.length; i++) {
                    let el = when_els[i];

                    el.addEventListener("click", (e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        removeElsClass(when_els, "active");
                        addClassEl("active", el);

                        befriend.when.selected = befriend.when.options[i];
                    });
                }

                //select first option by default
                if (when_els.length) {
                    fireClick(when_els[0]);
                }

                resolve();
            });
        },
    },
};
