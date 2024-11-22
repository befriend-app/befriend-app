befriend.events = {
    init: function () {
        console.log('[init] Events');

        return new Promise(async (resolve, reject) => {
            try {
                befriend.events.bodyClickHandler();
                befriend.events.footerNavigation();

                befriend.events.onDrag();

                befriend.events.onAppState();
                befriend.events.resizeHandler();

                await befriend.notifications.events.init();
                await befriend.when.events.init();
                await befriend.friends.events.init();
                await befriend.maps.events.init();
                await befriend.activities.events.init();
                await befriend.location.events.init();
                await befriend.places.events.init();

                await befriend.me.events.init();
            } catch (e) {
                console.error(e);
            }

            resolve();
        });
    },
    bodyClickHandler: function () {
        document.querySelector('body').addEventListener('click', function (e) {
            e = e || window.event;

            if (befriend.activities.isCreateActivityShown()) {
                //do nothing
            } else if (befriend.places.isPlacesShown()) {
                //hide places to bottom
                if (!e.target.closest('#places')) {
                    //do not hide on double click if activity type just clicked
                    if (
                        timeNow() - befriend.timing.showPlaces <
                        befriend.variables.places_transition_ms
                    ) {
                        return false;
                    }

                    befriend.places.toggleDisplayPlaces(false);
                }
            } else if (befriend.location.isChangeLocationShown()) {
                if (!e.target.closest('#change-location')) {
                    //do not hide on double click
                    if (
                        timeNow() - befriend.timing.showChangeLocation <
                        befriend.variables.places_transition_ms
                    ) {
                        return false;
                    }

                    befriend.location.toggleChangeLocation(false);
                }
            } else if (befriend.places.isAutoCompleteShown()) {
                if (!e.target.closest('#place-search')) {
                    befriend.places.toggleAutoComplete(false);
                }
            } else if (befriend.isViewShown('me')) {
                if (befriend.me.isConfirmActionShown()) {
                    return false;
                }

                if (befriend.me.isAutoCompleteSelectShown()) {
                    if (!e.target.closest('.select-container')) {
                        return befriend.me.toggleAutoCompleteSelect(null, false);
                    }
                }

                if (befriend.me.isAutoCompleteShown()) {
                    if (!e.target.closest('.search-container')) {
                        return befriend.me.toggleAutoComplete(null, false);
                    }
                }

                if (befriend.me.isSectionOptionsShown()) {
                    if (!e.target.closest('#me-section-options')) {
                        befriend.me.toggleSectionOptions(false);
                    }
                }

                let open_secondary_section_el = befriend.els.me.querySelector('.secondary-open');

                if (open_secondary_section_el && !e.target.closest('.secondary')) {
                    befriend.me.transitionSecondary(open_secondary_section_el.querySelector('.secondary'), false);
                }

                let menu_shown_el = befriend.els.me.querySelector('.section.show-menu');

                if (menu_shown_el && !e.target.closest('.menu')) {
                    befriend.me.toggleSectionActions(menu_shown_el, false);
                }
            }
        });
    },
    footerNavigation: function () {
        let nameClassMap = {
            home: 'view-home',
            friends: 'view-friends',
            filters: 'view-filters',
            me: 'view-me',
        };

        let nav_items = befriend.els.footer.getElementsByClassName('nav-item');
        let views = befriend.els.views.getElementsByClassName('view');

        for (let i = 0; i < nav_items.length; i++) {
            let nav_item = nav_items[i];

            nav_item.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();

                if (elHasClass(this, 'active')) {
                    return false;
                }

                let nav_name = nav_item.getAttribute('data-nav');
                let view_name = nameClassMap[nav_name];

                let viewEl = befriend.els.views.querySelector(`.${view_name}`);

                removeElsClass(nav_items, 'active');
                removeElsClass(views, 'active');

                addClassEl('active', this);
                addClassEl('active', viewEl);

                //hide any overlays on footer nav
                befriend.places.toggleAutoComplete(false);
                befriend.places.toggleDisplayPlaces(false);
                befriend.me.toggleSectionOptions(false);

                befriend.me.toggleAutoComplete(null, false);

                //view specific logic
                if (nav_name === 'me') {
                    befriend.me.updateCollapsed();
                }
            });
        }
    },
    onDrag: function () {
        const events = {
            touch: {
                start: 'touchstart',
                move: 'touchmove',
                end: 'touchend'
            },
            mouse: {
                start: 'mousedown',
                move: 'mousemove',
                end: 'mouseup'
            }
        };

        const deviceType = isTouchDevice() ? 'touch' : 'mouse';
        const deviceEvents = events[deviceType];

        let meReorder = befriend.me.events.itemReorder;

        document.addEventListener(deviceEvents.move, function(e) {
            if (!meReorder.ip || !meReorder.el) return;

            e.preventDefault();
            const coords = getEventCoords(e);
            const offsetX = coords.x - meReorder.start.x;
            const offsetY = coords.y - meReorder.start.y;

            // Only start repositioning other items after some movement
            if (!meReorder.dragStarted && (Math.abs(offsetX) > 5 || Math.abs(offsetY) > 5)) {
                meReorder.dragStarted = true;
                const idleItems = meReorder.getIdleItems(meReorder.el.parentElement);
                meReorder.setItemsGap(idleItems);
                meReorder.initItemsState(meReorder.el, idleItems);
            }

            meReorder.el.style.transform = `translate(${offsetX}px, ${offsetY}px)`;

            if (meReorder.dragStarted) {
                meReorder.updateIdleItemsStateAndPosition(meReorder.el);

                // Check for scroll needed
                const container = meReorder.el.closest('.items-container');
                const containerRect = container.getBoundingClientRect();
                const itemRect = meReorder.el.getBoundingClientRect();
                const itemHeight = itemRect.height;
                const itemGap = meReorder.itemsGap;
                const scrollAmount = itemHeight + itemGap;

                if (!meReorder.autoScroll.scrolling) {
                    if (itemRect.top < containerRect.top) {
                        startSmoothScroll(container, container.scrollTop - scrollAmount);
                    }
                    else if (itemRect.bottom > containerRect.bottom) {
                        startSmoothScroll(container, container.scrollTop + scrollAmount);
                    }
                }
            }
        });

        document.addEventListener(deviceEvents.end, function(e) {
            if (!meReorder.ip) return;

            if (meReorder.autoScroll.animationFrame) {
                cancelAnimationFrame(meReorder.autoScroll.animationFrame);
                meReorder.autoScroll.animationFrame = null;
            }
            meReorder.autoScroll.scrolling = false;

            meReorder.ip = false;
            meReorder.dragStarted = false;
            const reorderEl = meReorder.el;
            if (!reorderEl) return;

            const scrollContainer = reorderEl.closest('.items-container');
            if (scrollContainer) {
                scrollContainer.style.removeProperty('overflow');
            }

            const section_el = reorderEl.closest('.section');
            const section_key = section_el.getAttribute('data-key');

            meReorder.applyNewItemOrder(reorderEl, section_el, section_key);
            meReorder.el = null;
        });

        function startSmoothScroll(container, targetPosition) {
            // Bound target position
            targetPosition = Math.max(0, Math.min(
                targetPosition,
                container.scrollHeight - container.clientHeight
            ));

            // Don't scroll if we're already at target
            if (container.scrollTop === targetPosition) return;

            meReorder.autoScroll.scrolling = true;
            meReorder.autoScroll.startPosition = container.scrollTop;
            meReorder.autoScroll.targetPosition = targetPosition;
            meReorder.autoScroll.startTime = performance.now();

            // Cancel any existing animation
            if (meReorder.autoScroll.animationFrame) {
                cancelAnimationFrame(meReorder.autoScroll.animationFrame);
            }

            function animate(currentTime) {
                const elapsed = currentTime - meReorder.autoScroll.startTime;
                const progress = Math.min(elapsed / meReorder.autoScroll.duration, 1);

                // Ease out cubic function
                const easeOut = 1 - Math.pow(1 - progress, 3);

                const currentPosition = meReorder.autoScroll.startPosition +
                    (meReorder.autoScroll.targetPosition - meReorder.autoScroll.startPosition) * easeOut;

                container.scrollTop = currentPosition;

                if (progress < 1) {
                    meReorder.autoScroll.animationFrame = requestAnimationFrame(animate);
                } else {
                    meReorder.autoScroll.scrolling = false;
                    meReorder.autoScroll.animationFrame = null;
                }
            }

            meReorder.autoScroll.animationFrame = requestAnimationFrame(animate);
        }
    },
    resizeHandler: function () {
        window.addEventListener('resize', function () {
            befriend.styles.createActivity.updateCloseMessagePosition();
        });
    },
    onAppState: function () {
        function onPause() {
            console.log('on pause');

            befriend.is_paused = true;
        }

        function onResume() {
            console.log('on resume');

            befriend.is_paused = false;
        }

        document.addEventListener('pause', onPause, false);
        document.addEventListener('resume', onResume, false);
    },
};
