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

                if (checkInEl) {
                    let checkInError = checkInEl.querySelector('.error');

                    if (elHasClass(checkInError, 'show')) {
                        if (!e.target.closest('.error')) {
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
        let events = {
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

        let deviceType = isTouchDevice() ? 'touch' : 'mouse';
        let deviceEvents = events[deviceType];

        let itemReorder = befriend.me.events.itemReorder;
        let sectionReorder = befriend.me.events.sectionReorder;

        document.addEventListener(deviceEvents.move, function (e) {
            // Handle item reordering
            if (itemReorder.ip && itemReorder.el) {
                e.preventDefault();
                let coords = getEventCoords(e);
                let offsetX = coords.x - itemReorder.start.x;
                let offsetY = coords.y - itemReorder.start.y;

                // Only start repositioning other items after some movement
                if (!itemReorder.dragStarted && (Math.abs(offsetX) > 5 || Math.abs(offsetY) > 5)) {
                    itemReorder.dragStarted = true;
                    let idleItems = itemReorder.getIdleItems(itemReorder.el.parentElement);
                    itemReorder.setItemsGap(idleItems);
                    itemReorder.initItemsState(itemReorder.el, idleItems);
                }

                itemReorder.el.style.transform = `translate(${offsetX}px, ${offsetY}px)`;

                if (itemReorder.dragStarted) {
                    itemReorder.updateIdleItemsStateAndPosition(itemReorder.el);

                    // Check for scroll needed
                    let container = itemReorder.el.closest('.items-container');
                    let containerRect = container.getBoundingClientRect();
                    let itemRect = itemReorder.el.getBoundingClientRect();
                    let itemHeight = itemRect.height;
                    let itemGap = itemReorder.itemsGap;
                    let scrollAmount = itemHeight + itemGap;

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
                let coords = getEventCoords(e);
                let offsetX = coords.x - sectionReorder.start.x;
                let offsetY = coords.y - sectionReorder.start.y;

                // Only start repositioning other sections after some movement
                if (
                    !sectionReorder.dragStarted &&
                    (Math.abs(offsetX) > 5 || Math.abs(offsetY) > 5)
                ) {
                    sectionReorder.dragStarted = true;
                    let idleSections = sectionReorder.getIdleSections(
                        sectionReorder.el.parentElement,
                    );
                    sectionReorder.setSectionsGap(idleSections);
                    sectionReorder.initSectionsState(sectionReorder.el, idleSections);
                }

                sectionReorder.el.style.transform = `translate(${offsetX}px, ${offsetY}px)`;

                if (sectionReorder.dragStarted) {
                    sectionReorder.updateIdleSectionsStateAndPosition(sectionReorder.el, coords.y);

                    // Check for scroll needed
                    let container = sectionReorder.el.closest('.view-me');
                    let containerRect = container.getBoundingClientRect();
                    let sectionRect = sectionReorder.el.getBoundingClientRect();
                    let sectionHeight = sectionRect.height;
                    let sectionGap = sectionReorder.itemsGap;
                    let scrollAmount = sectionHeight + sectionGap;

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

                let reorderEl = itemReorder.el;
                if (!reorderEl) return;

                let scrollContainer = reorderEl.closest('.items-container');
                if (scrollContainer) {
                    scrollContainer.style.removeProperty('overflow');
                }

                let section_el = reorderEl.closest('.section');
                let section_key = section_el.getAttribute('data-key');

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

                let reorderEl = sectionReorder.el;
                if (!reorderEl) return;

                let scrollContainer = reorderEl.closest('.view-me');
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
                let elapsed = currentTime - autoScrollState.startTime;
                let progress = Math.min(elapsed / autoScrollState.duration, 1);

                // Ease out cubic function
                let easeOut = 1 - Math.pow(1 - progress, 3);

                let currentPosition =
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
    loginSignupEvents: function () {
        // if(!skip_init) {
        //     try {
        //         await befriend.init(true);
        //
        //         //transition from login to app
        //         transitionToApp(passwordScreen);
        //     } catch(e) {
        //         console.error(e);
        //     }
        // }

        async function afterLoginLogic() {
            //determine whether to transition to app or show screen
            try {
                await befriend.me.getMe();

                if(befriend.user.isProfileReady()) {

                } else {
                    showProfileScreen();
                }
            } catch(e) {
                console.error(e);
            }
        }

        function setUserLogin(data) {
            befriend.user.setPersonToken(data.person_token);
            befriend.user.setLoginToken(data.login_token);
        }

        function showProfileScreen() {
            let screenToTransition = lastScreen;

            addClassEl('transition-x-left', screenToTransition);

            hideScreen(screenToTransition);
            showScreen(profileScreen);

            befriend.setProfileGenderOptions();

            setTimeout(async function () {
                addClassEl('dni', screenToTransition);
                removeClassEl('transition-x-left', screenToTransition);

                await rafAwait();

                removeClassEl('dni', screenToTransition);

            }, 400);
        }

        function showScreen(screen) {
            removeClassEl('hidden', screen);
            lastScreen = screen;

            setErrorMessage(screen, false, '');
        }

        function hideScreen(screen) {
            addClassEl('hidden', screen);
        }

        function setErrorMessage(el, bool, message = '') {
            let parentEl = el.closest('.screen');

            let errorMessageEl = parentEl.querySelector('.error-message');

            if(bool) {
                addClassEl('show', errorMessageEl);
            } else {
                removeClassEl('show', errorMessageEl);
            }

            errorMessageEl.innerHTML = message;
        }

        function toggleSpinner(el, bool) {
            let parentEl = el.closest('.screen');
            let spinnerEl = parentEl.querySelector('.spinner');

            if(bool) {
                addClassEl('show', spinnerEl);
            } else {
                removeClassEl('show', spinnerEl);
            }
        }

        async function submitVerification() {
            if(verifyButtonEl._ip) {
                return false;
            }

            setErrorMessage(verifyButtonEl, false, ``);

            verifyButtonEl._ip = true;

            toggleSpinner(verifyButtonEl, true);

            let code = '';

            for(let input of Array.from(verificationInputs)) {
                code += input.value;
            }

            if(code.length < verificationInputs.length) {
                setErrorMessage(verifyButtonEl, true, `Invalid code`);
                toggleSpinner(verifyButtonEl, false);
                verifyButtonEl._ip = false;
            } else {
                try {
                    let data = {
                        code
                    }

                    //dynamically set either phone or email data on request object
                    data[loginObj.method] = loginObj[loginObj.method];

                    let r = await befriend.api.put(`/auth/code/verify`, data);

                    setUserLogin(r.data);

                    if (loginObj.action === 'signup') {
                        if (loginObj.method === 'email') {
                            // Show create password screen for email signup
                            hideScreen(verificationScreen);
                            showScreen(createPasswordScreen);
                        } else {
                            // Show post-signup screen for phone signup
                            showProfileScreen();
                        }
                    } else {
                        //logged in via phone
                        await afterLoginLogic();
                    }
                } catch(e) {
                    setErrorMessage(verifyButtonEl, true, e.response?.data || 'Error verifying code');
                }
            }

            toggleSpinner(verifyButtonEl, false);

            verifyButtonEl._ip = false;
        }

        function inputEvents() {
            let inputRemoveErrorEls = [emailInputEl, passwordInputEl, resetPasswordInputEl];

            for(let el of inputRemoveErrorEls) {
                el.addEventListener('input', async function(e) {
                    setErrorMessage(this, false, '');
                });
            }

            //verification code input
            verificationInputs.forEach((input, index) => {
                input.addEventListener('input', function(e) {
                    setErrorMessage(verifyButtonEl, false, ``);

                    // Get the current value
                    let currentValue = this.value;

                    // If the input has a value and it's a digit
                    if (currentValue && /^\d$/.test(currentValue)) {
                        // Move to the next input if available
                        if (index < verificationInputs.length - 1) {
                            verificationInputs[index + 1].focus();
                        } else {
                            //last input field
                            let code = '';

                            for(let input of Array.from(verificationInputs)) {
                                code += input.value;
                            }

                            if(code.length === verificationInputs.length) {
                                submitVerification();
                            }
                        }
                    }
                });

                // Handle backspace for deleting
                input.addEventListener('keydown', function(e) {
                    if (e.key === 'Backspace') {
                        // If the input is empty and not the first one, focus the previous input
                        if (this.value === '' && index > 0) {
                            e.preventDefault();
                            verificationInputs[index - 1].focus();
                        }
                    }
                });

                // Handle paste event on each input
                input.addEventListener('paste', function(e) {
                    e.preventDefault();
                    // Get pasted data
                    let pastedData = (e.clipboardData || window.clipboardData).getData('text');

                    // Clean the pasted data to only include digits
                    pastedData = pastedData.replace(/\D/g, '');

                    // Limit to the number of inputs we have
                    pastedData = pastedData.substring(0, verificationInputs.length);

                    // Fill each input with the corresponding digit
                    for (let i = 0; i < pastedData.length; i++) {
                        verificationInputs[i].value = pastedData.charAt(i);

                        // If we've filled all inputs, focus the last one
                        if (i === pastedData.length - 1 && i < verificationInputs.length - 1) {
                            verificationInputs[i + 1].focus();
                        }
                    }

                    // If we've filled all inputs, focus on the verify button
                    if (pastedData.length === verificationInputs.length) {
                        submitVerification();
                    }
                });
            });

            passwordResetCodeInputs.forEach((input, index) => {
                input.addEventListener('input', function(e) {
                    setErrorMessage(this, false, ``);

                    // Get the current value
                    let currentValue = this.value;

                    // If the input has a value and it's a digit
                    if (currentValue && /^\d$/.test(currentValue)) {
                        // Move to the next input if available
                        if (index < passwordResetCodeInputs.length - 1) {
                            passwordResetCodeInputs[index + 1].focus();
                        }
                    }
                });

                // Handle backspace for deleting
                input.addEventListener('keydown', function(e) {
                    if (e.key === 'Backspace') {
                        if (this.value === '' && index > 0) {
                            e.preventDefault();
                            passwordResetCodeInputs[index - 1].focus();
                        }
                    }
                });

                // Handle paste event on each input
                input.addEventListener('paste', function(e) {
                    e.preventDefault();
                    // Get pasted data
                    let pastedData = (e.clipboardData || window.clipboardData).getData('text');

                    // Clean the pasted data to only include digits
                    pastedData = pastedData.replace(/\D/g, '');

                    // Limit to the number of inputs we have
                    pastedData = pastedData.substring(0, passwordResetCodeInputs.length);

                    // Fill each input with the corresponding digit
                    for (let i = 0; i < pastedData.length; i++) {
                        passwordResetCodeInputs[i].value = pastedData.charAt(i);

                        // If we've filled all inputs, focus the last one
                        if (i === pastedData.length - 1 && i < verificationInputs.length - 1) {
                            passwordResetCodeInputs[i + 1].focus();
                        }
                    }
                });
            });

            phoneInputEl.addEventListener('input', function(e) {
                setErrorMessage(this, false, '');

                // Get only digits from the input
                let digits = this.value.replace(/\D/g, '');

                // Limit to 10 digits
                digits = digits.substring(0, 10);

                // Format the number
                if (digits.length > 0) {
                    if (digits.length <= 3) {
                        this.value = '(' + digits;
                    } else if (digits.length <= 6) {
                        this.value = '(' + digits.substring(0, 3) + ') ' + digits.substring(3);
                    } else {
                        this.value = '(' + digits.substring(0, 3) + ') ' +
                            digits.substring(3, 6) + '-' +
                            digits.substring(6);
                    }
                }
            });
        }

        function clickEvents() {
            //toggle between phone and email screens
            useEmailBtn.addEventListener('click', async function(e) {
                e.preventDefault();

                loginObj.method = 'email';

                addClassEl('no-transition', phoneScreen);
                addClassEl('no-transition', emailScreen);

                hideScreen(phoneScreen);
                showScreen(emailScreen);

                await rafAwait();

                removeClassEl('no-transition', phoneScreen);
                removeClassEl('no-transition', emailScreen);
            });

            usePhoneBtn.addEventListener('click', async function(e) {
                e.preventDefault();

                loginObj.method = 'phone';

                addClassEl('no-transition', phoneScreen);
                addClassEl('no-transition', emailScreen);

                hideScreen(emailScreen);
                showScreen(phoneScreen);

                await rafAwait();

                removeClassEl('no-transition', phoneScreen);
                removeClassEl('no-transition', emailScreen);
            });

            //navigate back
            backFromVerificationBtn.addEventListener('click', function(e) {
                e.preventDefault();
                hideScreen(verificationScreen);

                if(loginObj.method === 'phone') {
                    showScreen(phoneScreen);
                } else {
                    showScreen(emailScreen);
                }
            });

            backFromPasswordBtn.addEventListener('click', function(e) {
                e.preventDefault();
                hideScreen(passwordScreen);
                showScreen(emailScreen);
            });

            backFromResetPasswordBtn.addEventListener('click', async function(e) {
                e.preventDefault();

                addClassEl('transition-x-right', resetPasswordScreen);
                addClassEl('no-transition', passwordScreen);
                passwordScreen.style.transform = `translate(-100%)`;

                await rafAwait();

                hideScreen(resetPasswordScreen);
                showScreen(passwordScreen);

                removeClassEl('no-transition', passwordScreen);

                await rafAwait();

                passwordScreen.style.removeProperty('transform');

                setTimeout(async function () {
                    addClassEl('dni', resetPasswordScreen);
                    removeClassEl('transition-x-right', resetPasswordScreen);

                    await rafAwait();

                    removeClassEl('dni', resetPasswordScreen);
                }, befriend.variables.login_signup_screen_transition + 50);
            });

            //navigate to verification screen (from phone)
            continuePhoneBtn.addEventListener('click', async function() {
                if(this._ip) {
                    return false;
                }

                this._ip = true;

                setErrorMessage(this, false, '');

                let value = phoneInputEl.value;
                let code = countryCodeEl.value;

                if(!isValidPhone(value, code)) {
                    this._ip = false;
                    toggleSpinner(this, false);

                    return setErrorMessage(this, true, 'Please provide a valid phone number');
                }

                removeClassEl('show', spamMessageEl);
                toggleSpinner(this, true);

                loginObj.phone.countryCode = code;
                loginObj.phone.number = value;

                //check if account exists
                try {
                    let exists = await befriend.user.checkAccountExists(loginObj.phone);

                    hideScreen(phoneScreen);

                    verifyMessageEl.innerHTML = 'Enter the code sent to your phone';

                    if(exists) {
                        loginObj.action = 'login';
                        showScreen(verificationScreen);
                        verifyButtonEl.innerHTML = 'Verify';
                    } else {
                        loginObj.action = 'signup';
                        verifyButtonEl.innerHTML = 'Create account <span class="spinner"></span>';

                        showScreen(createAccountScreen);
                    }
                } catch(e) {
                    setErrorMessage(this, true, e?.response?.data || 'Login error');
                    console.error(e);
                }

                this._ip = false;

                toggleSpinner(this, false);
            });

            //navigate to password screen (from email)
            continueEmailBtn.addEventListener('click', async function() {
                if(this._ip) {
                    return false;
                }

                this._ip = true;

                toggleSpinner(this, true);

                setErrorMessage(this, false, '');

                let value = emailInputEl.value;

                loginObj.email = value;

                if(!isValidEmail(value)) {
                    this._ip = false;
                    toggleSpinner(this, false);

                    return setErrorMessage(this, true, 'Please provide a valid email');
                }

                addClassEl('show', spamMessageEl);

                //check if account exists
                try {
                    let exists = await befriend.user.checkAccountExists(null, value);

                    hideScreen(emailScreen);

                    if(exists) {
                        loginObj.action = 'login';

                        showScreen(passwordScreen);
                    } else {
                        loginObj.action = 'signup';

                        //set email specific language on verification screen
                        verifyMessageEl.innerHTML = 'Enter the code sent to your email';
                        verifyButtonEl.innerHTML = 'Create account <span class="spinner"></span>';

                        showScreen(verificationScreen);
                    }
                } catch(e) {
                    setErrorMessage(this, true, e?.response?.data || 'Error checking account');
                    console.error(e);
                }

                this._ip = false;
                toggleSpinner(this, false);
            });

            verifyButtonEl.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();

                submitVerification();
            });

            continueSetPasswordBtn.addEventListener('click', async function(e) {
                e.preventDefault();
                e.stopPropagation();

                if(this._ip) {
                    return false;
                }

                this._ip = true;

                toggleSpinner(this, true);

                setErrorMessage(this, false, '');

                try {
                    let password = createPasswordInputEl.value;

                    let r = await befriend.auth.put(`/password/init`, {
                        password
                    });

                    showProfileScreen();
                } catch(e) {
                    setErrorMessage(this, true, e?.response?.data || 'Error setting password');

                    console.error(e);
                }

                toggleSpinner(this, false);

                this._ip = false;
            });

            continueLoginPassword.addEventListener('click', async function(e) {
                e.preventDefault();
                e.stopPropagation();

                if(this._ip) {
                    return false;
                }

                this._ip = true;

                toggleSpinner(this, true);

                setErrorMessage(this, false, '');

                try {
                    let r = await befriend.api.post('/login', {
                         email: loginObj.email,
                         password: passwordInputEl.value
                    });

                    setUserLogin(r.data);

                    await afterLoginLogic();
                } catch(e) {
                    setErrorMessage(this, true, e.response?.data || 'Error signing in');
                }

                this._ip = false;

                toggleSpinner(this, false);
            });

            forgotPasswordLink.addEventListener('click', async function(e) {
                e.preventDefault();
                e.stopPropagation();

                if(this._ip) {
                    return false;
                }

                this._ip = true;

                toggleSpinner(this, true);

                setErrorMessage(this, false, '');

                try {
                    await befriend.api.put(`/password/reset`, {
                        email: loginObj.email
                    });

                    addClassEl('transition-x-left', passwordScreen);

                    hideScreen(passwordScreen);
                    showScreen(resetPasswordScreen);

                    setTimeout(async function () {
                        addClassEl('dni', passwordScreen);
                        removeClassEl('transition-x-left', passwordScreen);

                        await rafAwait();

                        removeClassEl('dni', passwordScreen);
                    }, befriend.variables.login_signup_screen_transition + 50);
                } catch(e) {
                    console.error(e);
                }

                toggleSpinner(this, false);

                this._ip = false;
            });

            continueResetPasswordBtn.addEventListener('click', async function(e) {
                e.preventDefault();
                e.stopPropagation();

                if(this._ip) {
                    return false;
                }

                this._ip = true;

                toggleSpinner(this, true);

                setErrorMessage(this, false, '');

                let code = '';

                for(let input of Array.from(passwordResetCodeInputs)) {
                    code += input.value;
                }

                let password = resetPasswordInputEl.value;

                if(code.length < verificationInputs.length || !password) {
                    setErrorMessage(this, true, `Valid code and password required`);
                    toggleSpinner(this, false);
                    verifyButtonEl._ip = false;
                } else {
                    try {
                        let data = {
                            email: loginObj.email,
                            code,
                            password
                        }

                        let r = await befriend.api.put(`/password/set/code`, data);

                        setUserLogin(r.data);

                        await afterLoginLogic();
                    } catch(e) {
                        setErrorMessage(this, true, e.response?.data || 'Error verifying code');
                    }
                }

                this._ip = false;

                toggleSpinner(this, false);
            });

            logoutEl.addEventListener('click', async function(e) {
                e.preventDefault();
                e.stopPropagation();

                if(this._ip) {
                    return false;
                }

                this._ip = true;

                try {
                    await befriend.user.logout();
                } catch(e) {

                }

                this._ip = false;
            });
        }

        function birthdayEvents() {
            let monthSelect = document.getElementById('birthday-month');
            let daySelect = document.getElementById('birthday-day');
            let yearSelect = document.getElementById('birthday-year');

            const months = [
                { value: 1, name: 'January' },
                { value: 2, name: 'February' },
                { value: 3, name: 'March' },
                { value: 4, name: 'April' },
                { value: 5, name: 'May' },
                { value: 6, name: 'June' },
                { value: 7, name: 'July' },
                { value: 8, name: 'August' },
                { value: 9, name: 'September' },
                { value: 10, name: 'October' },
                { value: 11, name: 'November' },
                { value: 12, name: 'December' }
            ];

            // Populate months
            months.forEach(month => {
                const option = document.createElement('option');
                option.value = month.value;
                option.textContent = month.name;
                monthSelect.appendChild(option);
            });

            // Populate years (~130 years)
            let currentYear = new Date().getFullYear();
            let startYear = currentYear - 17;
            
            for (let year = startYear; year >= startYear - 115; year--) {
                let option = document.createElement('option');
                option.value = year;
                option.textContent = year;
                yearSelect.appendChild(option);
            }

            // Function to populate days based on month and year
            function populateDays(month, year) {
                // Clear existing days
                daySelect.innerHTML = '<option value="" selected disabled>Day</option>';

                // Get number of days in the selected month and year
                const daysInMonth = new Date(year, month, 0).getDate();

                // Add day options
                for (let day = 1; day <= daysInMonth; day++) {
                    const option = document.createElement('option');
                    option.value = day;
                    option.textContent = day;
                    daySelect.appendChild(option);
                }
            }

            // Event listeners
            monthSelect.addEventListener('change', function() {
                if (yearSelect.value) {
                    populateDays(parseInt(monthSelect.value), parseInt(yearSelect.value));
                }
            });

            yearSelect.addEventListener('change', function() {
                if (monthSelect.value) {
                    populateDays(parseInt(monthSelect.value), parseInt(yearSelect.value));
                }
            });

            // Default populate days for current month/year
            populateDays(1, currentYear);

            continueProfileBtn.addEventListener('click', async function(e) {
                e.preventDefault();
                e.stopPropagation();

                if(this._ip) {
                    return false;
                }

                this._ip = true;

                toggleSpinner(this, true);

                setErrorMessage(this, false, '');

                let firstName = document.getElementById('create-first-name').value;
                let lastName = document.getElementById('create-last-name').value;
                let genderToken = document.getElementById('select-gender').value;
                let birthdayMonth = document.getElementById('birthday-month').value;
                let birthdayDay = document.getElementById('birthday-day').value;
                let birthdayYear = document.getElementById('birthday-year').value;

                try {
                    let r = await befriend.auth.put(`/profile`, {
                        first_name: firstName,
                        last_name: lastName,
                        gender_token: genderToken,
                        birthday: {
                            month: birthdayMonth,
                            day: birthdayDay,
                            year: birthdayYear
                        }
                    });

                    showProfileScreen();
                } catch(e) {
                    setErrorMessage(this, true, e?.response?.data || 'Error setting password');

                    console.error(e);
                }

                toggleSpinner(this, false);

                this._ip = false;
            });
        }

        async function transitionToApp(fromScreen) {
            let app = document.getElementById('app');
            let loginSignup = document.querySelector('.login-signup-wrapper');

            // Transition out the current screen
            addClassEl('transition-out', loginSignup);

            addClassEl('transitioning-to-app', app);

            await rafAwait();

            removeClassEl('show-login-signup', app);

            await rafAwait();

            addClassEl('transform-0', app);

            setTimeout(() => {
                //remove classes
                removeClassEl('transition-out', loginSignup);

                removeClassEl('transitioning-to-app', app);
                removeClassEl('transform-0', app);

                //reset login/signup screens
                addElsClass(allScreens, 'hidden');
                showScreen(allScreens[0]);
            }, befriend.variables.login_signup_screen_transition + 30);
        }

        let loginObj = {
            action: 'signup', //[login, signup]
            method: 'phone', //[phone, email]
            email: null,
            phone: {
                countryCode: null,
                number: null
            }
        };

        let allScreens = document.querySelectorAll('.screens-container .screen');
        let phoneScreen = document.getElementById('phone-screen');
        let emailScreen = document.getElementById('email-screen');
        let createAccountScreen = document.getElementById('create-account-screen');
        let verificationScreen = document.getElementById('verification-screen');
        let passwordScreen = document.getElementById('password-screen');
        let resetPasswordScreen = document.getElementById('reset-password-screen');
        let createPasswordScreen = document.getElementById('create-password-screen');
        let profileScreen = document.getElementById('profile-screen');

        let useEmailBtn = document.getElementById('use-email');
        let usePhoneBtn = document.getElementById('use-phone');
        let backFromVerificationBtn = document.getElementById('back-from-verification');
        let backFromPasswordBtn = document.getElementById('back-from-password');
        let backFromResetPasswordBtn = document.getElementById('back-from-reset-password');
        let continuePhoneBtn = document.getElementById('continue-phone');
        let continueEmailBtn = document.getElementById('continue-email');
        let continueLoginPassword = document.getElementById('login-password-btn');
        let continueSetPasswordBtn = document.getElementById('set-password-btn');
        let forgotPasswordLink = document.querySelector('.forgot-password');
        let continueResetPasswordBtn = document.getElementById('reset-forgot-password-btn')
        let continueProfileBtn = document.getElementById('profile-screen-btn');
        let logoutEl = profileScreen.querySelector('.logout');

        //verify els
        let verifyMessageEl = verificationScreen.querySelector('.heading p');
        let verifyButtonEl = verificationScreen.querySelector('.continue-button');
        let spamMessageEl = verificationScreen.querySelector('.check-spam-message');
        let verificationInputs = document.querySelectorAll('.verification-code input');
        let passwordResetCodeInputs = document.querySelectorAll('.password-verification-code input');

        //inputs
        let countryCodeEl = document.getElementById('country-code');
        let phoneInputEl = document.getElementById('phone-input');
        let emailInputEl = document.getElementById('email-input');
        let passwordInputEl = document.getElementById('password-input');
        let createPasswordInputEl = document.getElementById('create-password-input');
        let resetPasswordInputEl = document.getElementById('reset-password-input');

        // prevent duplicate event handlers
        if(phoneScreen._listener) {
            return;
        }

        phoneScreen._listener = true;

        let lastScreen = phoneScreen;

        inputEvents();

        clickEvents();

        birthdayEvents();
    }
};
