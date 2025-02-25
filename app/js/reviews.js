befriend.reviews = {
    debug: true,
    activities: [],
    current: {
        activity_token: null,
        person_token: null,
    },
    toggleOverlay: async function(show = true, person_token, activity_token) {
        let existingOverlay = document.getElementById('reviews-overlay');

        if (!show) {
            if (existingOverlay) {
                const overlay = existingOverlay.querySelector('.reviews-popup-overlay');

                addClassEl('transition-out', overlay);
                removeClassEl('active', overlay);

                setTimeout(function() {
                    existingOverlay.remove();
                }, befriend.variables.reviews_transition_ms);
            }
            return;
        }

        if (!person_token || !activity_token) {
            console.error('person_token and activity_token are required to show the review overlay');
            return;
        }

        const prevPersonToken = befriend.reviews.current.person_token;
        const prevActivityToken = befriend.reviews.current.activity_token;

        if (prevPersonToken === person_token && prevActivityToken === activity_token) {
            return;
        }

        befriend.reviews.current.person_token = person_token;
        befriend.reviews.current.activity_token = activity_token;

        if (existingOverlay) {
            const activeOverlay = existingOverlay.querySelector('.reviews-popup-overlay.active');

            if (activeOverlay) {


                const ratingOptions = existingOverlay.querySelectorAll('.rating-option');
                ratingOptions.forEach(opt => removeClassEl('active', opt));

                const textarea = existingOverlay.querySelector('textarea');
                if (textarea) textarea.value = '';

                const errorMessage = existingOverlay.querySelector('.error-message');
                if (errorMessage) errorMessage.remove();

                return;
            }

            const overlay = existingOverlay.querySelector('.reviews-popup-overlay');

            addClassEl('transition-out', overlay);
            removeClassEl('active', overlay);

            existingOverlay.remove();
            befriend.reviews.toggleOverlay(show, person_token, activity_token);

            return;
        }

        function closeOverlay() {
            const overlay = document.querySelector('.reviews-popup-overlay');
            addClassEl('transition-out', overlay);
            removeClassEl('active', overlay);

            setTimeout(function() {
                const container = document.getElementById('reviews-overlay');

                if (container) {
                    container.remove();
                }
            }, befriend.variables.reviews_transition_ms || 300);
        }

        const overlayHtml = `
            <div class="reviews-popup-overlay ${existingOverlay ? 'no-transition' : ''}">
                    <div class="reviews">
                        <div class="heading">Leave a Review</div>
                        <div class="sub-heading">How was your experience with this person?</div>
                        <div class="rating-options">
                            <div class="rating-option" data-rating="5">
                                <div class="icon">😀</div>
                                <div class="label">Great</div>
                            </div>
                            <div class="rating-option" data-rating="4">
                                <div class="icon">🙂</div>
                                <div class="label">Good</div>
                            </div>
                            <div class="rating-option" data-rating="3">
                                <div class="icon">😐</div>
                                <div class="label">Okay</div>
                            </div>
                            <div class="rating-option" data-rating="2">
                                <div class="icon">🙁</div>
                                <div class="label">Poor</div>
                            </div>
                            <div class="rating-option" data-rating="1">
                                <div class="icon">😞</div>
                                <div class="label">Bad</div>
                            </div>
                        </div>
                        <div class="comment-section">
                            <textarea placeholder="Add a comment (optional)"></textarea>
                        </div>
                        <div class="actions">
                            <div class="button discard">
                                <div class="text">Cancel</div>
                            </div>
                            <div class="button submit">
                                <div id="reviews-spinner"></div>
                                <div class="text">Submit Review</div>
                            </div>
                        </div>
                    </div>
                </div>
        `;

        const overlayEl = document.createElement('div');
        overlayEl.setAttribute('id', 'reviews-overlay');
        overlayEl.innerHTML = overlayHtml;
        document.body.appendChild(overlayEl);

        const overlay = document.querySelector('.reviews-popup-overlay');
        const reviewsEl = document.querySelector('.reviews');
        const ratingOptions = document.querySelectorAll('.rating-option');
        const discardBtn = document.querySelector('.button.discard');
        const submitBtn = document.querySelector('.button.submit');
        const spinner = document.getElementById('reviews-spinner');

        let selectedRating = null;

        ratingOptions.forEach(option => {
            option.addEventListener('click', () => {
                ratingOptions.forEach(opt => removeClassEl('active', opt));

                addClassEl('active', option);

                selectedRating = parseInt(option.getAttribute('data-rating'));

                if (selectedRating) {
                    removeClassEl('disabled', submitBtn);
                }
            });
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeOverlay();
            }
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeOverlay();
            }
        });

        discardBtn.addEventListener('click', () => {
            closeOverlay();
        });

        submitBtn.addEventListener('click', async () => {
            if (!selectedRating || submitBtn._ip) return;

            submitBtn._ip = true;
            addClassEl('show', spinner);

            const comment = document.querySelector('textarea').value.trim();

            try {
                const reviewData = {
                    person_token: person_token,
                    activity_token: activity_token,
                    rating: selectedRating,
                    comment: comment || null
                };

                const response = await befriend.auth.post('/reviews', reviewData);

                reviewsEl.innerHTML = `
                    <div class="heading">Thank You!</div>
                    <div class="sub-heading">Your review has been submitted successfully.</div>
                    <div class="actions">
                        <div class="button done">
                            <div class="text">Done</div>
                        </div>
                    </div>
                `;

                document.querySelector('.button.done').addEventListener('click', closeOverlay);

                setTimeout(closeOverlay, 3000);

            } catch (error) {
                console.error('Error submitting review', error);

                const errorMessage = error.response?.data?.error || 'Failed to submit review. Please try again.';

                const errorEl = document.createElement('div');
                errorEl.className = 'error-message';
                errorEl.textContent = errorMessage;

                const actionsEl = document.querySelector('.actions');
                actionsEl.parentNode.insertBefore(errorEl, actionsEl);
            } finally {
                submitBtn._ip = false;
                removeClassEl('show', spinner);
            }
        });

        void overlay.offsetWidth;

        await rafAwait();

        addClassEl('active', overlay);

        removeClassEl('no-transition', overlay);
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

        let activity = befriend.activities.data.getActivity(activity_token);

        let html = this.getHtml(activity);

        befriend.reviews.toggleOverlay(true);

        befriend.reviews.events.init();

    },
    getHtml: function (activity) {

    },
    events: {
        init: function () {
              this.onNavigate();
        },
        onNavigate: function () {

        }
    }
};