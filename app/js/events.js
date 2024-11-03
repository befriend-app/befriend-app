befriend.events = {
    init: function () {
        console.log('[init] Events');

        return new Promise(async (resolve, reject) => {
            try {
                befriend.events.bodyClickHandler();
                befriend.events.footerNavigation();

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
            } else if(befriend.isViewShown('me')) {
                if(befriend.me.isConfirmActionShown()) {
                    return false;
                }

                if(befriend.me.isSectionOptionsShown()) {
                    if(!e.target.closest('#me-section-options')) {
                        befriend.me.toggleSectionOptions(false);
                    }
                }

                let open_secondary_el = befriend.els.me.querySelector('.secondary.open');

                if(open_secondary_el && !e.target.closest('.secondary')) {
                    befriend.me.transitionSecondary(open_secondary_el, false);
                }

                let menu_shown_el = befriend.els.me.querySelector('.section.show-menu');

                if(menu_shown_el && !e.target.closest('.menu')) {
                    befriend.me.toggleSectionActions(menu_shown_el, false);
                }
            }
        });
    },
    footerNavigation: function () {
        let nameClassMap = {
            'home': 'view-home',
            'friends': 'view-friends',
            'filters': 'view-filters',
            'me' : 'view-me'
        };

        let nav_items = befriend.els.footer.getElementsByClassName('nav-item');
        let views = befriend.els.views.getElementsByClassName('view');

        for(let i = 0; i < nav_items.length; i++) {
            let nav_item = nav_items[i];

            nav_item.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();

                if(elHasClass(this, 'active')) {
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

                //view specific logic
                if(nav_name === 'me') {
                    befriend.me.updateCollapsed();
                }
            });
        }

    },
    resizeHandler: function () {
        window.addEventListener('resize', function () {
            befriend.styles.createActivity.updateCloseMessagePosition();
        });
    },
    onAppState: function () {
        function onPause() {
            console.log("on pause");

            befriend.is_paused = true;
        }

        function onResume() {
            console.log("on resume");

            befriend.is_paused = false;
        }

        document.addEventListener('pause', onPause, false);
        document.addEventListener('resume', onResume, false);
    }
};
