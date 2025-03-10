befriend.reviews = {
    debug: true, //todo set false
    data: {},
    activities: [],
    period: 7 * 24 * 3600, //amount of time past activity end time reviews are allowed
    current: {
        index: 0,
        activity_token: null,
        person_token: null,
    },
    lastNewActivityToken: null,
    init: function () {
        this.updateInterval();
        this.showIfNew();
    },
    html: {
        reviewsOverlay: function (activity, person_token = null) {
            if (!activity || !activity.data) {
                return '<div class="review-error">Activity data not available</div>';
            }

            let activityData = activity.data;

            let date = befriend.activities.displayActivity.html.getDate(activityData);

            let activityType = befriend.activities.activityTypes.lookup.byToken[activityData.activity_type_token];
            let activityImage = activityType?.image || '';
            let activityName = activityType?.notification || 'Activity';

            let startTime = dayjs(activityData.activity_start * 1000).format('h:mm a').toLowerCase();
            let endTime = dayjs(activityData.activity_end * 1000).format('h:mm a').toLowerCase();
            let timeString = `${startTime} - ${endTime}`;

            let participants = [];
            let personsNav = '';
            let defaultPerson = null;
            let personInt = 0;

            let personParamExists = person_token && person_token in activityData.persons && !activityData.persons[person_token].cancelled_at;

            for (let personToken in activityData.persons) {
                if (personToken === befriend.getPersonToken()) {
                    continue;
                }

                let person = activityData.persons[personToken];

                if (person.cancelled_at) {
                    continue;
                }

                personInt++;

                participants.push({
                    token: personToken,
                    data: person
                });

                if(personParamExists) {
                    if(personToken === person_token) {
                        defaultPerson = {
                            token: personToken,
                            data: person
                        };
                    }
                } else if (!defaultPerson) {
                    defaultPerson = {
                        token: personToken,
                        data: person
                    };
                }

                personsNav += `
                <div class="person-nav ${defaultPerson && personToken === defaultPerson.token ? 'active' : ''}" data-person-token="${personToken}">
                    <div class="image" style="background-image: url(${person.image_url || ''})"></div>
                    <div class="name">${person.first_name || `Person ${personInt}`}</div>
                </div>
            `;
            }

            if (participants.length === 0) {
                return '<div class="review-error">No participants to review</div>';
            }

            let ratingsHtml = '';

            for (let [key, rating] of Object.entries(befriend.filters.reviews.ratings)) {
                ratingsHtml += `
                <div class="rating-option review-${key}" data-rating-type="${key}">
                    <div class="clear-rating-btn">
                        <div class="button">
                            Clear
                        </div>
                    </div>
                            
                    <div class="rating-name">
                        <div class="name-clear">
                            <div class="name">${rating.name}</div>
                        </div>

                        <div class="rating-display">
                            <div class="value">Not Rated</div>
                        </div>
                    </div>
                   
                    <div class="stars">
                        <div class="stars-container">
                            ${Array(5)
                    .fill()
                    .map(() => `
                                <div class="star-container">
                                    <svg class="outline" viewBox="0 0 24 24">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                    </svg>
                                    <svg class="fill" viewBox="0 0 24 24">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                    </svg>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
            }

            return `
            <div class="review-card" data-activity-token="${activity.activity_token}">
                <div class="review-card-wrapper">
                    <div class="review-content-scrollable">
                        <div class="review-header">
                            <div class="activity-info">
                                <div class="activity-details">
                                    <div class="activity-meta">
                                        <div class="activity-date">${date}</div>
                                        <div class="activity-time">${timeString}</div>
                                    </div>
                                    
                                    <div class="icon-name">
                                        <div class="activity-icon">
                                            ${activityImage}
                                        </div>
                                        
                                        <div class="name-location">
                                            <div class="activity-name">${activityName}</div>
                                            <div class="activity-location">@ ${activityData.location_name}</div>
                                        </div>
                                    </div>
                                </div>
                                
                            </div>
                        </div>
                        
                        <div class="review-content">
                            <div class="persons-section">
                                <div class="persons-nav">
                                    ${personsNav}
                                </div>
                            </div>
                            
                            <div class="no-show-section">
                                <div class="button">No Show <span class="q">?</span></div>
                            </div>
                            
                            <div class="ratings-section">
                                <div class="ratings-container">
                                    ${ratingsHtml}
                                </div>
                            </div>
                            
                            <div class="saved-message">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512.0006 376.0036"><path d="M504.5025,7.4985c-9.997-9.998-26.205-9.998-36.204,0L161.5945,314.2055l-117.892-117.892c-9.997-9.998-26.205-9.997-36.204,0-9.998,9.997-9.998,26.205,0,36.203l135.994,135.992c9.994,9.997,26.214,9.99,36.204,0L504.5025,43.7025c9.998-9.997,9.997-26.206,0-36.204Z"/></svg>
                                
                                <div class="text">Saved</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        },
        personReviews: function (person, with_count) {
            const reviews = person.reviews;

            if (!reviews) {
                return '';
            }

            const ratings = [
                { name: 'Safety', current_rating: isNumeric(reviews.safety) ? parseFloat(reviews.safety) : null },
                { name: 'Trust', current_rating: isNumeric(reviews.trust) ? parseFloat(reviews.trust) : null },
                { name: 'Timeliness', current_rating: isNumeric(reviews.timeliness) ? parseFloat(reviews.timeliness) : null },
                { name: 'Friendliness', current_rating: isNumeric(reviews.friendliness) ? parseFloat(reviews.friendliness) : null },
                { name: 'Fun', current_rating: isNumeric(reviews.fun) ? parseFloat(reviews.fun) : null }
            ];

            let reviews_html = '';

            for(let rating of ratings) {
                reviews_html += `
                    <div class="review ${rating.current_rating === null ? 'no-rating' : ''}">
                        <div class="name">
                            ${rating.name}
                        </div>
                        
                        <div class="rating-display">
                            <div class="value">${rating.current_rating ? rating.current_rating.toFixed(1) : 'No rating'}</div>
                        </div>
                        
                        <div class="stars">
                            <div class="stars-container">
                                ${Array(5)
                            .fill()
                            .map((_, i) => {
                                const fillPercentage = Math.max(0, Math.min(100, (rating.current_rating - i) * 100));
                                const fillStyle = fillPercentage === 0 ? 'fill: transparent;' :
                                    fillPercentage === 100 ? `fill: ${befriend.variables.brand_color_a};` :
                                        `fill: ${befriend.variables.brand_color_a}; clip-path: polygon(0 0, ${fillPercentage}% 0, ${fillPercentage}% 100%, 0 100%);`;
                                
                                return `
                                        <div class="star-container">
                                            <svg class="outline" viewBox="0 0 24 24">
                                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                            </svg>
                                            <svg class="fill" viewBox="0 0 24 24" style="${fillStyle}">
                                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                            </svg>
                                        </div>
                                    `}).join('')}
                            </div>
                        </div>
                    </div>
                `;
            }

            let count_html = '';

            if(with_count) {
                count_html = `<div class="count">${person.reviews.count || 0} review${person.reviews.count !== 1 ? 's' : ''}</div>`;
            }

            return `${count_html}
                <div class="reviews-container">${reviews_html}</div>`
        },
    },
    updateInterval: function () {
        function isReviewable(activity) {
            if(befriend.reviews.debug) {
                return true;
            }

            let reviewThreshold = timeNow(true) - befriend.reviews.period;

            return timeNow(true) > activity.activity_end && activity.activity_end > reviewThreshold;
        }

        //update is_reviewable property on activity periodically
        setInterval(function () {
            if(!befriend.activities.data.all) {
                return;
            }

            for(let activity_token in befriend.activities.data.all) {
                let activity = befriend.activities.data.all[activity_token];

                if(!activity.data) {
                    continue;
                }

                activity.data.is_reviewable = isReviewable(activity);
            }
        }, 60 * 1000);
    },
    setReviews: function (reviews) {
        for(let activity_token in reviews) {
            let activity = reviews[activity_token];

            if(!this.data[activity_token]) {
                this.data[activity_token] = {}
            }

            for(let person_token in activity) {
                if(!this.data[activity_token][person_token]) {
                    this.data[activity_token][person_token] = {};
                }

                let data = activity[person_token];

                for(let key in data) {
                    this.data[activity_token][person_token][key] = data[key];
                }
            }
        }
    },
    getActivities: function (force_activity_token = null) {
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
            if(!force_activity_token || activity.activity_token !== force_activity_token) {
                if(!activity.data.is_reviewable || !activity.data.persons) {
                    continue;
                }

                //do not include activities that were already reviewed for every person
                let existingRatings = this.data[activity.activity_token];

                if(Object.keys(existingRatings || {}).length) {
                    const allFinished = Object.values(existingRatings).every(data => {
                        if (data.noShow) {
                            return true;
                        }

                        return Object.keys(befriend.filters.reviews.ratings).every(key =>
                            isNumeric(data[key])
                        );
                    });

                    if (allFinished) {
                        continue;
                    }
                }

                let isValid = befriend.reviews.activityValid(activity.activity_token);

                if(!isValid) {
                    continue;
                }
            }

            activitiesFiltered.push(activity);
        }

        this.activities = activitiesFiltered;

        return activitiesFiltered;
    },
    activityValid: function (activity_token) {
        let activity = befriend.activities.data.getActivity(activity_token);

        if(!activity) {
            return false;
        }

        //allow reviewing only after official end time of activity
        if(timeNow(true) < activity.activity_end && !this.debug) {
            return false;
        }

        //do not allow reviewing if person cancelled participation or entire activity was cancelled
        let isCancelled = befriend.activities.data.isCancelled(activity.activity_token);

        if(isCancelled) {
            return false;
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

        return !!activeParticipants.length;
    },
    showReviewActivities: function (activity_token = null, person_token = null, skipTransition = false) {
        let activities = this.getActivities(activity_token);

        if(!activities.length) {
            return;
        }

        let initialIndex = 0;

        if (activity_token) {
            let activityIndex = activities.findIndex(a => a.activity_token === activity_token);

            if (activityIndex !== -1) {
                initialIndex = activityIndex;
            }
        }

        this.current.index = initialIndex;

        let activitiesContainerEl = document.getElementById('reviews-overlay').querySelector('.activities-container');
        let arrowsEl = document.getElementById('reviews-overlay').querySelector('.arrows');

        let activities_html = ``;

        for(let activity of activities) {
            let html = this.html.reviewsOverlay(activity, person_token);

            activities_html += `<div class="activity-slide">${html}</div>`;
        }

        activitiesContainerEl.innerHTML = activities_html;

        let showArrows = activities.length > 1;
        let prevArrow = document.getElementById('reviews-prev-arrow');
        let nextArrow = document.getElementById('reviews-next-arrow');

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

        befriend.reviews.events.init();

        befriend.reviews.toggleOverlay(true);
    },
    toggleOverlay: async function(show) {
        let overlayEl = document.getElementById('reviews-overlay');

        if(show && elHasClass(overlayEl, 'active')) {
            return;
        }

        if (show) {
            addClassEl('active', overlayEl);
            addClassEl('no-scroll', document.body);
        } else {
            addClassEl('transition-out', overlayEl);
            removeClassEl('active', overlayEl);
            removeClassEl('no-scroll', document.body);

            setTimeout(function() {
                removeClassEl('transition-out', overlayEl);
            }, befriend.variables.reviews_transition_ms);
        }
    },
    toggleNoShow: function(activityToken, personToken, isNoShow) {
        let ratings = this.getPersonRatings(activityToken, personToken);

        ratings.noShow = isNoShow;

        let reviewCard = document.querySelector(`.review-card[data-activity-token="${activityToken}"]`);

        if (!reviewCard) {
            return;
        }

        let noShowBtn = reviewCard.querySelector('.no-show-section .button');
        let ratingsSection = reviewCard.querySelector('.ratings-section');

        if (isNoShow) {
            addClassEl('active', noShowBtn);
            addClassEl('disabled', ratingsSection);

            this.clearAllRatings(activityToken, personToken);
        } else {
            removeClassEl('active', noShowBtn);
            removeClassEl('disabled', ratingsSection);
        }

        this.saveNoShow(activityToken, personToken, isNoShow);
    },
    saveNoShow: function(activityToken, personToken, isNoShow) {
        let activity = befriend.activities.data.getActivity(activityToken);
        let reviewCard = document.querySelector(`.review-card[data-activity-token="${activityToken}"]`);

        if (!activity || !reviewCard) {
            return;
        }

        let savedEl = reviewCard.querySelector('.saved-message');

        if (!this._debounceTimers) {
            this._debounceTimers = {};
        }

        let key = `noshow_${activityToken}_${personToken}`;

        if (this._debounceTimers[key]) {
            clearTimeout(this._debounceTimers[key]);
        }

        clearTimeout(savedEl._timeout);

        this._debounceTimers[key] = setTimeout(async () => {
            try {
                let r;

                let activity = befriend.activities.data.getActivity(activityToken);

                if(activity.access?.token) {
                    r = await befriend.networks.put(activity.access.domain, `/activities/networks/reviews/${activityToken}`, {
                        access_token: activity.access.token,
                        person_token: befriend.getPersonToken(),
                        person_to_token: personToken,
                        no_show: isNoShow
                    });
                } else {
                    r = await befriend.auth.put(`/activities/${activityToken}/reviews`, {
                        person_to_token: personToken,
                        no_show: isNoShow
                    });
                }

                if(r.status === 202) {
                    if(r.data) {
                        befriend.activities.data.updateReviews(personToken, r.data);
                    }

                    addClassEl('show', savedEl);

                    savedEl._timeout = setTimeout(function () {
                        removeClassEl('show', savedEl);
                    }, 3000);
                }
            } catch (e) {
                console.error(`Error saving no show:`, e);
            }
        }, 200);
    },
    goToSlide: function(index) {
        let containerEl = document.getElementById('reviews-overlay').querySelector('.activities-container');

        if (index < 0) {
            index = 0;
        }

        if (index >= this.activities.length) {
            index = this.activities.length - 1;
        }

        this.current.index = index;
        this.current.activity_token = this.activities[index].activity_token;

        befriend.reviews.selectDefaultPerson();

        containerEl.style.transform = `translateX(-${index * 100}%)`;

        let prevArrow = document.getElementById('reviews-prev-arrow');
        let nextArrow = document.getElementById('reviews-next-arrow');

        if (prevArrow) {
            prevArrow.classList.toggle('disabled', index === 0);
        }

        if (nextArrow) {
            nextArrow.classList.toggle('disabled', index === this.activities.length - 1);
        }

        let indicatorsContainer = document.getElementById('reviews-overlay').querySelector('.slide-indicators');
        let innerContainer = indicatorsContainer.querySelector('.slide-indicators-inner');

        if (innerContainer) {
            let indicators = innerContainer.querySelectorAll('.slide-indicator');

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
    centerActiveIndicator: function() {
        let indicatorsContainer = document.getElementById('reviews-overlay').querySelector('.slide-indicators');
        let innerContainer = indicatorsContainer.querySelector('.slide-indicators-inner');

        if(!innerContainer) {
            return;
        }

        let activeIndicator = innerContainer.querySelector('.slide-indicator.active');

        if (!activeIndicator) {
            return;
        }

        let indicatorWidth = befriend.variables.reviews_indicator_dim;
        let indicatorGap = befriend.variables.reviews_indicator_gap;
        let activeIndex = Array.from(innerContainer.querySelectorAll('.slide-indicator'))
            .findIndex(indicator => elHasClass(indicator, 'active'));

        let containerBox = indicatorsContainer.getBoundingClientRect();
        let containerWidth = indicatorsContainer.offsetWidth;
        let containerCenter = containerWidth / 2 - indicatorWidth / 2;

        let activeIndicatorCenter = (activeIndex * (indicatorWidth + indicatorGap)) + (indicatorWidth / 2);

        let targetScrollLeft = activeIndicatorCenter - containerCenter + containerBox.left / 2;

        requestAnimationFrame(() => {
            indicatorsContainer.scrollLeft = Math.max(0, targetScrollLeft);
        });
    },
    saveRating: function(activityToken, personToken, type, rating) {
        let activity = befriend.activities.data.getActivity(activityToken);
        let reviewCard = document.querySelector(`.review-card[data-activity-token="${activityToken}"]`);

        if (!activity || !reviewCard) {
            return;
        }

        let savedEl = reviewCard.querySelector('.saved-message');

        if (!this._debounceTimers) {
            this._debounceTimers = {};
        }

        let key_server = `${activityToken}_${personToken}_${type}`;

        if (this._debounceTimers[key_server]) {
            clearTimeout(this._debounceTimers[key_server]);
        }

        clearTimeout(savedEl._timeout);

        this._debounceTimers[key_server] = setTimeout(async () => {
            try {
                let r;

                let activity = befriend.activities.data.getActivity(activityToken);

                if(activity.access?.token) {
                    r = await befriend.networks.put(activity.access.domain, `/activities/networks/reviews/${activityToken}`, {
                        access_token: activity.access.token,
                        person_token: befriend.getPersonToken(),
                        person_to_token: personToken,
                        review: {
                            type,
                            rating
                        }
                    });
                } else {
                    r = await befriend.auth.put(`/activities/${activityToken}/reviews`, {
                        person_to_token: personToken,
                        review: {
                            type,
                            rating
                        }
                    });
                }

                if(r.status === 202) {
                    if(r.data) {
                        befriend.activities.data.updateReviews(personToken, r.data);
                    }

                    addClassEl('show', savedEl);

                    savedEl._timeout = setTimeout(function () {
                        removeClassEl('show', savedEl);
                    }, 3000);
                }
            } catch (e) {
                console.error(`Error saving ${type} rating:`, e);
            }
        }, 200);
    },
    getPersonRatings: function (activityToken, personToken) {
        if(!befriend.reviews.data[activityToken]) {
            befriend.reviews.data[activityToken] = {};
        }

        if (!befriend.reviews.data[activityToken][personToken]) {
            befriend.reviews.data[activityToken][personToken] = {};
        }

        return befriend.reviews.data[activityToken][personToken];
    },
    displayRatings: function(activityToken, personToken) {
        let reviewCard = document.querySelector(`.review-card[data-activity-token="${activityToken}"]`);

        if (!reviewCard) {
            return;
        }

        let personRatings = this.getPersonRatings(activityToken, personToken);
        let ratingOptions = reviewCard.querySelectorAll('.rating-option');

        let noShowBtn = reviewCard.querySelector('.no-show-section .button');
        let ratingsSection = reviewCard.querySelector('.ratings-section');

        if (personRatings.noShow) {
            addClassEl('active', noShowBtn);
            addClassEl('disabled', ratingsSection);
        } else {
            removeClassEl('active', noShowBtn);
            removeClassEl('disabled', ratingsSection);
        }

        for (let option of Array.from(ratingOptions)) {
            let type = option.getAttribute('data-rating-type');
            let rating = personRatings[type];
            let stars = option.querySelectorAll('.star-container');

            if (rating) {
                removeClassEl('no-rating', option);

                for (let i = 0; i < stars.length; i++) {
                    let fill = stars[i].querySelector('.fill');

                    if (i < rating) {
                        fill.style.fill = befriend.variables.brand_color_a;
                        fill.style.removeProperty('clip-path');
                    } else {
                        fill.style.fill = 'transparent';
                        fill.style.removeProperty('clip-path');
                    }
                }
            } else {
                addClassEl('no-rating', option);

                stars.forEach(star => {
                    let fill = star.querySelector('.fill');
                    fill.style.fill = 'transparent';
                    fill.style.removeProperty('clip-path');
                });
            }
        }

        return { reviewCard, ratingOptions };
    },
    clearAllRatings: function(activityToken, personToken) {
        let reviewCard = document.querySelector(`.review-card[data-activity-token="${activityToken}"]`);

        if (!reviewCard) {
            return;
        }

        let ratingOptions = reviewCard.querySelectorAll('.rating-option');
        let personRatings = this.getPersonRatings(activityToken, personToken);

        for (let option of Array.from(ratingOptions)) {
            let type = option.getAttribute('data-rating-type');
            let stars = option.querySelectorAll('.star-container');

            stars.forEach(star => {
                let fill = star.querySelector('.fill');
                fill.style.fill = 'transparent';
                fill.style.removeProperty('clip-path');
            });

            delete personRatings[type];

            addClassEl('no-rating', option);
        }
    },
    selectDefaultPerson: function() {
        let activityToken = this.current.activity_token;

        let reviewCard = document.querySelector(`.review-card[data-activity-token="${activityToken}"]`);

        if (!reviewCard) {
            return;
        }

        let personsNavEl = reviewCard.querySelector('.person-nav.active');

        if(personsNavEl) {
            this.current.person_token = personsNavEl.getAttribute('data-person-token');
            return;
        }

        let personsNavEls = reviewCard.getElementsByClassName('person-nav');

        if(!personsNavEls.length) {
            return;
        }

        this.current.person_token = personsNavEls[0].getAttribute('data-person-token');
    },
    showIfNew: function () {
        let activities = this.getActivities();

        if(!activities.length) {
            return;
        }

        let most_recent_activity = activities[0];

        if(!this.lastNewActivityToken || this.lastNewActivityToken !== most_recent_activity.activity_token) {
            this.showReviewActivities();
            befriend.user.setLocal('reviews.lastNewActivityToken', most_recent_activity.activity_token);
        }
    },
    events: {
        init: function () {
            this.onClose();
            this.onRatings();
            this.onPersonNav();
            this.onNoShow();
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

            overlayEl.querySelector('.close').addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                befriend.reviews.toggleOverlay(false);
            });
        },
        onRatings: function() {
            let reviewCards = document.getElementById('reviews-overlay').getElementsByClassName('review-card');
            let min = 1;
            let max = 5;

            for(let card of Array.from(reviewCards)) {
                let ratingOptions = card.querySelectorAll('.rating-option');
                let activityToken = card.getAttribute('data-activity-token');
                let personToken = befriend.reviews.current.person_token;

                befriend.reviews.displayRatings(activityToken, personToken);

                for(let option of Array.from(ratingOptions)) {
                    let type = option.getAttribute('data-rating-type');
                    let stars = option.querySelectorAll('.star-container');
                    let clearBtn = option.querySelector('.clear-rating-btn .button');

                    let updateRating = async (personToken, rating) => {
                        let activity = befriend.activities.data.getActivity(activityToken);

                        if(!activity.data.is_reviewable) {
                            return;
                        }

                        let personRatings = befriend.reviews.getPersonRatings(activityToken, personToken);

                        if (personRatings.noShow) {
                            return;
                        }

                        rating = Math.round(rating);

                        removeClassEl('no-rating', option);

                        if (rating > 0) {
                            rating = Math.max(min, Math.min(max, rating));

                            let personRatings = befriend.reviews.getPersonRatings(activityToken, personToken);

                            if(rating === personRatings[type]) {
                                return;
                            }

                            personRatings[type] = rating;
                        } else {
                            clearRating(personToken);
                            return;
                        }

                        for (let i = 0; i < stars.length; i++) {
                            let fill = stars[i].querySelector('.fill');

                            if (i < rating) {
                                fill.style.fill = befriend.variables.brand_color_a;
                                fill.style.removeProperty('clip-path');
                            } else {
                                fill.style.fill = 'transparent';
                                fill.style.removeProperty('clip-path');
                            }
                        }

                        befriend.reviews.saveRating(activityToken, personToken, type, rating);
                    };

                    let clearRating = (personToken, onLoad) => {
                        let personRatings = befriend.reviews.getPersonRatings(activityToken, personToken);

                        if (personRatings.noShow) {
                            return;
                        }

                        stars.forEach(star => {
                            let fill = star.querySelector('.fill');
                            fill.style.fill = 'transparent';
                            fill.style.removeProperty('clip-path');
                        });

                        delete personRatings[type];

                        if(!onLoad) {
                            befriend.reviews.saveRating(activityToken, personToken, type, null);
                        }

                        addClassEl('no-rating', option);
                    };

                    clearBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        clearRating(befriend.reviews.current.person_token);
                    });

                    for (let i = 0; i < stars.length; i++) {
                        let star = stars[i];

                        star.addEventListener('click', (e) => {
                            let rating = i + 1;
                            updateRating(befriend.reviews.current.person_token, rating);
                        });
                    }

                    let starsContainer = option.querySelector('.stars-container');

                    starsContainer.addEventListener('touchstart', function (e) {
                        e.preventDefault();
                        e.stopPropagation();

                        let startTouch = e.touches[0];
                        let containerRect = starsContainer.getBoundingClientRect();
                        let starWidth = containerRect.width / 5;

                        let isDragging = true;

                        let getRatingFromPosition = (posX) => {
                            let boundedX = Math.max(0, Math.min(containerRect.width, posX));
                            return Math.ceil(boundedX / starWidth);
                        };

                        let startRating = getRatingFromPosition(startTouch.clientX - containerRect.left);

                        updateRating(befriend.reviews.current.person_token, startRating);

                        let onTouchMove = (event) => {
                            if (!isDragging) {
                                return;
                            }

                            event.preventDefault();
                            event.stopPropagation();

                            let touch = event.touches[0];
                            let currentX = touch.clientX - containerRect.left;

                            let newRating = getRatingFromPosition(currentX);

                            requestAnimationFrame(() => {
                                updateRating(befriend.reviews.current.person_token, newRating);
                            });
                        };

                        let onTouchEnd = () => {
                            isDragging = false;
                            document.removeEventListener('touchmove', onTouchMove);
                            document.removeEventListener('touchend', onTouchEnd);
                        };

                        document.addEventListener('touchmove', onTouchMove, { passive: false });
                        document.addEventListener('touchend', onTouchEnd);
                    }, { passive: false });
                }
            }
        },
        onPersonNav: function () {
            let personsNavEls = document.getElementById('reviews-overlay')
                .querySelectorAll('.person-nav');

            for(let nav of Array.from(personsNavEls)) {
                if(nav._listener) {
                    continue;
                }

                nav._listener = true;

                nav.addEventListener('click', async function (e) {
                    e.preventDefault();

                    let newPersonToken = nav.getAttribute('data-person-token');

                    befriend.reviews.current.person_token = newPersonToken;

                    let navs = nav.parentElement.getElementsByClassName('person-nav');

                    for(let el of Array.from(navs)) {
                        removeClassEl('active', el);
                    }

                    addClassEl('active', nav);

                    befriend.reviews.displayRatings(befriend.reviews.current.activity_token, newPersonToken);
                });
            }
        },
        onNoShow: function() {
            let reviewCards = document.getElementById('reviews-overlay').getElementsByClassName('review-card');

            for(let card of Array.from(reviewCards)) {
                let noShowBtn = card.querySelector('.no-show-section .button');
                let activityToken = card.getAttribute('data-activity-token');

                if(noShowBtn._listener) {
                    continue;
                }

                noShowBtn._listener = true;

                noShowBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();

                    let activity = befriend.activities.data.getActivity(activityToken);

                    if(!activity.data.is_reviewable) {
                        return;
                    }

                    let personToken = befriend.reviews.current.person_token;
                    let personRatings = befriend.reviews.getPersonRatings(activityToken, personToken);

                    let isCurrentlyNoShow = personRatings.noShow || false;
                    
                    befriend.reviews.toggleNoShow(activityToken, personToken, !isCurrentlyNoShow);
                });
            }
        },
        onArrows: function () {
            let overlayEl = document.getElementById('reviews-overlay');

            let prevArrow = document.getElementById('reviews-prev-arrow');
            let nextArrow = document.getElementById('reviews-next-arrow');

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

            let container = overlayEl.querySelector('.activities-container');

            let startX, startY, moveX, moveY;
            let initialTransform;
            let threshold = 50;
            let isHorizontalSwipe = null;

            container.addEventListener('touchstart', (e) => {
                let target = e.target;

                if(target.closest('.stars-container') || target.closest('.sliders-control')) {
                    startX = null; moveX = null; initialTransform = null;
                    return;
                }

                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;

                let style = window.getComputedStyle(container);
                let matrix = new DOMMatrix(style.transform);
                initialTransform = matrix.m41;

                addClassEl('no-transition', container);
                isHorizontalSwipe = null; // Reset direction detection
            });

            container.addEventListener('touchmove', (e) => {
                if (!startX || !startY) return;

                let target = e.target;

                if(target.closest('.stars-container') || target.closest('.sliders-control')) {
                    return;
                }

                moveX = e.touches[0].clientX;
                moveY = e.touches[0].clientY;

                let diffX = moveX - startX;
                let diffY = moveY - startY;

                if (isHorizontalSwipe === null) {
                    isHorizontalSwipe = Math.abs(diffX) > Math.abs(diffY);
                }

                if (isHorizontalSwipe) {
                    e.preventDefault();
                    container.style.transform = `translateX(${initialTransform + diffX}px)`;
                }
            });

            container.addEventListener('touchend', (e) => {
                removeClassEl('no-transition', container);

                if (isHorizontalSwipe && startX && moveX) {
                    let diff = moveX - startX;

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
                }

                startX = null;
                startY = null;
                moveX = null;
                moveY = null;
                isHorizontalSwipe = null;
            });

            container.addEventListener('wheel', (e) => {
                e.preventDefault();
            }, { passive: false });
        },
        onIndicators: function () {
            let activities = befriend.reviews.activities;

            if (activities.length > 1) {
                console.log("on indicators");
                let indicatorsContainer = document.querySelector('.slide-indicators');
                indicatorsContainer.innerHTML = '';

                let innerContainer = document.createElement('div');
                addClassEl('slide-indicators-inner', innerContainer);
                indicatorsContainer.appendChild(innerContainer);

                for (let i = 0; i < activities.length; i++) {
                    let indicator = document.createElement('div');
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