befriend.loginSignup = {
    currentScreen: null,
    setCountryCodes: function () {
        return new Promise(async (resolve, reject) => {
            //set country codes
            let codes = ['+1'];

            let countryCodeEl = document.getElementById('country-code');
            let html = '';

            try {

                let r = await befriend.api.get(`/sms/country-codes`);

                codes = r.data;
            } catch(e) {
                console.error(e);
            }

            for(let code of codes) {
                html += `<option value="${code}">${code}</div>`;
            }

            countryCodeEl.innerHTML = html;

            resolve();
        });
    },
    show: async function () {
        let appEl = document.getElementById('app');

        try {
            await befriend.loginSignup.setCountryCodes();
        } catch(e) {

        }

        befriend.loginSignup.events();

        addClassEl('show-login-signup', appEl);
    },
    resetScreens: function () {
        let allScreens = document.querySelectorAll('.screens-container .screen');
        let phoneScreen = document.getElementById('phone-screen');

        addElsClass(allScreens, 'hidden');
        removeClassEl('hidden', phoneScreen);

        befriend.loginSignup.currentScreen = phoneScreen;
    },
    showProfileScreen: async function () {
        try {
            let allScreens = document.querySelectorAll('.screens-container .screen');
            let profileScreen = document.getElementById('profile-screen');

            addElsClass(allScreens, 'hidden');
            removeClassEl('hidden', profileScreen);

            await befriend.loginSignup.setProfileGenderOptions();

            await befriend.loginSignup.show();

            befriend.loginSignup.setPreviousProfileData();
        } catch(e) {
            console.error(e);
        }
    },
    setProfileGenderOptions: function () {
        return new Promise(async (resolve, reject) => {
            try {
                if(!befriend.me.data.genders) {
                    let r = await befriend.api.get('/genders');

                    befriend.me.data.genders = r.data;
                }

                let genderSelectEl = document.getElementById('select-gender');

                let genderOptionEls = genderSelectEl.querySelectorAll('option');

                if(genderOptionEls.length < 2) {
                    let genders = structuredClone(befriend.me.data.genders).filter(item => item.is_visible);

                    for(let gender of genders) {
                        let option = document.createElement('option');
                        option.value = gender.token;
                        option.textContent = gender.name;
                        genderSelectEl.appendChild(option);
                    }
                }
            } catch(e) {
                console.error(e);
            }

            resolve();
        });
    },
    setPreviousProfileData: function () {
        let els = {
            imageUrl: document.getElementById('profile-picture'),
            firstName: document.getElementById('create-first-name'),
            lastName: document.getElementById('create-last-name'),
            gender: document.getElementById('select-gender'),
            birthday: {
                month: document.getElementById('birthday-month'),
                day: document.getElementById('birthday-day'),
                year: document.getElementById('birthday-year')
            }
        }

        let data = befriend.me.data?.me;

        if(data.image_url && !(els.imageUrl.querySelector('img'))) {
            //backend currently only accepts base64 jpg
            // befriend.loginSignup.setProfilePictureData(data.image_url, true);
        }

        if(data?.first_name && ! els.firstName.value) {
            els.firstName.value = data.first_name;
        }

        if(data?.last_name && ! els.lastName.value) {
            els.lastName.value = data.last_name;
        }

        if(data.gender_id) {
            if(befriend.me.data.genders) {
                let selected = null;

                for(let gender of befriend.me.data.genders) {
                    if(gender.id === data.gender_id) {
                        selected = gender;
                        break;
                    }
                }

                if(selected && !els.gender.value) {
                    try {
                        let optionSelected = els.gender.querySelector(`option[value="${selected.token}"]`);

                        if(optionSelected) {
                            optionSelected.selected = true;
                        }
                    } catch(e) {

                    }
                }
            }
        }

        if(data.birth_date) {
            try {
                let birthdaySplit = data.birth_date.split('-');

                if(birthdaySplit[0] && !els.birthday.year.value) {
                    els.birthday.year.value = parseInt(birthdaySplit[0]);
                }

                if(birthdaySplit[1] && !els.birthday.month.value) {
                    els.birthday.month.value = parseInt(birthdaySplit[1]);
                }

                if(birthdaySplit[2] && !els.birthday.day.value) {
                    els.birthday.day.value = birthdaySplit[2].substring(0, 2);
                }

            } catch(e) {

            }
        }
    },
    setProfilePictureData: function (imageData, isUrl = false) {
        window.profilePictureData = imageData;

        let profilePictureContainerEl = document.querySelector('.profile-picture-container');
        let uploadTextEl = profilePictureContainerEl.querySelector('.upload-text');

        document.getElementById('profile-picture').innerHTML =
            `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
            </svg>`;

        let img = document.createElement('img');

        if(imageData) {
            img.src = isUrl ? imageData : "data:image/jpeg;base64," + imageData;
            document.getElementById('profile-picture').appendChild(img);
            addClassEl('picture-selected', profilePictureContainerEl);
            uploadTextEl.textContent = 'Change Photo';
        } else {
            uploadTextEl.textContent = 'Upload Profile Picture';
            removeClassEl('picture-selected', profilePictureContainerEl);
        }
    },
    events: function () {
        async function afterLoginLogic(fromProfile = false) {
            //determine whether to transition to app or show screen
            try {
                await befriend.me.getMe();

                if(befriend.user.isProfileReady()) {
                    await befriend.init(true, fromProfile);
                    transitionToApp(profileScreen);
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

        async function showProfileScreen() {
            let screenToTransition = befriend.loginSignup.currentScreen;

            addClassEl('transition-x-left', screenToTransition);

            hideScreen(screenToTransition);
            showScreen(profileScreen);

            await befriend.loginSignup.setProfileGenderOptions();

            befriend.loginSignup.setPreviousProfileData();

            setTimeout(async function () {
                addClassEl('dni', screenToTransition);
                removeClassEl('transition-x-left', screenToTransition);

                await rafAwait();

                removeClassEl('dni', screenToTransition);

            }, 400);
        }

        function showScreen(screen) {
            removeClassEl('hidden', screen);
            befriend.loginSignup.currentScreen = screen;

            //this prevents previously selected input fields from keeping focus and breaking the view
            document.activeElement?.blur();

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
                            // verificationInputs[i + 1].focus();
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
                            // passwordResetCodeInputs[i + 1].focus();
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

            //prevent shifting between screens on tab
            let screensContainer = document.querySelector('.screens-container');

            let screensContainerEls = screensContainer.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');

            for(let el of Array.from(screensContainerEls)) {
                el.addEventListener('keydown', function(e) {
                    if(e.key === 'Tab') {
                        e.preventDefault();

                        let container = this.closest('.screen');

                        let focusableElements = container.querySelectorAll(
                            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                        );

                        let index = null;

                        for(let i = 0; i < focusableElements.length; i++) {
                            let el = focusableElements[i];

                            if(el === document.activeElement) {
                                index = i;
                                break;
                            }
                        }

                        if(index > -1) {
                            let nextIndex = null;

                            if(e.shiftKey) {
                                nextIndex = --index;
                            } else {
                                nextIndex = ++index;
                            }

                            if(nextIndex >= focusableElements.length) {
                                nextIndex = 0;
                            } else if(nextIndex < 0) {
                                nextIndex = focusableElements.length - 1;
                            }

                            focusableElements[nextIndex].focus();
                        }
                    }
                });
            }
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
                        showScreen(verificationScreen);
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

        function oauthEvents() {
            const oauthButtons = document.querySelectorAll('.oauth-button');

            for(let i = 0; i < oauthButtons.length; i++) {
                let button = oauthButtons[i];

                if(button._listener) {
                    continue;
                }

                button._listener = true;

                button.addEventListener('click', async function(e) {
                    e.preventDefault();
                    e.stopPropagation();

                    if(this._ip) {
                        return false;
                    }

                    this._ip = true;

                    let provider = button.getAttribute('data-provider');

                    toggleSpinner(this, true);

                    setErrorMessage(this, false, '');

                    if(provider === 'google') {
                        try {
                            let loginData = await befriend.oauth.signInWithGoogle();

                            setUserLogin(loginData);

                            await afterLoginLogic();
                        } catch(e) {
                            if(e) {
                                setErrorMessage(this, true, e.toString());
                            }
                        }
                    } else if (provider === 'apple') {
                        try {
                            let loginData = await befriend.oauth.signInWithApple();

                            setUserLogin(loginData);

                            await afterLoginLogic();

                        } catch(e) {
                            if(e) {
                                setErrorMessage(this, true, e.toString());
                            }
                        }
                    }

                    toggleSpinner(this, false);

                    this._ip = false;
                });
            }
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
                // Store the currently selected day (if any)
                let selectedDay = daySelect.value ? parseInt(daySelect.value) : null;

                // Clear existing days
                daySelect.innerHTML = '<option value="" selected disabled>Day</option>';

                // Get number of days in the selected month and year
                const daysInMonth = new Date(year, month, 0).getDate();

                // Add day options
                for (let day = 1; day <= daysInMonth; day++) {
                    const option = document.createElement('option');
                    option.value = day;
                    option.textContent = day;

                    // Re-select the previously selected day if it's valid for the new month/year
                    if (selectedDay && day === selectedDay && day <= daysInMonth) {
                        option.selected = true;
                    }

                    daySelect.appendChild(option);
                }
            }

            // Event listeners
            monthSelect.addEventListener('change', function() {
                setErrorMessage(this, false, '');

                if (yearSelect.value) {
                    populateDays(parseInt(monthSelect.value), parseInt(yearSelect.value));
                }
            });

            yearSelect.addEventListener('change', function() {
                setErrorMessage(this, false, '');

                if (monthSelect.value) {
                    populateDays(parseInt(monthSelect.value), parseInt(yearSelect.value));
                }
            });

            // Default populate days for current month/year
            populateDays(1, currentYear);

            let profilePictureContainerEl = document.querySelector('.profile-picture-container');

            profilePictureContainerEl.addEventListener('click', function() {
                // Show camera/gallery selection dialog
                window.BefriendPlugin.camera.getPicture(
                    function(imageData) {
                        setErrorMessage(profilePictureContainerEl, false, '');

                        befriend.loginSignup.setProfilePictureData(imageData);
                    },
                    function(error) {
                        console.warn('User cancelled picture selection');
                    },
                    {
                        quality: 90,
                        targetWidth: 1000,
                        targetHeight: 1000,
                        allowsEditing: true
                    }
                );
            });

            let clearPictureEl = profilePictureContainerEl.querySelector('.clear');

            clearPictureEl.addEventListener('click', async function(e) {
                e.preventDefault();
                e.stopPropagation();

                setErrorMessage(this, false, '');

                befriend.loginSignup.setProfilePictureData(null);
            });

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
                let profilePicture = window.profilePictureData || null;

                try {
                    let r = await befriend.auth.put(`/profile`, {
                        picture: profilePicture, //base64 jpg (1000 w/h)
                        first_name: firstName,
                        last_name: lastName,
                        gender_token: genderToken,
                        birthday: {
                            month: birthdayMonth,
                            day: birthdayDay,
                            year: birthdayYear
                        }
                    });

                    let data = r.data;

                    if(befriend.me.data.me) {
                        befriend.me.data.me = {
                            ...befriend.me.data.me,
                            ...data
                        }
                    }

                    await afterLoginLogic(true);
                } catch(e) {
                    setErrorMessage(this, true, e?.response?.data || 'Error saving profile');

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

        befriend.loginSignup.currentScreen = phoneScreen;

        inputEvents();

        clickEvents();

        oauthEvents();

        birthdayEvents();
    }

}