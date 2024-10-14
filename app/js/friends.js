befriend.friends = {
    activity_friends_num: 1,
    type: {
        is_new: true,
        is_existing: false,
        is_both: false
    },
    setType: function (type) {
        befriend.friends.type.is_new = type === 'new';
        befriend.friends.type.is_existing = type === 'existing';
        befriend.friends.type.is_both = type === 'both';
    },
    setActivityFriendNum: function (num) {
        befriend.friends.activity_friends_num = num;
    },
    events: {
        init: function () {
            return new Promise(async (resolve, reject) => {
                try {
                    await befriend.friends.events.selectFriendType();
                    await befriend.friends.events.selectFriendCount();
                } catch (e) {
                    console.error(e);
                }

                resolve();
            });
        },
        selectFriendType: function () {
            return new Promise(async (resolve, reject) => {
                let friend_els = befriend.els.who.getElementsByClassName("friend-option");

                for (let i = 0; i < friend_els.length; i++) {
                    let el = friend_els[i];

                    el.addEventListener("click", (e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        removeElsClass(friend_els, "active");
                        addClassEl("active", el);

                        befriend.friends.setType(el.getAttribute('data-type'));
                    });
                }

                resolve();
            });
        },
        selectFriendCount: function () {
            return new Promise(async (resolve, reject) => {
                //slider
                let personsCount = 1;
                let sliderRange = document.getElementById("range-num-persons");

                function updatePosition() {
                    let widthSubtract = 0;

                    if (window.innerWidth < 450) {
                        // widthSubtract = 25;
                    }

                    let width = sliderRange.offsetWidth - widthSubtract;

                    let min = sliderRange.getAttribute("min");
                    let max = sliderRange.getAttribute("max");

                    let percent = (sliderRange.valueAsNumber - min) / max;

                    let offset = 0;

                    let newPosition = width * percent + offset;

                    rangeSpan.innerHTML = personsCount;
                    rangeSpan.style.left = `${newPosition}px`;
                }

                window.addEventListener("resize", function (e) {
                    updatePosition();
                });

                window.addEventListener("orientationchange", function (e) {
                    updatePosition();
                });

                //set position of number for range
                let rangeSpan = befriend.els.num_persons.querySelector(".slider span");

                //load prev setting
                // let prevSetting = localStorage.getItem(settings_key);
                //
                // if(prevSetting) {
                //     personsCount = parseInt(prevSetting);
                // }

                sliderRange.setAttribute("value", personsCount);

                sliderRange.addEventListener("input", function (e) {
                    let val = this.value;

                    if (!isNumeric(val)) {
                        return;
                    }

                    personsCount = parseInt(val);

                    befriend.friends.setActivityFriendNum(personsCount);

                    // localStorage.setItem(settings_key, personsCount);

                    updatePosition();
                });

                updatePosition();

                resolve();
            });
        },
    },
};
