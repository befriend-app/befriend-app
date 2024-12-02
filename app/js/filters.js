befriend.filters = {
    init: function () {
        return new Promise(async (resolve, reject) => {
            try {
                befriend.filters.reviews.init();
            } catch(e) {
                console.error(e)
            }
            resolve();
        });
    },
    reviews: {
        ratings: {
            safety: {
                name: 'Safety',
                current_rating: 4.5
            },
            timeliness: {
                name: 'Timeliness',
                current_rating: 4.5
            },
            friendliness: {
                name: 'Friendliness',
                current_rating: 4.5
            },
            fun: {
                name: 'Fun',
                current_rating: 4.5
            }
        },

        init: function() {
            const section_el = befriend.els.filters.querySelector('.section.reviews');
            const section_options = section_el.querySelector('.section-options');

            let reviewsHtml = '';

            //star ratings
            for (let [key, rating] of Object.entries(this.ratings)) {
                reviewsHtml += `
                    <div class="section-option review review-${key}">
                        <div class="section-option-name">
                            ${checkboxHtml(true)}
                            
                            <div class="name">
                                ${rating.name}
                            </div>
                            
                            <div class="rating-display">
                                <div class="value">${rating.current_rating}</div>
                            </div>
                        </div>
                        <div class="stars">
                            <div class="stars-container">
                                ${Array(5).fill().map(() => `
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
                            <input type="range" class="rating-slider" min="0" max="5" step="0.1" value="${rating.current_rating}">
                        </div>
                    </div>
                `;
            }

            reviewsHtml += `
            <div class="section-option include-new">
                <div class="section-option-name">
                    ${checkboxHtml(true)}
                    <div class="name">Include unrated matches</div>
                </div>
            </div>`;

            section_options.innerHTML = reviewsHtml;

            this.initEvents(section_el);
        },

        initCheckboxEvents: function(section) {
            const checkbox = section.querySelector('.checkbox');
            if (!checkbox) return;

            checkbox.addEventListener('click', function(e) {
                e.preventDefault();
                this.classList.toggle('checked');
            });

            checkbox.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.classList.toggle('checked');
                }
            });
        },

        initEvents: function(section_el) {
            const reviewSections = section_el.querySelectorAll('.section-option.review');

            for (let section of reviewSections) {
                const type = Array.from(section.classList)
                    .find(cls => cls.startsWith('review-'))
                    ?.replace('review-', '');

                if (!type || !this.ratings[type]) continue;

                this.initCheckboxEvents(section);

                const stars = section.querySelectorAll('.star-container');
                const slider = section.querySelector('.rating-slider');
                const display = section.querySelector('.rating-display');

                const updateRating = (rating) => {
                    rating = Math.max(0, Math.min(5, rating));

                    for (let i = 0; i < stars.length; i++) {
                        const fill = stars[i].querySelector('.fill');
                        const fillPercentage = Math.max(0, Math.min(100, (rating - i) * 100));

                        fill.style.removeProperty('fill');
                        fill.style.removeProperty('color');

                        if (fillPercentage === 0) {
                            fill.style.fill = 'transparent';
                        } else if (fillPercentage === 100) {
                            fill.style.fill = befriend.variables.brand_color_a;
                            fill.style.removeProperty('clip-path');
                        } else {
                            fill.style.fill = befriend.variables.brand_color_a;
                            fill.style.clipPath = `polygon(0 0, ${fillPercentage}% 0, ${fillPercentage}% 100%, 0 100%)`;
                        }
                    }

                    slider.value = rating;
                    display.querySelector('.value').innerHTML = rating.toFixed(1);

                    this.ratings[type].current_rating = rating;
                    this.saveRating(type, rating);
                };

                for (let i = 0; i < stars.length; i++) {
                    const star = stars[i];

                    star.addEventListener('touchstart', (e) => {
                        e.preventDefault();

                        const updateStarRating = (event) => {
                            const touch = event.touches[0];
                            const rect = star.getBoundingClientRect();
                            const x = touch.clientX - rect.left;
                            const width = rect.width;
                            const percentage = Math.max(0, Math.min(1, x / width));
                            const rating = i + percentage;
                            updateRating(rating);
                        };

                        updateStarRating(e);

                        const onTouchMove = (event) => {
                            event.preventDefault();
                            updateStarRating(event);
                        };

                        const onTouchEnd = () => {
                            document.removeEventListener('touchmove', onTouchMove);
                            document.removeEventListener('touchend', onTouchEnd);
                        };

                        document.addEventListener('touchmove', onTouchMove);
                        document.addEventListener('touchend', onTouchEnd);
                    });
                }

                slider.addEventListener('touchstart', (e) => {
                    e.stopPropagation();
                }, { passive: true });

                slider.addEventListener('input', (e) => {
                    updateRating(parseFloat(e.target.value));
                });

                updateRating(this.ratings[type].current_rating);
            }

            const includeNewSection = section_el.querySelector('.include-new');

            if (includeNewSection) {
                this.initCheckboxEvents(includeNewSection);
            }
        },
        saveRating: function(type, rating) {
            // console.log(`${type} rating saved:`, rating.toFixed(1));
            // console.log('Current ratings:', this.ratings);
        }
    }
};