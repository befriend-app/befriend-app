befriend.friends = {
    activity_qty: 1,
    min: 1,
    max: 10,
    type: {
        is_new: true,
        is_existing: false,
        is_both: false,
    },
    setType: function (type) {
        befriend.friends.type.is_new = type === 'new';
        befriend.friends.type.is_existing = type === 'existing';
        befriend.friends.type.is_both = type === 'both';

        befriend.activities.draft.update('friends.type', befriend.friends.type);
    },
    setActivityFriendNum: function (num) {
        befriend.friends.activity_qty = num;
        befriend.activities.draft.update('friends.qty', num);
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
                let friend_els = befriend.els.who.getElementsByClassName('friend-option');

                for (let i = 0; i < friend_els.length; i++) {
                    let el = friend_els[i];

                    el.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        removeElsClass(friend_els, 'active');
                        addClassEl('active', el);

                        befriend.friends.setType(el.getAttribute('data-type'));
                    });
                }

                resolve();
            });
        },
        selectFriendCount: function () {
            return new Promise(async (resolve, reject) => {
                const container = befriend.els.numPersons.querySelector('.sliders-control');
                const range = befriend.els.numPersons.querySelector('.slider-range');
                const thumb = befriend.els.numPersons.querySelector('.thumb');
                let isDragging = false;
                let startX, startLeft;

                function setPosition(value) {
                    const percent = (value - befriend.friends.min) / (befriend.friends.max - befriend.friends.min);
                    const position = percent * container.offsetWidth;
                    thumb.style.left = `${position}px`;
                    range.style.width = `${position}px`;
                    thumb.querySelector('.thumb-value').textContent = Math.round(value);
                }

                function getValueFromPosition(position) {
                    const percent = position / container.offsetWidth;
                    return Math.min(
                        Math.max(
                            Math.round(percent * (befriend.friends.max - befriend.friends.min) + befriend.friends.min),
                            befriend.friends.min
                        ),
                        befriend.friends.max
                    );
                }

                function handleStart(e) {
                    isDragging = true;
                    startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
                    startLeft = parseFloat(thumb.style.left) || 0;
                    e.preventDefault();
                }

                function handleMove(e) {
                    if (!isDragging) return;

                    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
                    const dx = clientX - startX;
                    const newLeft = Math.min(Math.max(0, startLeft + dx), container.offsetWidth);
                    const value = getValueFromPosition(newLeft);

                    befriend.friends.activity_qty = value;
                    setPosition(value);
                    befriend.friends.setActivityFriendNum(value);
                }

                function handleEnd() {
                    isDragging = false;
                }

                function handleTrackClick(e) {
                    const rect = container.getBoundingClientRect();
                    const clickPosition = e.clientX - rect.left;
                    const value = getValueFromPosition(clickPosition);

                    befriend.friends.activity_qty = value;
                    setPosition(value);
                    befriend.friends.setActivityFriendNum(value);
                }

                if(isTouchDevice()) {
                    // Touch events
                    thumb.addEventListener('touchstart', handleStart);
                    document.addEventListener('touchmove', handleMove);
                    document.addEventListener('touchend', handleEnd);
                } else {
                    // Mouse events
                    thumb.addEventListener('mousedown', handleStart);
                    document.addEventListener('mousemove', handleMove);
                    document.addEventListener('mouseup', handleEnd);
                }

                // Track click
                container.addEventListener('click', handleTrackClick);

                // Initialize position
                requestAnimationFrame(() => {
                    setPosition(befriend.friends.activity_qty);
                });

                resolve();
            });
        },
    },
};