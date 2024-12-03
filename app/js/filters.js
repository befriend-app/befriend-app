befriend.filters = {
    data: {
        collapsed: {}
    },
    init: function () {
        return new Promise(async (resolve, reject) => {
            try {
                if (befriend.user.local.data?.filters?.collapsed) {
                    this.data.collapsed = befriend.user.local.data.filters.collapsed;
                }

                befriend.filters.initSections();
                befriend.filters.initCollapsible();
                
                befriend.filters.reviews.init();
            } catch(e) {
                console.error(e)
            }
            resolve();
        });
    },
    sections: {
        reviews: {
            class: 'reviews',
            name: 'Reviews',
        },
        verifications: {
            class: 'verifications',
            name: 'Verifications'
        },
        networks: {
            class: 'networks',
            name: 'Networks'
        },
        distance: {
            class: 'distance',
            name: 'Distance'
        },
        modes: {
            class: 'modes',
            name: 'Modes'
        },
        activityTypes: {
            class: 'activity-types',
            name: 'Activity Types'
        },
        interests: {
            class: 'interests',
            name: 'Interests'
        },
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
            const filter_options = section_el.querySelector('.filter-options');

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

            filter_options.innerHTML = reviewsHtml;

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
    },
    initSections: async function () {
        let sections_el = befriend.els.filters.querySelector('.sections');

        let html = '';

        for(let key in this.sections) {
            let section = this.sections[key];

            let collapsed_class = this.data.collapsed[key] ? 'collapsed' : '';

            html += `<div class="section ${section.class} ${collapsed_class}" data-key="${key}">
                        <div class="section-top">
                            <div class="section-name">${section.name}</div>
                            <div class="chevron">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360.0005 192.001"><path id="Down_Arrow" d="M176.001,192.001c-4.092,0-8.188-1.564-11.312-4.688L4.689,27.313C-1.563,21.061-1.563,10.937,4.689,4.689s16.376-6.252,22.624,0l148.688,148.688L324.689,4.689c6.252-6.252,16.376-6.252,22.624,0s6.252,16.376,0,22.624l-160,160c-3.124,3.124-7.22,4.688-11.312,4.688h0Z"/></svg>
                            </div>
                        </div>
                        <div class="section-container">
                            <div class="filter-options"></div>
                        </div>
                    </div>`;
        }

        sections_el.innerHTML = html;

        requestAnimationFrame(this.updateSectionHeights);
    },
    updateSectionHeights: function (without_transition) {
        let sections_el = befriend.els.filters.querySelector('.sections');

        let sections = sections_el.getElementsByClassName('section');

        for (let section of sections) {
            let container = section.querySelector('.section-container');

            let is_collapsed = elHasClass(section, 'collapsed');

            if(without_transition) {
                container.style.transition = 'none';

                setTimeout(function () {
                    container.style.removeProperty('transition');
                }, befriend.variables.filters_section_transition_ms)
            }

            if (is_collapsed) {
                container.style.height = '0';
            } else {
                setElHeightDynamic(container);
            }
        }
    },
    initCollapsible: function() {
        let sections = befriend.els.filters.getElementsByClassName('section');

        for (let i = 0; i < sections.length; i++) {
            let section = sections[i];
            let section_top = section.querySelector('.section-top');
            let section_container = section.querySelector('.section-container');

            if (!section_top || section_top._listener) {
                continue;
            }

            section_top._listener = true;

            // Set initial height if not already set
            if (!section_container.style.height) {
                let is_collapsed = elHasClass(section, 'collapsed');
                if (is_collapsed) {
                    section_container.style.height = '0';
                } else {
                    setElHeightDynamic(section_container);
                }
            }

            section_top.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                let is_collapsed = elHasClass(section, 'collapsed');
                let section_key = this.getSectionKey(section);

                console.log(section_key)

                if (is_collapsed) {
                    removeClassEl('collapsed', section);
                    setElHeightDynamic(section_container);
                    delete this.data.collapsed[section_key];
                } else {
                    addClassEl('collapsed', section);
                    section_container.style.height = '0';
                    this.data.collapsed[section_key] = true;
                }

                // Save collapsed state to local storage
                befriend.user.setLocal('filters.collapsed', this.data.collapsed);
            });
        }
    },
    getSectionKey: function(section_el) {
        return section_el.getAttribute('data-key');
    }
};