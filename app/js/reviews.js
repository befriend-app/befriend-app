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
        if (!activity || !activity.data) {
            return '<div class="review-error">Activity data not available</div>';
        }

        const activityData = activity.data;
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

            if (!defaultPerson) {
                defaultPerson = {
                    token: personToken,
                    data: person
                };

                this.current.person_token = personToken;
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
                    <div class="rating-name">
                        <div class="name-clear">
                            <div class="name">${rating.name}</div>

                            <div class="clear-rating-btn">
                                <div class="button">
                                    Clear
                                </div>
                            </div>
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
                        
                        <div class="range-container">
                            <div class="sliders-control">
                                <div class="slider-track"></div>
                                <div class="slider-range"></div>
                                <div class="thumb">
                                    <span class="thumb-inner"></span>
                                </div>
                            </div>
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
                            
                            <div class="ratings-section">
                                <div class="ratings-container">
                                    ${ratingsHtml}
                                </div>
                            </div>
                            
                            <div class="review-comments">
                                <div class="section-heading">Additional Comments (Optional)</div>
                                <textarea class="review-comment-field" placeholder="Share your thoughts about this experience..."></textarea>
                            </div>
                            
                            <div class="review-actions">
                                <button class="review-submit-btn">Submit Review</button>
                                <button class="review-skip-btn">Skip</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
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
    saveRating: function(activityToken, personToken, type, rating) {
        if (!this._debounceTimers) {
            this._debounceTimers = {};
        }

        const key = `${activityToken}_${personToken}_${type}`;

        if (this._debounceTimers[key]) {
            clearTimeout(this._debounceTimers[key]);
        }

        this._debounceTimers[key] = setTimeout(async () => {
            try {
                console.log(`Saving rating: ${type} = ${rating} for person ${personToken} in activity ${activityToken}`);
            } catch (e) {
                console.error(`Error saving ${type} rating:`, e);
            }
        }, 500);
    },
    submitReview: function(activityToken, personToken, comments) {
        console.log(`Submitting review for person ${personToken} in activity ${activityToken}`);
        console.log(`Comments: ${comments}`);

        // Move to next slide or close if last
        if (this.current.index < this.activities.length - 1) {
            this.nextSlide();
        } else {
            this.toggleOverlay(false);
        }
    },
    skipReview: function(activityToken, personToken) {
        console.log(`Skipping review for person ${personToken} in activity ${activityToken}`);

        // Move to next slide or close if last
        if (this.current.index < this.activities.length - 1) {
            this.nextSlide();
        } else {
            this.toggleOverlay(false);
        }
    },
    events: {
        init: function () {
            this.onRatings();
            this.onClose();
            this.onArrows();
            this.onIndicators();
        },
        onRatings: function() {
            const reviewCards = document.getElementById('reviews-overlay').getElementsByClassName('review-card');
            const precision = 10;
            const min = 0;
            const max = 5;

            for(let card of Array.from(reviewCards)) {
                if(card._listener) {
                    return;
                }

                card._listener = true;

                const ratingOptions = card.querySelectorAll('.rating-option');
                const activityToken = card.getAttribute('data-activity-token');
                const personToken = befriend.reviews.current.person_token;

                for(let option of Array.from(ratingOptions)) {
                    const type = option.getAttribute('data-rating-type');
                    const stars = option.querySelectorAll('.star-container');
                    const display = option.querySelector('.rating-display');
                    const clearBtn = option.querySelector('.clear-rating-btn .button');

                    const container = option.querySelector('.sliders-control');
                    const range = option.querySelector('.slider-range');
                    const thumb = option.querySelector('.thumb');
                    let isDragging = false;
                    let startX, startLeft;
                    let hasRating = false;

                    function setPosition(value) {
                        if (typeof value !== 'number' || isNaN(value)) {
                            value = 0;
                        }
                        const percent = value / max;
                        const width = container.getBoundingClientRect().width;
                        const position = percent * width;
                        thumb.style.left = `${position}px`;
                        range.style.width = `${position}px`;
                    }

                    function getValueFromPosition(position) {
                        const width = container.getBoundingClientRect().width;
                        const percent = position / width;
                        const value = percent * max;
                        return Math.min(Math.max(value, min), max);
                    }

                    const updateRating = async (rating) => {
                        hasRating = true;

                        removeClassEl('no-rating', option);

                        rating = Math.max(0, Math.min(5, rating));

                        for (let i = 0; i < stars.length; i++) {
                            const fill = stars[i].querySelector('.fill');
                            const fillPercentage = Math.max(0, Math.min(100, (rating - i) * 100));

                            if (fillPercentage <= 0) {
                                fill.style.fill = 'transparent';
                                // fill.style.removeProperty('clip-path');
                            } else if (fillPercentage >= 100) {
                                fill.style.fill = befriend.variables.brand_color_a;
                                fill.style.removeProperty('clip-path');
                            } else {
                                fill.style.clipPath = `polygon(0 0, ${fillPercentage}% 0, ${fillPercentage}% 100%, 0 100%)`;

                                fill.style.fill = befriend.variables.brand_color_a;
                            }
                        }

                        setPosition(rating);

                        display.querySelector('.value').innerHTML = rating.toFixed(1);

                        befriend.reviews.saveRating(activityToken, personToken, type, rating);
                    };

                    const clearRating = () => {
                        hasRating = false;
                        display.querySelector('.value').innerHTML = 'Not Rated';

                        stars.forEach(star => {
                            const fill = star.querySelector('.fill');
                            fill.style.fill = 'transparent';
                            fill.style.removeProperty('clip-path');
                        });

                        thumb.style.left = '0px';
                        range.style.width = '0px';

                        befriend.reviews.saveRating(activityToken, personToken, type, null);

                        addClassEl('no-rating', option);
                    };

                    clearBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        clearRating();
                    });

                    function handleStart(e) {
                        isDragging = true;
                        startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
                        const thumbRect = thumb.getBoundingClientRect();
                        const containerRect = container.getBoundingClientRect();
                        startLeft = thumbRect.left - containerRect.left;
                        e.preventDefault();
                    }

                    function handleMove(e) {
                        if (!isDragging) {
                            return;
                        }

                        const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
                        const containerRect = container.getBoundingClientRect();
                        const position = clientX - containerRect.left;
                        const value = getValueFromPosition(position);
                        const roundedValue = Math.round(value * precision) / precision; // Round to nearest 0.1
                        updateRating(roundedValue);
                    }

                    function handleEnd() {
                        isDragging = false;
                    }

                    function handleTrackClick(e) {
                        if (isDragging) {
                            return;
                        }

                        const rect = container.getBoundingClientRect();
                        const clickPosition = e.clientX - rect.left;
                        const value = getValueFromPosition(clickPosition);
                        const roundedValue = Math.round(value * precision) / precision;
                        updateRating(roundedValue);
                    }

                    for (let i = 0; i < stars.length; i++) {
                        const star = stars[i];

                        star.addEventListener('click', (e) => {
                            const rect = star.getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            const width = rect.width;
                            const percentage = Math.max(0, Math.min(1, x / width));
                            const rating = i + percentage;
                            updateRating(rating);
                        });
                    }

                    const starsContainer = option.querySelector('.stars-container');

                    starsContainer.addEventListener('touchstart', function (e) {
                        e.preventDefault();
                        e.stopPropagation();

                        const startTouch = e.touches[0];
                        const containerRect = starsContainer.getBoundingClientRect();

                        let isDragging = true;

                        const getRatingFromPosition = (posX) => {
                            const boundedX = Math.max(0, Math.min(containerRect.width, posX));
                            return Math.max(0, Math.min(5, (boundedX / containerRect.width) * 5));
                        };

                        const startRating = getRatingFromPosition(startTouch.clientX - containerRect.left);
                        updateRating(startRating);

                        const onTouchMove = (event) => {
                            if (!isDragging) {
                                return;
                            }

                            event.preventDefault();
                            event.stopPropagation();

                            const touch = event.touches[0];
                            const currentX = touch.clientX - containerRect.left;

                            const newRating = getRatingFromPosition(currentX);

                            requestAnimationFrame(() => {
                                updateRating(newRating);
                            });
                        };

                        const onTouchEnd = () => {
                            isDragging = false;
                            document.removeEventListener('touchmove', onTouchMove);
                            document.removeEventListener('touchend', onTouchEnd);
                        };

                        document.addEventListener('touchmove', onTouchMove, { passive: false });
                        document.addEventListener('touchend', onTouchEnd);
                    }, { passive: false });

                    thumb.addEventListener('mousedown', handleStart);
                    document.addEventListener('mousemove', handleMove);
                    document.addEventListener('mouseup', handleEnd);

                    thumb.addEventListener('touchstart', handleStart);
                    document.addEventListener('touchmove', handleMove);
                    document.addEventListener('touchend', handleEnd);

                    container.addEventListener('click', handleTrackClick);

                    stars.forEach(star => {
                        const fill = star.querySelector('.fill');
                        fill.style.fill = 'transparent';
                    });

                    requestAnimationFrame(() => {
                        clearRating();
                    });
                }

                const personNavs = card.querySelectorAll('.persons-nav .person-nav');

                for(let nav of Array.from(personNavs)) {
                    nav.addEventListener('click', (e) => {
                        e.preventDefault();
                        const personToken = nav.getAttribute('data-person-token');

                        personNavs.forEach(n => removeClassEl('active', n));
                        addClassEl('active', nav);

                        befriend.reviews.current.person_token = personToken;

                        ratingOptions.forEach(option => {
                            const clearBtn = option.querySelector('.clear-rating-btn button');
                            const display = option.querySelector('.rating-display');
                            const stars = option.querySelectorAll('.star-container');
                            const range = option.querySelector('.slider-range');
                            const thumb = option.querySelector('.thumb');

                            display.querySelector('.value').innerHTML = 'Not Rated';
                            stars.forEach(star => {
                                const fill = star.querySelector('.fill');
                                fill.style.fill = 'transparent';
                                fill.style.removeProperty('clip-path');
                            });
                            thumb.style.left = '0px';
                            range.style.width = '0px';

                            clearBtn.style.opacity = '0';
                            clearBtn.style.visibility = 'hidden';
                        });
                    });
                }

                const submitBtn = card.querySelector('.review-submit-btn');
                const skipBtn = card.querySelector('.review-skip-btn');

                submitBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const comments = card.querySelector('.review-comment-field').value;
                    befriend.reviews.submitReview(activityToken, personToken, comments);
                });

                skipBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    befriend.reviews.skipReview(activityToken, personToken);
                });
            }
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
        onArrows: function () {
            let overlayEl = document.getElementById('reviews-overlay');

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

            const container = overlayEl.querySelector('.activities-container');

            let startX, startY, moveX, moveY;
            let initialTransform;
            const threshold = 50;
            let isHorizontalSwipe = null;

            container.addEventListener('touchstart', (e) => {
                let target = e.target;

                if(target.closest('.stars-container') || target.closest('.sliders-control')) {
                    startX = null; moveX = null; initialTransform = null;
                    return;
                }

                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;

                const style = window.getComputedStyle(container);
                const matrix = new DOMMatrix(style.transform);
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

                const diffX = moveX - startX;
                const diffY = moveY - startY;

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
        },
    }
};