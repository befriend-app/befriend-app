befriend.reviews = {
    debug: true,
    activities: [],
    current: {
        index: 0,
        activity_token: null,
        person_token: null,
    },
    toggleOverlay: async function(show = true) {
        let overlayEl = document.getElementById('reviews-overlay');

        if(show && elHasClass(overlayEl, 'active')) {
            return;
        }

        if (!show) {
            addClassEl('transition-out', overlayEl);
            removeClassEl('active', overlayEl);

            setTimeout(function() {
                removeClassEl('active', overlayEl);
            }, befriend.variables.reviews_transition_ms);
        } else {
            addClassEl('active', overlayEl);
        }
    },
    getActivities: function () {
        let activities = befriend.activities.data.all;

        if(!activities) {
            return null;
        }

        activities = Object.values(activities);

        //sort newest->oldest
        activities.sort(function (a, b) {
            return b.data.activity_start - a.data.activity_start;
        });

        let activitiesFiltered = [];

        //filter by activity finished, cancelled
        for(let activity of activities) {
            let isCancelled = befriend.activities.data.isCancelled(activity.activity_token);

            if(isCancelled) {
                continue;
            }

            if(timeNow(true) < activity.activity_end && !this.debug) {
                continue;
            }

            activitiesFiltered.push(activity);
        }

        this.activities = activitiesFiltered;

        return activitiesFiltered;
    },
    getMostRecentFinishedActivity: function () {
        let activities = this.getActivities();

        if(activities.length) {
            return activities[0];
        }

        return null;
    },
    display: function (activity_token = null) {
        if(!activity_token) {
            let mostRecentActivity = this.getMostRecentFinishedActivity();

            if(!mostRecentActivity) {
                return;
            }

            activity_token = mostRecentActivity.activity_token;
        }

        let activitiesEl = document.getElementById('reviews-overlay').querySelector('.activities');

        let activities = this.getActivities();

        if(!activities.length) {
            return;
        }

        let activities_html = ``;

        for(let activity of activities) {
            let html = this.getHtml(activity);

            activities_html += html;
        }

        activitiesEl.innerHTML = activities_html;

        befriend.reviews.toggleOverlay(true);

        befriend.reviews.events.init();
    },
    getHtml: function (activity) {
        return activity.activity_token;
    },
    events: {
        init: function () {
            this.onClose();
            this.onNavigate();
        },
        onClose: function () {
            function closeOverlay() {
                addClassEl('transition-out', overlayEl);
                removeClassEl('active', overlayEl);

                setTimeout(function() {
                    removeClassEl('transition-out', overlayEl);
                }, befriend.variables.reviews_transition_ms || 300);
            }

            let overlayEl = document.getElementById('reviews-overlay');

            if(overlayEl._close_listener) {
                return;
            }

            overlayEl._close_listener = true;

            overlayEl.addEventListener('click', (e) => {
                if (!e.target.closest('.reviews')) {
                    closeOverlay();
                }
            });

            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    closeOverlay();
                }
            });
        },
        onNavigate: function () {

        }
    }
};