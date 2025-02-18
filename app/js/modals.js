befriend.modals = {
    ids: {
        images: 'person-image-modal'
    },
    images: {
        openModal: function(imageUrl) {
            let modal_el = document.getElementById(befriend.modals.ids.images);
            let modal_image_el = modal_el.querySelector('img');
            modal_image_el.src = imageUrl;

            addClassEl('active', modal_el);
            document.body.style.overflow = 'hidden';
        },
        closeModal: function() {
            let modal_el = document.getElementById(befriend.modals.ids.images);
            removeClassEl('active', modal_el);
            document.body.style.overflow = '';
        },
    },
    activity: {
        showCancel: async function () {
            function closePopup() {
                removeClassEl('active', overlay);

                setTimeout(function () {
                    popupEl.remove();
                }, 300);
            }

            let class_name = 'cancel-activity-popup-overlay';

            let popupHtml =
                `<div class="${class_name}">
                    <div class="cancel-activity-popup">
                        <div class="popup-header">
                            <div class="title">Test</div>
                            <div class="sub">Filter Importance</div>
                        </div>
                        
                        <div class="popup-actions">
                            <button class="cancel-btn">Cancel</button>
                            <button class="save-btn">Save</button>
                        </div>
                    </div>
                </div>`;

            let popupEl = document.createElement('div');
            popupEl.innerHTML = popupHtml;
            document.body.appendChild(popupEl);

            let overlay = popupEl.querySelector(class_name);

            void overlay.offsetWidth;

            await rafAwait();

            addClassEl('active', overlay);

            const cancelBtn = popupEl.querySelector('.cancel-btn');
            const saveBtn = popupEl.querySelector('.save-btn');

            cancelBtn.addEventListener('click', closePopup);

            saveBtn.addEventListener('click', () => {
            });

            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    closePopup();
                }
            });

            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape') {
                    closePopup();
                }
            });
        }
    },
    filters: {
        showImportance: function (sectionToken, item, name, currentValue = 7) {
            let importanceRef = befriend.filters.importance;

            const popupHtml = `
            <div class="importance-popup-overlay">
                <div class="importance-popup">
                    <div class="popup-header">
                        <div class="title">${name}</div>
                        <div class="sub">Filter Importance</div>
                    </div>
                    
                    <div class="importance-slider">
                        <div class="slider-container">
                            <div class="slider-track"></div>
                            <div class="slider-range"></div>
                            <div class="thumb">
                                <span class="thumb-value"></span>
                            </div>
                        </div>
                    </div>
                    <div class="popup-actions">
                        <button class="cancel-btn">Cancel</button>
                        <button class="save-btn">Save</button>
                    </div>
                </div>
            </div>`;

            const popupEl = document.createElement('div');
            popupEl.innerHTML = popupHtml;
            document.body.appendChild(popupEl);

            const overlay = popupEl.querySelector('.importance-popup-overlay');
            void overlay.offsetWidth;
            requestAnimationFrame(() => addClassEl('active', overlay));

            const container = popupEl.querySelector('.slider-container');
            const range = popupEl.querySelector('.slider-range');
            const thumb = popupEl.querySelector('.thumb');
            let isDragging = false;
            let startY, startTop;

            const setPosition = (value) => {
                const percent = (value - importanceRef.min) / (importanceRef.max - importanceRef.min);
                const height = container.offsetHeight;
                const position = height - percent * height;
                thumb.style.top = `${position}px`;
                range.style.height = `${height - position}px`;
                thumb.querySelector('.thumb-value').textContent = Math.round(value);
            };

            const getValueFromPosition = (position) => {
                const height = container.offsetHeight;
                const percent = 1 - position / height;

                return Math.min(
                    Math.max(percent * (importanceRef.max - importanceRef.min) + importanceRef.min, importanceRef.min),
                    importanceRef.max,
                );
            };

            function handleStart(e) {
                isDragging = true;
                startY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
                startTop = parseFloat(thumb.style.top) || 0;
                e.preventDefault();
            }

            function handleMove(e) {
                if (!isDragging) return;
                const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
                const dy = clientY - startY;
                const newTop = Math.min(Math.max(0, startTop + dy), container.offsetHeight);
                const value = getValueFromPosition(newTop);
                setPosition(value);
            }

            function handleEnd(e) {
                isDragging = false;

                let importancePopup = document.querySelector('.importance-popup-overlay');

                if (importancePopup && !e.target.closest('.importance-popup')) {
                    fireClick(importancePopup.querySelector('.cancel-btn'));
                }
            }

            if(isTouchDevice()) {
                // Touch events
                thumb.addEventListener('touchstart', handleStart);
                document.addEventListener('touchmove', handleMove);
                document.addEventListener('touchend', handleEnd);
            } else {
                // Mouse events
                thumb.addEventListener('mousedown', handleStart);
                document.addEventListener('mousemove', handleMove);
                document.addEventListener('mouseup', handleEnd);
            }

            // Click track to set value
            container.addEventListener('click', (e) => {
                if (e.target === thumb) return;
                const rect = container.getBoundingClientRect();
                const clickPosition = e.clientY - rect.top;
                const value = getValueFromPosition(clickPosition);
                setPosition(value);
            });

            // Set initial position
            setPosition(currentValue);

            const closePopup = () => {
                removeClassEl('active', overlay);
                setTimeout(() => popupEl.remove(), 300);
            };

            const cancelBtn = popupEl.querySelector('.cancel-btn');
            const saveBtn = popupEl.querySelector('.save-btn');

            cancelBtn.addEventListener('click', closePopup);

            saveBtn.addEventListener('click', () => {
                const value = parseInt(thumb.querySelector('.thumb-value').textContent);

                let importanceValues = importanceRef.values;

                if (!(sectionToken in importanceValues)) {
                    importanceValues[sectionToken] = {};
                }

                let prevValue = importanceValues[sectionToken][item.token];

                importanceValues[sectionToken][item.token] = value;
                befriend.filters.importance.updateIndicator(sectionToken, item.token, value);
                befriend.filters.importance.saveValue(sectionToken, item, value, prevValue);
                closePopup();
            });

            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    closePopup();
                }
            });

            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape') {
                    closePopup();
                }
            });
        },
    },
    events: {
        init: function () {
            this.onImageModal();
        },
        onImageModal: function () {
            let modal_el = document.getElementById(befriend.modals.ids.images);

            if(modal_el._listener) {
                return;
            }

            modal_el._listener = true;

            let modal_image_el = modal_el.querySelector('img');

            modal_el.addEventListener('click', (e) => {
                befriend.modals.images.closeModal();
            });

            modal_image_el.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        },
    }
}