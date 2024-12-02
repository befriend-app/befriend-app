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
        init: function() {
            const starSection = document.querySelector('.section.reviews .stars');
            if (!starSection) return;

            // Create stars and slider HTML
            const html = `
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
            
            <input type="range" class="rating-slider" min="0" max="5" step="0.1" value="4.5">
            <div class="rating-display">Minimum safety rating: 4.5 stars</div>
        `;

            starSection.innerHTML = html;
            this.initEvents();
        },

        initEvents: function() {
            const stars = document.querySelectorAll('.star-container');
            const slider = document.querySelector('.rating-slider');
            const display = document.querySelector('.rating-display');

            const updateRating = (rating) => {
                // Ensure rating is between 0 and 5
                rating = Math.max(0, Math.min(5, rating));

                // Update stars
                for(let index = 0; index < stars.length; index++) {
                    let star = stars[index];

                    const fill = star.querySelector('.fill');
                    const fillPercentage = Math.max(0, Math.min(100, (rating - index) * 100));

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

                // Update slider
                slider.value = rating;

                // Update display text
                display.textContent = `Minimum safety rating: ${rating.toFixed(1)} stars`;

                // Save rating
                this.saveRating(rating);
            };

            // Star click events
            for(let index = 0; index < stars.length; index++) {
                let star = stars[index];

                star.addEventListener('touchstart', (e) => {
                    e.preventDefault(); // Prevent default touch behavior

                    const updateStarRating = (event) => {
                        const touch = event.touches[0];
                        const rect = star.getBoundingClientRect();
                        const x = touch.clientX - rect.left;
                        const width = rect.width;
                        const percentage = Math.max(0, Math.min(1, x / width));
                        const rating = index + percentage;
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
            updateRating(4.5);
        },

        saveRating: function(rating) {
            console.log('Rating saved:', rating.toFixed(1));
            // Implement your save logic here
        }
    }
}