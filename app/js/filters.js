befriend.filters = {
    data: {
        filters: null,
        collapsed: {},
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
                befriend.filters.age.init();

                befriend.filters.initSendReceive();
                befriend.filters.initCheckboxEvents();

                befriend.filters.setActive();
                befriend.filters.setSendReceive();
            } catch (e) {
                console.error(e);
            }
            resolve();
        });
    },
    sections: {
        reviews: {
            class: 'reviews',
            name: 'Reviews',
        },
        ages: {
            class: 'ages',
            name: 'Age',
        },
        activityTypes: {
            class: 'activity-types',
            name: 'Activity Types',
        },
        verifications: {
            class: 'verifications',
            name: 'Verifications',
        },
        networks: {
            class: 'networks',
            name: 'Networks',
        },
        distance: {
            class: 'distance',
            name: 'Distance',
        },
        modes: {
            class: 'modes',
            name: 'Modes',
        },
        interests: {
            class: 'interests',
            name: 'Interests',
        },
    },
    reviews: {
        ratings: {
            safety: {
                token: 'reviews_safety',
                name: 'Safety',
                current_rating: 4.5,
            },
            trust: {
                token: 'reviews_trust',
                name: 'Trust',
                current_rating: 4.5,
            },
            timeliness: {
                token: 'reviews_timeliness',
                name: 'Timeliness',
                current_rating: 4.5,
            },
            friendliness: {
                token: 'reviews_friendliness',
                name: 'Friendliness',
                current_rating: 4.5,
            },
            fun: {
                token: 'reviews_fun',
                name: 'Fun',
                current_rating: 4.5,
            },
        },
        init: function () {
            const section_el = befriend.els.filters.querySelector('.section.reviews');
            const filter_options = section_el.querySelector('.filter-options');

            let reviewsHtml = '';

            //star ratings
            for (let [key, rating] of Object.entries(this.ratings)) {
                const filter_data = befriend.filters.data.filters?.[rating.token];
                if (filter_data?.filter_value) {
                    rating.current_rating = parseFloat(filter_data.filter_value);
                }

                reviewsHtml += `
                    <div class="filter-option review review-${key}" data-filter-token="${rating.token}">
                        ${befriend.filters.sendReceiveHtml(true, true)}

                        <div class="filter-option-name">
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
                                ${Array(5)
                                    .fill()
                                    .map(
                                        () => `
                                    <div class="star-container">
                                        <svg class="outline" viewBox="0 0 24 24">
                                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                        </svg>
                                        <svg class="fill" viewBox="0 0 24 24">
                                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                        </svg>
                                    </div>
                                `,
                                    )
                                    .join('')}
                            </div>
                            <input type="range" class="rating-slider" min="0" max="5" step="0.1" value="${rating.current_rating}">
                        </div>
                    </div>
                `;
            }

            reviewsHtml += `
            <div class="filter-option include-new" data-filter-token="reviews_unrated">
                ${befriend.filters.sendReceiveHtml(true, true)}

                <div class="filter-option-name">
                    ${checkboxHtml(true)}
                    <div class="name">Include unrated matches</div>
                </div>
            </div>`;

            filter_options.innerHTML = reviewsHtml;

            this.initEvents(section_el);
        },
        initEvents: function (section_el) {
            const reviewFilters = section_el.querySelectorAll('.filter-option.review');

            for (let section of reviewFilters) {
                const type = Array.from(section.classList)
                    .find((cls) => cls.startsWith('review-'))
                    ?.replace('review-', '');

                if (!type || !this.ratings[type]) continue;

                const stars = section.querySelectorAll('.star-container');
                const slider = section.querySelector('.rating-slider');
                const display = section.querySelector('.rating-display');

                const updateRating = (rating, skip_save) => {
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

                    if (!skip_save) {
                        this.saveRating(type, rating);
                    }
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

                slider.addEventListener(
                    'touchstart',
                    (e) => {
                        e.stopPropagation();
                    },
                    { passive: true },
                );

                slider.addEventListener('input', (e) => {
                    updateRating(parseFloat(e.target.value));
                });

                updateRating(this.ratings[type].current_rating, true);
            }
        },
        saveRating: function (type, rating) {
            if (!this._debounceTimers) {
                this._debounceTimers = {};
            }

            if (this._debounceTimers[type]) {
                clearTimeout(this._debounceTimers[type]);
            }

            this._debounceTimers[type] = setTimeout(async () => {
                try {
                    const filter_token = this.ratings[type].token;

                    await befriend.auth.put('/filters/reviews', {
                        filter_token,
                        rating: parseFloat(rating),
                    });
                } catch (e) {
                    console.error(`Error saving ${type} rating:`, e);
                }
            }, 500);
        },
    },
    age: {
        min: 18,
        max: 130,
        current: {
            min: 18,
            max: 100
        },
        minGap: 2,
        _updateTimer: null,

        init: function() {
            let self = this;

            const section_el = befriend.els.filters.querySelector('.section.ages');
            const filter_options = section_el.querySelector('.filter-options');

            // Get stored filter values if they exist
            const filter_data = befriend.filters.data.filters?.['ages'];
            if (filter_data?.filter_value_min && filter_data?.filter_value_max) {
                this.current.min = parseInt(filter_data.filter_value_min);
                this.current.max = parseInt(filter_data.filter_value_max);

                // Ensure loaded values respect the minimum gap
                if (this.current.max - this.current.min < this.minGap) {
                    this.current.max = this.current.min + this.minGap;

                    if(this.current.max > this.max) {
                        this.current.max = this.max;
                        this.current.min = this.max - this.minGap;
                    }
                }
            }

            const ageHtml = `
                 <div class="filter-option age-range" data-filter-token="ages">
                    ${befriend.filters.sendReceiveHtml(true, true, true)}
                    
                    <div class="filter-option-name">
                        ${checkboxHtml(true)}
                        <div class="name">Active</div>
                    </div>
                    
                    <div class="range-container">
                        <div class="sliders-control">
                            <div class="slider-track"></div>
                            <div class="slider-range"></div>
                            <div class="thumb min-thumb">
                                <span class="thumb-value"></span>
                            </div>
                            <div class="thumb max-thumb">
                                <span class="thumb-value"></span>
                            </div>
                        </div>
                    </div>
                </div>`;

            filter_options.innerHTML = ageHtml;

            // Get elements after they're added to DOM
            const container = section_el.querySelector('.sliders-control');
            const range = section_el.querySelector('.slider-range');
            const minThumb = section_el.querySelector('.min-thumb');
            const maxThumb = section_el.querySelector('.max-thumb');

            let isDragging = null;
            let startX, startLeft;

            function setPosition(thumb, value) {
                const percent = (value - self.min) / (self.max - self.min);
                const position = percent * container.offsetWidth;
                thumb.style.left = `${position}px`;
                thumb.querySelector('.thumb-value').textContent = Math.round(value);
            }

            function updateRange() {
                const minLeft = parseFloat(minThumb.style.left);
                const maxLeft = parseFloat(maxThumb.style.left);
                range.style.left = `${Math.min(minLeft, maxLeft)}px`;
                range.style.width = `${Math.abs(maxLeft - minLeft)}px`;
            }

            function getValueFromPosition(position) {
                const percent = position / container.offsetWidth;
                return Math.min(Math.max(percent * (self.max - self.min) + self.min, self.min), self.max);
            }

            function handleStart(e) {
                isDragging = this;
                startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
                startLeft = parseFloat(this.style.left);
                e.preventDefault();
            }

            function handleMove(e) {
                if (!isDragging) return;

                const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
                const dx = clientX - startX;
                const newLeft = Math.min(Math.max(0, startLeft + dx), container.offsetWidth);
                const value = getValueFromPosition(newLeft);

                if (isDragging === minThumb) {
                    // Ensure minimum thumb doesn't get closer than minGap to maximum thumb
                    const maxValue = self.current.max;
                    if (value <= maxValue - self.minGap) {
                        self.current.min = Math.round(value);
                        setPosition(minThumb, self.current.min);
                    }
                } else if (isDragging === maxThumb) {
                    // Ensure maximum thumb doesn't get closer than minGap to minimum thumb
                    const minValue = self.current.min;
                    if (value >= minValue + self.minGap) {
                        self.current.max = Math.round(value);
                        setPosition(maxThumb, self.current.max);
                    }
                }

                updateRange();
                self.debounceUpdateServer();
            }

            function handleEnd() {
                isDragging = null;
            }

            // Mouse events
            [minThumb, maxThumb].forEach(thumb => {
                thumb.addEventListener('mousedown', handleStart);
            });
            document.addEventListener('mousemove', handleMove);
            document.addEventListener('mouseup', handleEnd);

            // Touch events
            [minThumb, maxThumb].forEach(thumb => {
                thumb.addEventListener('touchstart', handleStart);
            });
            document.addEventListener('touchmove', handleMove);
            document.addEventListener('touchend', handleEnd);

            // Initialize positions
            requestAnimationFrame(function () {
                setPosition(minThumb, befriend.filters.age.current.min);
                setPosition(maxThumb, befriend.filters.age.current.max);
                updateRange();
            });
        },

        debounceUpdateServer: function() {
            clearTimeout(this._updateTimer);
            this._updateTimer = setTimeout(() => {
                this.saveAgeRange();
            }, 500);
        },

        saveAgeRange: async function() {
            try {
                await befriend.auth.put('/filters/age', {
                    min_age: this.current.min,
                    max_age: this.current.max
                });
            } catch(e) {
                console.error('Error saving age range:', e);
            }
        }
    },
    initSections: async function () {
        let sections_el = befriend.els.filters.querySelector('.sections');

        let html = '';

        for (let key in this.sections) {
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
    initCollapsible: function () {
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
    initSendReceive: function () {
        const sendReceiveElements = befriend.els.filters.querySelectorAll('.send-receive');

        for (let element of sendReceiveElements) {
            if (element._listener) continue;
            element._listener = true;

            const options = element.querySelectorAll('.option');

            for (let option of options) {
                option.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    // Toggle enabled class
                    this.classList.toggle('enabled');

                    // Get the filter type and option type
                    const filterOption = this.closest('.filter-option');
                    const filterToken = befriend.filters.getFilterToken(filterOption);
                    const optionType = this.classList.contains('send') ? 'send' : 'receive';

                    // Save the state
                    befriend.filters.saveSendReceiveState(
                        filterToken,
                        optionType,
                        this.classList.contains('enabled'),
                    );
                });
            }
        }
    },
    initCheckboxEvents: function () {
        const checkboxes = befriend.els.filters.querySelectorAll('.filter-option .checkbox');

        for (let checkbox of checkboxes) {
            if (checkbox._listener) continue;
            checkbox._listener = true;

            checkbox.addEventListener('click', async function (e) {
                e.preventDefault();

                let filter_option_el = this.closest('.filter-option');
                let filter_token = befriend.filters.getFilterToken(filter_option_el);
                let active = !elHasClass(this, 'checked');

                this.classList.toggle('checked');

                try {
                    await befriend.auth.put('/filters/active', {
                        filter_token,
                        active,
                    });
                } catch (e) {
                    console.error('Error updating filter active state:', e);
                }
            });
        }
    },
    updateSectionHeights: function (without_transition) {
        let sections_el = befriend.els.filters.querySelector('.sections');

        let sections = sections_el.getElementsByClassName('section');

        for (let section of sections) {
            let container = section.querySelector('.section-container');

            let is_collapsed = elHasClass(section, 'collapsed');

            if (without_transition) {
                container.style.transition = 'none';

                setTimeout(function () {
                    container.style.removeProperty('transition');
                }, befriend.variables.filters_section_transition_ms);
            }

            if (is_collapsed) {
                container.style.height = '0';
            } else {
                setElHeightDynamic(container);
            }
        }
    },
    getSectionKey: function (section_el) {
        return section_el.getAttribute('data-key');
    },
    getFilterToken: function (filterOption) {
        return filterOption.getAttribute('data-filter-token');
    },
    sendReceiveHtml: function (send_enabled, receive_enabled, full_borders) {
        return `<div class="send-receive ${full_borders ? 'full-borders' : ''}">
                    <div class="option send ${send_enabled ? 'enabled' : ''}">Send</div>
                    <div class="option receive ${receive_enabled ? 'enabled' : ''}">Receive</div>
                </div>`;
    },
    saveSendReceiveState: async function (filterToken, optionType, isEnabled) {
        if (!this.data.sendReceive) {
            this.data.sendReceive = {};
        }
        if (!this.data.sendReceive[filterToken]) {
            this.data.sendReceive[filterToken] = {};
        }

        // Save state
        this.data.sendReceive[filterToken][optionType] = isEnabled;

        try {
            await befriend.auth.put('/filters/send-receive', {
                filter_token: filterToken,
                type: optionType,
                enabled: isEnabled,
            });
        } catch (e) {
            console.error('Error updating filter send/receive state:', e);
        }
    },
    setActive: function () {
        let checkboxes = befriend.els.filters.getElementsByClassName('checkbox');

        for (let checkbox of checkboxes) {
            let filter_option_el = checkbox.closest('.filter-option');

            if (!filter_option_el) {
                console.error('Missing filter option');
                continue;
            }

            let filter_token = befriend.filters.getFilterToken(filter_option_el);

            if (befriend.filters.data.filters[filter_token]) {
                if (!befriend.filters.data.filters[filter_token].is_active) {
                    removeClassEl('checked', checkbox);
                }
            }
        }
    },
    setSendReceive: function () {
        let filter_options = befriend.els.filters.getElementsByClassName('filter-option');

        for (let filter_option of filter_options) {
            let filter_token = befriend.filters.getFilterToken(filter_option);
            let filter_data = befriend.filters.data.filters?.[filter_token];

            if (!filter_data) {
                continue;
            }

            // Set send/receive states
            let send_receive = filter_option.querySelector('.send-receive');
            if (send_receive) {
                let send_option = send_receive.querySelector('.option.send');
                let receive_option = send_receive.querySelector('.option.receive');

                // Set send state
                if (send_option) {
                    if (!filter_data.is_send) {
                        removeClassEl('enabled', send_option);
                    }
                }

                // Set receive state
                if (receive_option) {
                    if (!filter_data.is_receive) {
                        removeClassEl('enabled', receive_option);
                    }
                }
            }
        }
    },
};
