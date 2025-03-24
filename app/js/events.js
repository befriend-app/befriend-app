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

                await befriend.when.events.init();
                await befriend.friends.events.init();
                await befriend.maps.events.init();
                await befriend.activities.events.init();
                await befriend.location.events.init();
                await befriend.places.events.init();
                await befriend.me.events.init();

                befriend.modals.events.init();
            } catch (e) {
                console.error(e);
            }

            resolve();
        });
    },
    bodyClickHandler: function () {
        document.querySelector('body').addEventListener('click', function (e) {
            e = e || window.event;

            if (befriend.activities.createActivity.isShown()) {
                //do nothing
            } else if (befriend.activities.displayActivity.isShown()) {
                //hide check in error
                let checkInEl = befriend.els.currentActivityView.querySelector('.check-in');

                if(checkInEl) {
                    let checkInError = checkInEl.querySelector('.error');

                    if(elHasClass(checkInError, 'show')) {
                        if(!e.target.closest('.error')) {
                            removeClassEl('show', checkInError);
                        }
                    }
                }
            } else if (befriend.places.activity.isPlacesShown()) {
                //hide places to bottom
                if (!e.target.closest('#places')) {
                    //do not hide on double click if activity type just clicked
                    if (
                        timeNow() - befriend.timing.showPlaces <
                        befriend.variables.places_transition_ms
                    ) {
                        return false;
                    }

                    befriend.places.activity.toggleDisplayPlaces(false);
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
            } else if (befriend.places.search.isAutoCompleteShown()) {
                if (!e.target.closest('#place-search')) {
                    befriend.places.search.toggleAutoComplete(false);
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

                //kids select
                let open_kids_list_el = befriend.els.me.querySelector('.open.select-list');

                if (open_kids_list_el && !e.target.closest('.select-list')) {
                    befriend.me.modes.transitionKidsAge(open_kids_list_el, false);
                }

                //secondary select
                befriend.me.hideActiveSecondaryIf(e.target);

                let menu_shown_el = befriend.els.me.querySelector('.section.show-menu');

                if (menu_shown_el && !e.target.closest('.menu')) {
                    befriend.me.toggleSectionActions(menu_shown_el, false);
                }
            } else if (befriend.isViewShown('filters')) {
                befriend.filters.hideActiveSecondaryIf(e.target);

                if (befriend.filters.networks.isDropdownShown()) {
                    if (!e.target.closest('.select-dropdown')) {
                        e.preventDefault();
                        e.stopPropagation();

                        befriend.filters.networks.toggleDropdown(false);
                    }
                }

                if (befriend.filters.getActiveAutoCompleteEl()) {
                    if (!e.target.closest('.autocomplete-container')) {
                        e.preventDefault();
                        e.stopPropagation();

                        befriend.filters.hideActiveAutoCompleteIf(e.target);
                    }
                }

                if (befriend.filters.getActiveAutoCompleteSelectEl()) {
                    if (!e.target.closest('.select-container')) {
                        e.preventDefault();
                        e.stopPropagation();

                        befriend.filters.hideActiveAutoCompleteSelectIf(e.target);
                    }
                }
            }
        });
    },
    footerNavigation: function () {
        let nav_items = befriend.els.footer.getElementsByClassName('nav-item');

        for (let i = 0; i < nav_items.length; i++) {
            let nav_item = nav_items[i];

            nav_item.addEventListener('touchstart', function (e) {
                e.preventDefault();
                e.stopPropagation();

                let nav_name = nav_item.getAttribute('data-nav');

                if (elHasClass(this, 'active') && !['activities'].includes(nav_name)) {
                    return false;
                }

                befriend.navigateToView(nav_name);
            });
        }
    },
    onDrag: function () {
        const events = {
            touch: {
                start: 'touchstart',
                move: 'touchmove',
                end: 'touchend',
            },
            mouse: {
                start: 'mousedown',
                move: 'mousemove',
                end: 'mouseup',
            },
        };

        const deviceType = isTouchDevice() ? 'touch' : 'mouse';
        const deviceEvents = events[deviceType];

        let itemReorder = befriend.me.events.itemReorder;
        let sectionReorder = befriend.me.events.sectionReorder;

        document.addEventListener(deviceEvents.move, function (e) {
            // Handle item reordering
            if (itemReorder.ip && itemReorder.el) {
                e.preventDefault();
                const coords = getEventCoords(e);
                const offsetX = coords.x - itemReorder.start.x;
                const offsetY = coords.y - itemReorder.start.y;

                // Only start repositioning other items after some movement
                if (!itemReorder.dragStarted && (Math.abs(offsetX) > 5 || Math.abs(offsetY) > 5)) {
                    itemReorder.dragStarted = true;
                    const idleItems = itemReorder.getIdleItems(itemReorder.el.parentElement);
                    itemReorder.setItemsGap(idleItems);
                    itemReorder.initItemsState(itemReorder.el, idleItems);
                }

                itemReorder.el.style.transform = `translate(${offsetX}px, ${offsetY}px)`;

                if (itemReorder.dragStarted) {
                    itemReorder.updateIdleItemsStateAndPosition(itemReorder.el);

                    // Check for scroll needed
                    const container = itemReorder.el.closest('.items-container');
                    const containerRect = container.getBoundingClientRect();
                    const itemRect = itemReorder.el.getBoundingClientRect();
                    const itemHeight = itemRect.height;
                    const itemGap = itemReorder.itemsGap;
                    const scrollAmount = itemHeight + itemGap;

                    if (!itemReorder.autoScroll.scrolling) {
                        if (itemRect.top < containerRect.top) {
                            startSmoothScroll(
                                container,
                                container.scrollTop - scrollAmount,
                                itemReorder.autoScroll,
                            );
                        } else if (itemRect.bottom > containerRect.bottom) {
                            startSmoothScroll(
                                container,
                                container.scrollTop + scrollAmount,
                                itemReorder.autoScroll,
                            );
                        }
                    }
                }
            }

            // Handle section reordering
            if (sectionReorder.ip && sectionReorder.el) {
                e.preventDefault();
                const coords = getEventCoords(e);
                const offsetX = coords.x - sectionReorder.start.x;
                const offsetY = coords.y - sectionReorder.start.y;

                // Only start repositioning other sections after some movement
                if (
                    !sectionReorder.dragStarted &&
                    (Math.abs(offsetX) > 5 || Math.abs(offsetY) > 5)
                ) {
                    sectionReorder.dragStarted = true;
                    const idleSections = sectionReorder.getIdleSections(
                        sectionReorder.el.parentElement,
                    );
                    sectionReorder.setSectionsGap(idleSections);
                    sectionReorder.initSectionsState(sectionReorder.el, idleSections);
                }

                sectionReorder.el.style.transform = `translate(${offsetX}px, ${offsetY}px)`;

                if (sectionReorder.dragStarted) {
                    sectionReorder.updateIdleSectionsStateAndPosition(sectionReorder.el, coords.y);

                    // Check for scroll needed
                    const container = sectionReorder.el.closest('.view-me');
                    const containerRect = container.getBoundingClientRect();
                    const sectionRect = sectionReorder.el.getBoundingClientRect();
                    const sectionHeight = sectionRect.height;
                    const sectionGap = sectionReorder.itemsGap;
                    const scrollAmount = sectionHeight + sectionGap;

                    if (!sectionReorder.autoScroll.scrolling) {
                        if (sectionRect.top < containerRect.top) {
                            startSmoothScroll(
                                container,
                                container.scrollTop - scrollAmount,
                                sectionReorder.autoScroll,
                            );
                        } else if (sectionRect.bottom > containerRect.bottom) {
                            startSmoothScroll(
                                container,
                                container.scrollTop + scrollAmount,
                                sectionReorder.autoScroll,
                            );
                        }
                    }
                }
            }
        });

        document.addEventListener(deviceEvents.end, function (e) {
            // Handle item reorder end
            if (itemReorder.ip) {
                if (itemReorder.autoScroll.animationFrame) {
                    cancelAnimationFrame(itemReorder.autoScroll.animationFrame);
                    itemReorder.autoScroll.animationFrame = null;
                }
                itemReorder.autoScroll.scrolling = false;
                itemReorder.ip = false;
                itemReorder.dragStarted = false;

                const reorderEl = itemReorder.el;
                if (!reorderEl) return;

                const scrollContainer = reorderEl.closest('.items-container');
                if (scrollContainer) {
                    scrollContainer.style.removeProperty('overflow');
                }

                const section_el = reorderEl.closest('.section');
                const section_key = section_el.getAttribute('data-key');

                itemReorder.applyNewItemOrder(reorderEl, section_el, section_key);
                itemReorder.el = null;
            }

            // Handle section reorder end
            if (sectionReorder.ip) {
                if (sectionReorder.autoScroll.animationFrame) {
                    cancelAnimationFrame(sectionReorder.autoScroll.animationFrame);
                    sectionReorder.autoScroll.animationFrame = null;
                }
                sectionReorder.autoScroll.scrolling = false;
                sectionReorder.ip = false;
                sectionReorder.dragStarted = false;

                const reorderEl = sectionReorder.el;
                if (!reorderEl) return;

                const scrollContainer = reorderEl.closest('.view-me');
                if (scrollContainer) {
                    scrollContainer.style.removeProperty('overflow');
                }

                sectionReorder.applyNewSectionOrder(reorderEl);
                sectionReorder.el = null;
            }
        });

        function startSmoothScroll(container, targetPosition, autoScrollState) {
            // Bound target position
            targetPosition = Math.max(
                0,
                Math.min(targetPosition, container.scrollHeight - container.clientHeight),
            );

            // Don't scroll if we're already at target
            if (container.scrollTop === targetPosition) return;

            autoScrollState.scrolling = true;
            autoScrollState.startPosition = container.scrollTop;
            autoScrollState.targetPosition = targetPosition;
            autoScrollState.startTime = performance.now();

            // Cancel any existing animation
            if (autoScrollState.animationFrame) {
                cancelAnimationFrame(autoScrollState.animationFrame);
            }

            function animate(currentTime) {
                const elapsed = currentTime - autoScrollState.startTime;
                const progress = Math.min(elapsed / autoScrollState.duration, 1);

                // Ease out cubic function
                const easeOut = 1 - Math.pow(1 - progress, 3);

                const currentPosition =
                    autoScrollState.startPosition +
                    (autoScrollState.targetPosition - autoScrollState.startPosition) * easeOut;

                container.scrollTop = currentPosition;

                if (progress < 1) {
                    autoScrollState.animationFrame = requestAnimationFrame(animate);
                } else {
                    autoScrollState.scrolling = false;
                    autoScrollState.animationFrame = null;
                }
            }

            autoScrollState.animationFrame = requestAnimationFrame(animate);
        }
    },
    resizeHandler: function () {
        window.addEventListener('resize', function () {
            befriend.styles.createActivity.updateCloseMessagePosition();
            befriend.styles.notifications.updateSectionsHeight();
            befriend.styles.displayActivity.updateSectionsHeight();
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

            //update location and map on re-opening app
            befriend.location.getLocation();

            befriend.reviews.showIfNew();
        }

        document.addEventListener('pause', onPause, false);
        document.addEventListener('resume', onResume, false);
    },
};
