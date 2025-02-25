befriend.reviews = {
    debug: true,
    activities: [],
    current: {
        index: 0,
        activity_token: null,
        person_token: null,
    },
    toggleOverlay: async function(show) {
        let overlayEl = document.getElementById('reviews-overlay');

        if(show && elHasClass(overlayEl, 'active')) {
            return;
        }

        if (show) {
            addClassEl('active', overlayEl);
        } else {
            addClassEl('transition-out', overlayEl);
            removeClassEl('active', overlayEl);

            setTimeout(function() {
                removeClassEl('transition-out', overlayEl);
            }, befriend.variables.reviews_transition_ms);
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
            if(!activity.data.persons) {
                continue;
            }

            let isCancelled = befriend.activities.data.isCancelled(activity.activity_token);

            if(isCancelled) {
                continue;
            }

            //ensure activity had at least one person other than me
            let activeParticipants = [];

            for(let person_token in activity.data.persons) {
                if(person_token === befriend.getPersonToken()) {
                    continue;
                }

                let person = activity.data.persons[person_token];

                if(person.cancelled_at) {
                    continue;
                }

                activeParticipants.push(person);
            }

            if(!activeParticipants.length) {
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
    display: function (activity_token = null, skipTransition = false) {
        const activities = this.getActivities();

        if(!activities.length) {
            return;
        }

        let initialIndex = 0;

        if (activity_token) {
            const activityIndex = activities.findIndex(a => a.activity_token === activity_token);

            if (activityIndex !== -1) {
                initialIndex = activityIndex;
            }
        }

        this.current.index = initialIndex;

        let activitiesContainerEl = document.getElementById('reviews-overlay').querySelector('.activities-container');
        let arrowsEl = document.getElementById('reviews-overlay').querySelector('.arrows');

        let activities_html = ``;

        for(let activity of activities) {
            let html = this.getHtml(activity);

            activities_html += `<div class="activity-slide">${html}</div>`;
        }

        activitiesContainerEl.innerHTML = activities_html;

        const showArrows = activities.length > 1;
        const prevArrow = document.getElementById('reviews-prev-arrow');
        const nextArrow = document.getElementById('reviews-next-arrow');

        if(showArrows) {
            addClassEl('show', arrowsEl);
        } else {
            removeClassEl('show', arrowsEl);
        }

        prevArrow.classList.toggle('disabled', initialIndex === 0);
        nextArrow.classList.toggle('disabled', initialIndex === activities.length - 1);

        if (skipTransition) {
            addClassEl('no-transition', activitiesContainerEl);

            this.goToSlide(initialIndex);
            void activitiesContainerEl.offsetWidth;

            setTimeout(() => {
                removeClassEl('no-transition', activitiesContainerEl);
            }, 50);
        } else {
            this.goToSlide(initialIndex);
        }

        befriend.reviews.toggleOverlay(true);

        befriend.reviews.events.init();
    },
    goToSlide: function(index) {
        const containerEl = document.getElementById('reviews-overlay').querySelector('.activities-container');

        if (index < 0) {
            index = 0;
        }

        if (index >= this.activities.length) {
            index = this.activities.length - 1;
        }

        this.current.index = index;
        this.current.activity_token = this.activities[index].activity_token;

        containerEl.style.transform = `translateX(-${index * 100}%)`;

        const prevArrow = document.getElementById('reviews-prev-arrow');
        const nextArrow = document.getElementById('reviews-next-arrow');

        if (prevArrow) {
            prevArrow.classList.toggle('disabled', index === 0);
        }

        if (nextArrow) {
            nextArrow.classList.toggle('disabled', index === this.activities.length - 1);
        }

        const indicatorsContainer = document.getElementById('reviews-overlay').querySelector('.slide-indicators');
        const innerContainer = indicatorsContainer.querySelector('.slide-indicators-inner');

        if (innerContainer) {
            const indicators = innerContainer.querySelectorAll('.slide-indicator');

            if(!indicators.length) {
                return;
            }

            indicators.forEach((indicator, i) => {
                if (i === index) {
                    addClassEl('active', indicator);
                } else {
                    removeClassEl('active', indicator);
                }
            });

            setTimeout(() => {
                befriend.reviews.centerActiveIndicator();
            }, 10);
        }
    },
    nextSlide: function() {
        if (this.current.index < this.activities.length - 1) {
            this.goToSlide(this.current.index + 1);
        }
    },
    prevSlide: function() {
        if (this.current.index > 0) {
            this.goToSlide(this.current.index - 1);
        }
    },
    getHtml: function (activity) {
        return activity.activity_token;
    },
    centerActiveIndicator: function() {
        const indicatorsContainer = document.getElementById('reviews-overlay').querySelector('.slide-indicators');
        const innerContainer = indicatorsContainer.querySelector('.slide-indicators-inner');

        if(!innerContainer) {
            return;
        }

        const activeIndicator = innerContainer.querySelector('.slide-indicator.active');

        if (!activeIndicator) {
            return;
        }

        const indicatorWidth = befriend.variables.reviews_indicator_dim;
        const indicatorGap = befriend.variables.reviews_indicator_gap;
        const activeIndex = Array.from(innerContainer.querySelectorAll('.slide-indicator'))
            .findIndex(indicator => elHasClass(indicator, 'active'));

        const containerBox = indicatorsContainer.getBoundingClientRect();
        const containerWidth = indicatorsContainer.offsetWidth;
        const containerCenter = containerWidth / 2 - indicatorWidth / 2;

        const activeIndicatorCenter = (activeIndex * (indicatorWidth + indicatorGap)) + (indicatorWidth / 2);

        const targetScrollLeft = activeIndicatorCenter - containerCenter + containerBox.left / 2;

        requestAnimationFrame(() => {
            indicatorsContainer.scrollLeft = Math.max(0, targetScrollLeft);
        });
    },
    events: {
        init: function () {
            this.onClose();
            this.onArrows();
            this.onIndicators();
        },
        onClose: function () {
            let overlayEl = document.getElementById('reviews-overlay');

            if(overlayEl._close_listener) {
                return;
            }

            overlayEl._close_listener = true;

            overlayEl.addEventListener('click', (e) => {
                if (!e.target.closest('.reviews')) {
                    befriend.reviews.toggleOverlay(false);
                }
            });

            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    befriend.reviews.toggleOverlay(false);
                }
            });
        },
        onArrows: function () {
            const prevArrow = document.getElementById('reviews-prev-arrow');
            const nextArrow = document.getElementById('reviews-next-arrow');

            if(prevArrow._listener) {
                return;
            }

            prevArrow._listener = true;

            prevArrow.addEventListener('click', (e) => {
                e.stopPropagation();

                if(!elHasClass(prevArrow, 'disabled')) {
                    befriend.reviews.prevSlide();
                }
            });

            nextArrow.addEventListener('click', (e) => {
                e.stopPropagation();

                if(!elHasClass(nextArrow, 'disabled')) {
                    befriend.reviews.nextSlide();
                }
            });

            const container = document.querySelector('.activities-container');

            let startX, moveX;
            let initialTransform;
            const threshold = 50;

            container.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;

                const style = window.getComputedStyle(container);
                const matrix = new DOMMatrix(style.transform);
                initialTransform = matrix.m41;

                addClassEl('no-transition', container);
            });

            container.addEventListener('touchmove', (e) => {
                moveX = e.touches[0].clientX;

                const diff = moveX - startX;

                container.style.transform = `translateX(${initialTransform + diff}px)`;
            });

            container.addEventListener('touchend', (e) => {
                removeClassEl('no-transition', container);

                const diff = moveX - startX;

                if (Math.abs(diff) < threshold) {
                    befriend.reviews.goToSlide(befriend.reviews.current.index);
                } else {
                    if (diff < 0 && befriend.reviews.current.index < befriend.reviews.activities.length - 1) {
                        befriend.reviews.nextSlide();
                    } else if (diff > 0 && befriend.reviews.current.index > 0) {
                        befriend.reviews.prevSlide();
                    } else {
                        befriend.reviews.goToSlide(befriend.reviews.current.index);
                    }
                }
            });

            container.addEventListener('wheel', (e) => {
                e.preventDefault();
            }, { passive: false });
        },
        onIndicators: function () {
            const activities = befriend.reviews.activities;

            if (activities.length > 1) {
                console.log("on indicators");
                const indicatorsContainer = document.querySelector('.slide-indicators');
                indicatorsContainer.innerHTML = '';

                const innerContainer = document.createElement('div');
                addClassEl('slide-indicators-inner', innerContainer);
                indicatorsContainer.appendChild(innerContainer);

                for (let i = 0; i < activities.length; i++) {
                    const indicator = document.createElement('div');
                    addClassEl('slide-indicator', indicator);

                    if (i === befriend.reviews.current.index) {
                        addClassEl('active', indicator);
                    }

                    indicator.addEventListener('click', (e) => {
                        e.stopPropagation();
                        befriend.reviews.goToSlide(i);
                    });

                    innerContainer.appendChild(indicator);
                }

                setTimeout(() => {
                    befriend.reviews.centerActiveIndicator();
                }, 100);
            }
        }
    }
};