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

            section_options.innerHTML = reviewsHtml;

            // Initialize events for all review types
            const reviewSections = section_el.querySelectorAll('.section-option.review');
            for (let section of reviewSections) {
                const type = Array.from(section.classList)
                    .find(cls => cls.startsWith('review-'))
                    ?.replace('review-', '');

                if (type && this.ratings[type]) {
                    this.initEvents(section, type);
                }
            }
        },

        initEvents: function(section, type) {
            const stars = section.querySelectorAll('.star-container');
            const slider = section.querySelector('.rating-slider');
            const display = section.querySelector('.rating-display');

            const updateRating = (rating) => {
                // Ensure rating is between 0 and 5
                rating = Math.max(0, Math.min(5, rating));

                // Update stars
                for (let i = 0; i < stars.length; i++) {
                    const fill = stars[i].querySelector('.fill');
                    const fillPercentage = Math.max(0, Math.min(100, (rating - i) * 100));

                    // Reset styles
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

                // Update slider and display
                slider.value = rating;
                display.querySelector('.value').innerHTML = rating.toFixed(1);

                // Save rating
                this.ratings[type].current_rating = rating;
                this.saveRating(type, rating);
            };

            // Star touch events
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

            // Slider events
            slider.addEventListener('input', (e) => {
                updateRating(parseFloat(e.target.value));
            });

            // Initialize with default rating
            updateRating(this.ratings[type].current_rating);
        },

        saveRating: function(type, rating) {
            console.log(`${type} rating saved:`, rating.toFixed(1));
            // Implement your save logic here

            // Example of how to get all ratings
            console.log('Current ratings:', this.ratings);
        }
    }
};