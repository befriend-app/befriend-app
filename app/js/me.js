//todo
//on change country, unset data->categories

befriend.me = {
    data: {
        me: null,
        genders: null,
        modes: null,
        sections: {
            all: null,
            options: null,
            active: null,
            collapsed: {},
        },
        categories: {},
        location: null,
    },
    autoComplete: {
        minChars: 2,
        selected: {
            filterList: {
                //by section
            },
        },
    },
    modes: {
        selected: 'solo', // default
        options: [
            {
                id: 'solo',
                name: `<div class="text">Solo</div>`,
                description: 'Just me',
                icon: `
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 434.1641 512"><path d="M210.3516,246.6328c33.8828,0,63.2188-12.1523,87.1953-36.1289,23.9688-23.9727,36.125-53.3047,36.125-87.1914s-12.1523-63.2109-36.1289-87.1914C273.5664,12.1523,244.2305,0,210.3516,0s-63.2188,12.1523-87.1914,36.125-36.1289,53.3086-36.1289,87.1875,12.1562,63.2227,36.1289,87.1953c23.9805,23.9688,53.3164,36.125,87.1914,36.125ZM144.3789,57.3398c18.3945-18.3945,39.9727-27.3359,65.9727-27.3359s47.5781,8.9414,65.9766,27.3359c18.3945,18.3984,27.3398,39.9805,27.3398,65.9727s-8.9453,47.5781-27.3398,65.9766c-18.3984,18.3984-39.9805,27.3398-65.9766,27.3398s-47.5703-8.9453-65.9727-27.3398c-18.3984-18.3945-27.3438-39.9766-27.3438-65.9766s8.9453-47.5742,27.3438-65.9727Z"/><path d="M426.1289,393.7031c-.6914-9.9766-2.0898-20.8594-4.1484-32.3516-2.0781-11.5781-4.7539-22.5234-7.957-32.5273-3.3125-10.3398-7.8086-20.5508-13.375-30.3359-5.7695-10.1562-12.5508-19-20.1602-26.2773-7.957-7.6133-17.6992-13.7344-28.9648-18.1992-11.2266-4.4414-23.668-6.6914-36.9766-6.6914-5.2266,0-10.2812,2.1445-20.043,8.5-6.0078,3.918-13.0352,8.4492-20.8789,13.4609-6.707,4.2734-15.793,8.2773-27.0156,11.9023-10.9492,3.543-22.0664,5.3398-33.043,5.3398-10.9688,0-22.0859-1.7969-33.043-5.3398-11.2109-3.6211-20.3008-7.625-26.9961-11.8984-7.7695-4.9648-14.8008-9.4961-20.8984-13.4688-9.7539-6.3555-14.8086-8.5-20.0352-8.5-13.3125,0-25.75,2.2539-36.9727,6.6992-11.2578,4.457-21.0039,10.5781-28.9688,18.1992-7.6094,7.2812-14.3906,16.1211-20.1562,26.2734-5.5586,9.7852-10.0586,19.9922-13.3711,30.3398-3.1992,10.0039-5.875,20.9453-7.9531,32.5234-2.0625,11.4766-3.457,22.3633-4.1484,32.3633-.6797,9.7773-1.0234,19.9531-1.0234,30.2344,0,26.7266,8.4961,48.3633,25.25,64.3203,16.5469,15.7461,38.4375,23.7305,65.0664,23.7305h246.5312c26.6211,0,48.5117-7.9844,65.0625-23.7305,16.7578-15.9453,25.2539-37.5898,25.2539-64.3242-.0039-10.3164-.3516-20.4922-1.0352-30.2422ZM381.2227,466.5312c-10.9336,10.4062-25.4492,15.4648-44.3789,15.4648H90.3164c-18.9336,0-33.4492-5.0586-44.3789-15.4609-10.7227-10.207-15.9336-24.1406-15.9336-42.5859,0-9.5938.3164-19.0664.9492-28.1602.6172-8.9219,1.8789-18.7227,3.75-29.1367,1.8477-10.2852,4.1992-19.9375,6.9961-28.6758,2.6836-8.3789,6.3438-16.6758,10.8828-24.668,4.332-7.6172,9.3164-14.1523,14.8164-19.418,5.1445-4.9258,11.6289-8.957,19.2695-11.9805,7.0664-2.7969,15.0078-4.3281,23.6289-4.5586,1.0508.5586,2.9219,1.625,5.9531,3.6016,6.168,4.0195,13.2773,8.6055,21.1367,13.625,8.8594,5.6484,20.2734,10.75,33.9102,15.1523,13.9414,4.5078,28.1602,6.7969,42.2734,6.7969s28.3359-2.2891,42.2695-6.793c13.6484-4.4102,25.0586-9.5078,33.9297-15.1641,8.043-5.1406,14.9531-9.5938,21.1211-13.6172,3.0312-1.9727,4.9023-3.043,5.9531-3.6016,8.625.2305,16.5664,1.7617,23.6367,4.5586,7.6367,3.0234,14.1211,7.0586,19.2656,11.9805,5.5,5.2617,10.4844,11.7969,14.8164,19.4219,4.543,7.9883,8.207,16.2891,10.8867,24.6602,2.8008,8.75,5.1562,18.3984,7,28.6758,1.8672,10.4336,3.1328,20.2383,3.75,29.1445v.0078c.6367,9.0586.957,18.5273.9609,28.1484-.0039,18.4492-5.2148,32.3789-15.9375,42.582Z"/></svg>
                `,
            },
            {
                id: 'plus-one',
                name: `
                    <svg class="plus" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12,24C5.383,24,0,18.617,0,12S5.383,0,12,0s12,5.383,12,12-5.383,12-12,12ZM12,1C5.935,1,1,5.935,1,12s4.935,11,11,11,11-4.935,11-11S18.065,1,12,1Z"/><path d="M17.5,12.5H6.5c-.276,0-.5-.224-.5-.5s.224-.5.5-.5h11c.276,0,.5.224.5.5s-.224.5-.5.5Z"/><path d="M12,18c-.276,0-.5-.224-.5-.5V6.5c0-.276.224-.5.5-.5s.5.224.5.5v11c0,.276-.224.5-.5.5Z"/></svg>
                    <div class="text">1</div>`,
                description: 'Me and a partner',
                icon: `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 530 356.198">
                  <path d="M133,184c-50.8102,0-92-41.1898-92-92S82.1898,0,133,0s92,41.1898,92,92c-.0584,50.786-41.214,91.9416-92,92ZM133,20c-39.7645,0-72,32.2355-72,72s32.2355,72,72,72,72-32.2355,72-72c-.0441-39.7462-32.2538-71.9559-72-72Z" fill="black"/>
                  
                  <path d="M256,356.198H10C4.4772,356.198,0,351.7209,0,346.198v-49.2c0-73.4539,59.5461-133,133-133s133,59.5461,133,133v49.2c0,5.5229-4.4771,10-10,10ZM20,336.198h226v-39.2c0-62.4082-50.5918-113-113-113s-113,50.5918-113,113v39.2Z" fill="black"/>
                  
                  <path d="M379,184c-50.8102,0-92-41.1898-92-92S328.1898,0,379,0s92,41.1898,92,92c-.0584,50.786-41.214,91.9416-92,92ZM379,20c-39.7645,0-72,32.2355-72,72s32.2355,72,72,72,72-32.2355,72-72c-.0441-39.7462-32.2538-71.9559-72-72Z" fill="black"/>
                  
                  <path d="M502,356.198h-246c-5.5228,0-10-4.4771-10-10v-49.2c0-73.4539,59.5461-133,133-133s133,59.5461,133,133v49.2c0,5.5229-4.4771,10-10,10ZM266,336.198h226v-39.2c0-62.4082-50.5918-113-113-113s-113,50.5918-113,113v39.2Z" fill="black"/>
                </svg>
                `,
            },
            {
                id: 'plus-kids',
                name: `
                    <svg class="plus" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12,24C5.383,24,0,18.617,0,12S5.383,0,12,0s12,5.383,12,12-5.383,12-12,12ZM12,1C5.935,1,1,5.935,1,12s4.935,11,11,11,11-4.935,11-11S18.065,1,12,1Z"/><path d="M17.5,12.5H6.5c-.276,0-.5-.224-.5-.5s.224-.5.5-.5h11c.276,0,.5.224.5.5s-.224.5-.5.5Z"/><path d="M12,18c-.276,0-.5-.224-.5-.5V6.5c0-.276.224-.5.5-.5s.5.224.5.5v11c0,.276-.224.5-.5.5Z"/></svg>
                    <div class="text">Kids</div>`,
                description: 'Family mode',
                icon: `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1430.1223 1615.57"><defs><style>.mode-kids-cls-1{fill:none;stroke:#000;stroke-miterlimit:10;stroke-width:45px;}</style></defs><circle class="mode-kids-cls-1" cx="375.06" cy="199.57" r="177.07"/><path class="mode-kids-cls-1" d="M498.25,499.83H168.21c-80.47,0-145.71,65.24-145.71,145.71v314.7499c0,60.34,48.92,109.26,109.26,109.26h50.16v445.97c0,42.83,34.72,77.55,77.55,77.55h888.31c42.83,0,77.55-34.72,77.55-77.55v-245.8"/><path class="mode-kids-cls-1" d="M375.06,1593.06v-392.64"/><path class="mode-kids-cls-1" d="M181.91,1069.5399v-369.54"/><circle class="mode-kids-cls-1" cx="1052.5599" cy="261.16" r="153.98"/><path class="mode-kids-cls-1" d="M960.1801,546.02h247.64c71.17,0,132.72,49.57,147.89,119.1l42.24,193.61c13.41,61.4399-24.9399,122.28-86.16,136.6801l-20.5699,4.84"/><path class="mode-kids-cls-1" d="M1221.9399,730.79l107.09,535.43c.36,1.8101-1.02,3.49-2.86,3.49h-436.41"/><circle class="mode-kids-cls-1" cx="721.51" cy="492.13" r="115.48"/><path class="mode-kids-cls-1" d="M575.23,915.56l4.76,677.5"/><path class="mode-kids-cls-1" d="M889.75,1593.06v-677.5"/><path class="mode-kids-cls-1" d="M575.23,1144.49h-32.61c-52.15,0-94.42-42.28-94.42-94.42v-165.53c0-84.91,68.84-153.75,153.75-153.75h258.3699c84.91,0,153.75,68.84,153.75,153.75v165.53c0,52.15-42.28,94.42-94.42,94.42h-32.61"/><path class="mode-kids-cls-1" d="M1061.39,1593.06v-323.35"/><path class="mode-kids-cls-1" d="M731.14,1593.06v-308.63"/></svg>`,
            },
        ],
    },
    actions: {
        delete: {
            section: null,
        },
    },
    secondaries: {
        activeEl: null,
    },
    init: function () {
        return new Promise(async (resolve, reject) => {
            try {
                await befriend.me.getMe();

                await befriend.me.setMe();
                befriend.me.setActive();
                befriend.me.setOptions();
            } catch (e) {
                console.error(e);
            }

            resolve();
        });
    },
    getMe: function () {
        return new Promise(async (resolve, reject) => {
            try {
                let r = await befriend.auth.get('/me', {
                    location: befriend.location.device,
                });

                let data = r.data;

                befriend.me.data.me = data.me;
                befriend.me.data.genders = data.genders;
                befriend.me.data.modes = data.modes;

                befriend.me.data.sections.all = data.sections.all;
                befriend.me.data.sections.options = data.sections.options;
                befriend.me.data.sections.active = sortObj(data.sections.active, 'position');

                befriend.filters.data.filters = data.filters;

                if (data.me.country) {
                    befriend.me.data.country = data.country;
                }

                //local data
                befriend.user.setLocal('me.me', data.me);
            } catch (e) {
                console.error(e);

                if (
                    befriend.user.local.data &&
                    befriend.user.local.data.me &&
                    befriend.user.local.data.me.me
                ) {
                    console.log('Using local me data');
                    befriend.me.data.me = befriend.user.local.data.me.me;
                }
            }

            resolve();
        });
    },
    getCategoryOptions: function (endpoint, category_token) {
        return new Promise(async (resolve, reject) => {
            try {
                let r = await befriend.auth.get(endpoint, {
                    category_token,
                });

                resolve(r.data);
            } catch (e) {
                console.error(e);
                return reject();
            }
        });
    },
    setMe: async function () {
        if (!befriend.me.data.me) {
            return;
        }

        let me_obj = befriend.me.data.me;

        //birthday
        let birthday_el = befriend.els.me.querySelector('.birthday');

        if (me_obj.birth_date) {
            let years = dayjs().diff(dayjs(me_obj.birth_date), 'years');

            let date = dayjs(me_obj.birth_date).format('MMM. Do, YYYY');

            birthday_el.querySelector('.age').innerHTML = years;

            if (years >= 100) {
                addClassEl('one-hundred', birthday_el.querySelector('.age'));
            }

            // birthday_el.querySelector('.date').innerHTML = date;
        }

        //first name
        let first_name_el = befriend.els.me.querySelector('.first-name');

        if (me_obj.first_name) {
            first_name_el.innerHTML = me_obj.first_name;
        }

        //email
        let email_el = befriend.els.me.querySelector('.settings-item.email');

        email_el.querySelector('.info').innerHTML = me_obj.email;

        //country
        let country_el = befriend.els.me.querySelector('.settings-item.country');

        if (me_obj.country) {
            country_el.querySelector('.info').innerHTML = me_obj.country.name;
        }

        //mode
        if (me_obj.mode) {
            this.selectMode(me_obj.mode, true);
        }
    },
    selectMode: async function (mode, skip_server) {
        const modeOptions = befriend.els.me.querySelectorAll('.mode-option');
        const selectedModeContainer = befriend.els.me.querySelector('.selected-mode-container');

        removeElsClass(modeOptions, 'selected');

        let selectedModeEl = Array.from(modeOptions).find(
            (el) => el.getAttribute('data-mode') === mode,
        );

        addClassEl('selected', selectedModeEl);

        befriend.me.modes.selected = mode;

        if (mode === 'plus-one' || mode === 'plus-kids') {
            function genderSelected(gender) {
                if (befriend.me.data?.modes?.data?.partner?.gender_id === gender.id) {
                    return 'selected';
                }

                return '';
            }

            addClassEl('active', selectedModeContainer);

            // Set up container content based on mode
            let html = '';

            if (mode === 'plus-one') {
                const genders = befriend.me.data.genders;

                html = `
                <div class="partner">
                    <div class="label">
                            Your Partner
                    </div>
                    <div class="options">
                        ${genders
                            .filter(gender => gender.is_visible)
                            .map(
                                (gender) => `
                            <div class="option ${genderSelected(gender)}" data-gender="${gender.token}">${gender.name}</div>
                        `,
                            )
                            .join('')}
                    </div>
                </div>`;
            } else if (mode === 'plus-kids') {
                html = `
                <div class="kids">
                    <div class="add-kid">
                        <div class="add-btn">
                           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28"><path d="M14,0C6.28,0,0,6.28,0,14s6.28,14,14,14,14-6.28,14-14S21.72,0,14,0ZM14,26c-6.62,0-12-5.38-12-12S7.38,2,14,2s12,5.38,12,12-5.38,12-12,12Z"/><path d="M21,13h-6v-6c0-1.32-2-1.32-2,0v6h-6c-1.32,0-1.32,2,0,2h6v6c0,1.32,2,1.32,2,0v-6h6c1.32,0,1.32-2,0-2Z"/></svg>
                            Add Kid
                        </div>
                    </div>
                    <div class="kids-list"></div>
                </div>`;
            }

            selectedModeContainer.innerHTML = html;

            // Initialize event handlers
            if (mode === 'plus-one') {
                befriend.me.events.onPartnerGenderSelect();
            } else if (mode === 'plus-kids') {
                if (befriend.me.data?.modes?.data?.kids) {
                    for (let kid of Object.values(befriend.me.data.modes.data.kids)) {
                        befriend.me.addKidHtml(kid);
                    }
                }

                befriend.me.events.onKids();
            }

            requestAnimationFrame(function () {
                befriend.me.updateModeHeight();
            });
        } else {
            removeClassEl('active', selectedModeContainer);
            selectedModeContainer.innerHTML = '';
        }

        if (!skip_server) {
            await befriend.auth.put(`/me/mode`, {
                mode: befriend.me.modes.selected,
            });
        }
    },
    addKidHtml: function (kid = {}) {
        let kid_els = befriend.els.me.querySelector('.kids').getElementsByClassName('kid');
        let count = kid_els.length + 1;

        let age_options = '';
        let gender_options = '';
        let current_age = null;

        if (befriend.me.data?.modes?.options?.kids) {
            for (let k in befriend.me.data.modes.options.kids) {
                let age = befriend.me.data.modes.options.kids[k];

                let selected = '';

                if (kid?.age_id === age.id) {
                    selected = 'selected';
                    current_age = age;
                }

                age_options += `<div class="option ${selected}" 
                    data-token="${age.token}">${age.name}</div>`;
            }
        }

        for (let gender of befriend.me.data.genders) {
            if(!gender.is_visible) {
                continue;
            }

            let gender_name =
                gender.token === 'male' ? 'Boy' : gender.token === 'female' ? 'Girl' : gender.name;

            gender_options += `
                <div class="option ${kid.gender_id === gender.id ? 'selected' : ''}" 
                    data-token="${gender.token}">${gender_name}</div>`;
        }

        let html = `
                <div class="kid" data-token="${kid.token || ''}">
                  <svg class="remove" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                    <path d="M256,512C114.8359,512,0,397.1641,0,256S114.8359,0,256,0s256,114.8359,256,256-114.8359,256-256,256ZM256,32c-123.5195,0-224,100.4805-224,224s100.4805,224,224,224,224-100.4805,224-224S379.5195,32,256,32Z"/>
                    <path d="M368,272h-224c-8.832,0-16-7.168-16-16s7.168-16,16-16h224c8.832,0,16,7.168,16,16s-7.168,16-16,16Z"/>
                  </svg>
                  
                  <div class="number-active">
                        <div class="child-number">Child #${count}</div>
                        <div class="kid-active">
                            ${toggleHtml(kid?.is_active, 'Active')}
                        </div>
                  </div>
                  
                  <div class="age">
                    <div class="select-list ${!current_age ? 'unselected' : ''}" 
                         data-value="${current_age?.age_token || ''}">
                      <div class="current-selected">${current_age?.name || 'Select Age'}</div>
                      <svg class="arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 82.1 43.2">
                        <path d="M41.1,43.2L0,2.2,2.1,0l39,39L80,0l2.1,2.2-41,41Z"/>
                      </svg>
                      <div class="options">${age_options}</div>
                    </div>
                  </div>
                  <div class="gender">${gender_options}</div>
                </div>`;

        let kids_list_el = befriend.els.me.querySelector(
            '.selected-mode-container .kids .kids-list',
        );
        kids_list_el.insertAdjacentHTML('beforeend', html);

        befriend.me.events.onKids();

        requestAnimationFrame(function () {
            befriend.me.updateModeHeight();
        });
    },
    updateModeHeight: function (without_transition) {
        const selectedModeContainer = befriend.els.me.querySelector('.selected-mode-container');

        if (without_transition) {
            selectedModeContainer.style.transition = 'none';

            setTimeout(function () {
                selectedModeContainer.style.removeProperty('transition');
            }, befriend.variables.me_mode_transition_ms);
        }

        setElHeightDynamic(selectedModeContainer);
    },
    transitionKidsAgeT: null,
    transitionKidsAge: function (list_el, show) {
        clearTimeout(this.transitionKidsAgeT);

        let options_el = list_el.querySelector('.options');
        let container_el = list_el.closest('.selected-mode-container ');

        container_el?.style?.setProperty('overflow-y', 'initial');

        if (show) {
            addClassEl('open', list_el);
            setElHeightDynamic(options_el);
        } else {
            removeClassEl('open', list_el);
            options_el.style.removeProperty('height');
            this.transitionKidsAgeT = setTimeout(function () {
                container_el?.style?.removeProperty('overflow-y');
            }, 300);
        }
    },
    saveSection: function (key) {
        return new Promise(async (resolve, reject) => {
            try {
                befriend.toggleSpinner(true);
                let r = await befriend.auth.post('/me/sections', { key });

                befriend.me.data.sections.active[key] = r.data;
            } catch (e) {
                console.error(e);
            }

            befriend.toggleSpinner(false);

            resolve();
        });
    },
    getSectionElByKey: function (key) {
        let sections_el = befriend.els.me.querySelector('.me-container').querySelector('.sections');

        return sections_el.querySelector(`.section[data-key="${key}"]`);
    },
    getSectionTableKey: function (section_key) {
        let section_el = this.getSectionElByKey(section_key);

        return section_el.getAttribute('data-table-key');
    },
    getSectionTableData: function (section_key) {
        let section_data = this.getActiveSection(section_key);

        return section_data?.data?.tables;
    },
    getActiveSection: function (key) {
        return befriend.me.data.sections.active?.[key];
    },
    getSectionAutoComplete: function (key) {
        let section = this.getActiveSection(key);

        if (section) {
            return section.data?.autoComplete;
        }

        return null;
    },
    buildSelectFilterList: function (key, data) {
        let items = data?.filter?.list;

        if (!items || !items.length) {
            return '';
        }

        let list_html = ``;

        for (let item of items) {
            let emoji = '';

            if (item.emoji) {
                emoji = `<div class="emoji">${item.emoji}</div>`;
            }

            list_html += `<div class="item" data-id="${item.id}">
                            ${emoji}
                            <div class="name">${item.name}</div>
                        </div>`;
        }

        //selected
        let selected_str = '';

        let filterListObj = befriend.me.autoComplete.selected.filterList;

        if (key === 'schools') {
            if (befriend.user.local.data.me &&
                befriend.user.local.data.me.filterList &&
                befriend.user.local.data.me.filterList[key] ) {

                filterListObj[key] = {
                    item: befriend.user.local.data.me.filterList[key],
                };

                selected_str = befriend.user.local.data.me.filterList[key].name;
            } else if (befriend.me.data?.me?.country?.name) {
                selected_str = befriend.me.data.me.country.name;

                filterListObj[key] = {
                    item: befriend.me.data.me.country,
                };
            }
        }

        return `<div class="select-container">
                        <div class="selected-container">
                          <span class="selected-name">${selected_str}</span>
                          <div class="select-arrow"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448.569 256.5604"><g id="Layer_1-2"><path d="M441.9533,40.728l-193.176,205.2496c-13.28,14.1104-35.704,14.1104-48.984,0L6.6157,40.728C-7.8979,25.3056,3.0349,0,24.2125,0h400.1424c21.1792,0,32.112,25.3056,17.5984,40.728h0Z"/></g></svg></div>
                        </div>
                        
                        <div class="select-dropdown">
                          <div class="select-search-container">
                            <input class="select-input" type="text" placeholder="${data.placeholders.list}">
                            <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 611.9975 612.0095"><g id="_x34_"><path d="M606.203,578.714l-158.011-155.486c41.378-44.956,66.802-104.411,66.802-169.835-.02-139.954-115.296-253.393-257.507-253.393S0,113.439,0,253.393s115.276,253.393,257.487,253.393c61.445,0,117.801-21.253,162.068-56.586l158.624,156.099c7.729,7.614,20.277,7.614,28.006,0,7.747-7.613,7.747-19.971.018-27.585ZM257.487,467.8c-120.326,0-217.869-95.993-217.869-214.407S137.161,38.986,257.487,38.986s217.869,95.993,217.869,214.407-97.542,214.407-217.869,214.407Z"/></g></svg>
                          </div>
                          <div class="select-list">${list_html}</div>
                          <div class="no-results">${data.filter.noResults}</div>
                        </div>
                      </div>`;
    },
    selectAutoCompleteFilterItem: function (section_key, item_id) {
        let section_data = befriend.me.getSectionAutoComplete(section_key);

        if (!section_data) {
            return;
        }

        item_id = parseInt(item_id);

        let selected_item = section_data.filter.list.find((item) => item.id === item_id);

        if (!selected_item) {
            throw new Error('Select item not found');
        }

        //data
        befriend.me.autoComplete.selected.filterList[section_key] = {
            item: selected_item,
            needsReset: true,
        };

        //save for local storage
        befriend.user.setLocal(`me.filterList.${section_key}`, selected_item);

        //ui
        let section_el = befriend.me.getSectionElByKey(section_key);
        let select_container = section_el.querySelector('.select-container');
        let selected_name_el = select_container.querySelector('.selected-name');
        selected_name_el.innerHTML = selected_item.name;

        removeClassEl('open', select_container);
    },
    getRowColsClass: function (section_data, category) {
        if (section_data?.data?.styles?.rowCols) {
            if (typeof section_data.data.styles.rowCols === 'object') {
                return category === 'mine'
                    ? section_data.data.styles.rowCols.my ||
                          section_data.data.styles.rowCols.default
                    : section_data.data.styles.rowCols.default;
            }
            return section_data.data.styles.rowCols;
        }
        return '';
    },
    addSection: async function (key, add_to_top, on_update, skip_save) {
        let option_data = befriend.me.data.sections.all[key];
        let sections_el = befriend.els.me.querySelector('.me-container').querySelector('.sections');
        let section_els = sections_el.getElementsByClassName('section');

        let section_el = befriend.me.getSectionElByKey(key);

        let section_collapsed = '';
        let section_height = '';

        if (option_data) {
            let prev_index;

            //delete section if prev, re-insert at same position
            if (section_el) {
                for (let i = 0; i < section_els.length; i++) {
                    if (section_els[i] === section_el) {
                        prev_index = i;
                        break;
                    }
                }

                section_el.parentNode.removeChild(section_el);
            }

            delete befriend.me.data.sections.options[key];

            if (!(key in befriend.me.data.sections.active)) {
                if (!skip_save) {
                    //save to server
                    try {
                        await befriend.me.saveSection(key);
                    } catch (e) {
                        console.error(e);
                    }
                }
            }

            let section_data = befriend.me.getActiveSection(key);

            if (!section_data?.data?.tables) {
                return;
            }

            let section_type = section_data.data?.type?.name;
            let table_data = section_data.data.tables ? section_data.data.tables[0] : null;

            let autocomplete_html = '';
            let my_items_category = '';
            let categories_html = '';
            let tabs_html = '';
            let secondary_container_html = '';
            let items_html = '';

            if (section_data.data) {
                //autocomplete
                if (section_data.data.autoComplete) {
                    let select_list = befriend.me.buildSelectFilterList(
                        key,
                        section_data.data.autoComplete,
                    );

                    autocomplete_html = `
                            <div class="search-container ${select_list ? 'has-select' : ''}">
                                <div class="autocomplete-container">
                                    <div class="input-container">
                                        <input type="text" class="search-input" placeholder="${section_data.data.autoComplete.placeholders.main}">
                                        <div class="search-icon-container">
                                            <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 611.9975 612.0095"><g id="_x34_"><path d="M606.203,578.714l-158.011-155.486c41.378-44.956,66.802-104.411,66.802-169.835-.02-139.954-115.296-253.393-257.507-253.393S0,113.439,0,253.393s115.276,253.393,257.487,253.393c61.445,0,117.801-21.253,162.068-56.586l158.624,156.099c7.729,7.614,20.277,7.614,28.006,0,7.747-7.613,7.747-19.971.018-27.585ZM257.487,467.8c-120.326,0-217.869-95.993-217.869-214.407S137.161,38.986,257.487,38.986s217.869,95.993,217.869,214.407-97.542,214.407-217.869,214.407Z"/></g></svg>
                                        </div>
                                    </div>

                                    <div class="autocomplete-list"></div>
                                </div>
                                
                                ${select_list}
                            </div>
                        `;
                }

                //categories
                if (section_data.data?.categories?.options) {
                    my_items_category = `<div class="category-btn mine active" data-category="mine">
                                                ${section_data.data.myStr}
                                        </div>`;

                    for (let category of section_data.data.categories.options) {
                        let heading_html = category.heading
                            ? `<div class="heading">${category.heading}</div>`
                            : '';
                        let image_html = category.image
                            ? `<div class="image">${category.image}</div>`
                            : '';

                        let data_category = `data-category="${category.name}"`;

                        let data_category_token = '';

                        if (category.token) {
                            data_category_token = `data-category-token="${category.token}"`;
                        }

                        let data_table_key = '';

                        if (category.table_key) {
                            data_table_key = `data-category-table="${category.table_key}"`;
                        }

                        categories_html += `<div class="category-btn ${heading_html ? 'w-heading' : ''}" ${data_category} ${data_table_key} ${data_category_token}>
                                            ${image_html}
                                            <div class="heading-name">
                                                ${heading_html}
                                                <div class="name">${category.name}</div> 
                                            </div>
                                        </div>`;
                    }

                    categories_html = `<div class="categories-container">
                                        <div class="category-mine">${my_items_category}</div>
                                        <div class="category-filters">${categories_html}</div>
                                    </div>`;
                }

                //tabs
                if (section_data.data?.tabs?.length) {
                    for (let i = 0; i < section_data.data.tabs.length; i++) {
                        let tab = section_data.data.tabs[i];

                        tabs_html += `<div class="tab ${i === 0 ? 'active' : ''}" data-key="${tab.key}">${tab.name}</div>`;
                    }

                    tabs_html = `<div class="tabs">${tabs_html}</div>`;
                }

                //secondary container
                if(section_data.data.secondary) {
                    let secondary_keys = Object.keys(section_data.data.secondary);

                    if(secondary_keys.length) {
                        if(section_data.data.secondary[secondary_keys[0]].options?.length) {
                            secondary_container_html = `<div class="secondary-container"></div>`;
                        }
                    }
                }

                //options/items
                if (['buttons'].includes(section_type)) {
                    if (section_data.data?.options?.length) {
                        let options = [...section_data.data.options];

                        options.sort((a, b) => {
                            const aSelected = Object.values(section_data.items).some(
                                (item) => item.token === a.token,
                            );
                            const bSelected = Object.values(section_data.items).some(
                                (item) => item.token === b.token,
                            );
                            if (aSelected && !bSelected) return -1;
                            if (!aSelected && bSelected) return 1;
                            return 0;
                        });

                        for (let option of options) {
                            let item_html = befriend.me.sectionItemHtml(
                                key,
                                table_data?.name,
                                option,
                            );

                            items_html += item_html;
                        }
                    }
                } else if (Object.keys(section_data.items).length) {
                    for (let token in section_data.items) {
                        //filter by tab
                        let item = section_data.items[token];

                        if (tabs_html) {
                            let active_tab = section_data.data.tabs[0];

                            if (active_tab && item.table_key !== active_tab.key) {
                                continue;
                            }
                        }

                        let table_key = item.table_key || table_data?.name;

                        let item_html = befriend.me.sectionItemHtml(key, table_key, item);

                        items_html += item_html;
                    }
                }
            }

            //initialize collapsed if saved
            if (befriend.me.data.sections.collapsed[key]) {
                section_collapsed = 'collapsed';
                section_height = '0';
            }

            // Build section classes
            let has_type = section_type || '';
            let has_tabs = tabs_html ? 'w-tabs' : '';
            let has_categories = categories_html ? 'w-categories' : '';
            let row_cols_class = befriend.me.getRowColsClass(section_data, 'mine');

            let html = `<div class="section my-items ${key} ${section_collapsed} ${has_type} ${has_categories} ${has_tabs} ${items_html ? '' : 'no-items'}" data-key="${key}" data-table-key="${table_data?.name ? table_data.name : ''}" style="${section_height}">
                                <div class="section-top">
                                    <div class="icon">${option_data.icon}</div>
                                    <div class="title">${option_data.section_name}</div>
                                    <div class="actions">
                                        <div class="menu">
                                            <div class="action" data-action="delete">
                                                <div class="icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 346.8033 427.0013"><path d="M232.4016,154.7044c-5.5234,0-10,4.4766-10,10v189c0,5.5195,4.4766,10,10,10s10-4.4805,10-10v-189c0-5.5234-4.4766-10-10-10Z"/><path d="M114.4016,154.7044c-5.5234,0-10,4.4766-10,10v189c0,5.5195,4.4766,10,10,10s10-4.4805,10-10v-189c0-5.5234-4.4766-10-10-10Z"/><path d="M28.4016,127.1224v246.3789c0,14.5625,5.3398,28.2383,14.668,38.0508,9.2852,9.8398,22.207,15.4258,35.7305,15.4492h189.2031c13.5273-.0234,26.4492-5.6094,35.7305-15.4492,9.3281-9.8125,14.668-23.4883,14.668-38.0508V127.1224c18.543-4.9219,30.5586-22.8359,28.0781-41.8633-2.4844-19.0234-18.6914-33.2539-37.8789-33.2578h-51.1992v-12.5c.0586-10.5117-4.0977-20.6055-11.5391-28.0312C238.4212,4.0482,228.3118-.0846,217.8001.0013h-88.7969c-10.5117-.0859-20.6211,4.0469-28.0625,11.4688-7.4414,7.4258-11.5977,17.5195-11.5391,28.0312v12.5h-51.1992c-19.1875.0039-35.3945,14.2344-37.8789,33.2578-2.4805,19.0273,9.5352,36.9414,28.0781,41.8633ZM268.0032,407.0013H78.8001c-17.0977,0-30.3984-14.6875-30.3984-33.5v-245.5h250v245.5c0,18.8125-13.3008,33.5-30.3984,33.5ZM109.4016,39.5013c-.0664-5.207,1.9805-10.2188,5.6758-13.8945,3.6914-3.6758,8.7148-5.6953,13.9258-5.6055h88.7969c5.2109-.0898,10.2344,1.9297,13.9258,5.6055,3.6953,3.6719,5.7422,8.6875,5.6758,13.8945v12.5H109.4016v-12.5ZM38.2024,72.0013h270.3984c9.9414,0,18,8.0586,18,18s-8.0586,18-18,18H38.2024c-9.9414,0-18-8.0586-18-18s8.0586-18,18-18Z"/><path d="M173.4016,154.7044c-5.5234,0-10,4.4766-10,10v189c0,5.5195,4.4766,10,10,10s10-4.4805,10-10v-189c0-5.5234-4.4766-10-10-10Z"/></svg></div>
                                                <div class="name">Delete</div>
                                            </div>
                                        </div>                                                   
                                        <svg class="more" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 426.667 85.334"><circle cx="42.667" cy="42.667" r="42.667"/><circle cx="213.333" cy="42.667" r="42.667"/><circle cx="384" cy="42.667" r="42.667"/></svg>
                                    </div>
                                </div>
                                
                                <div class="section-container">
                                    ${autocomplete_html}
                                    ${categories_html}
                                    ${tabs_html}
                                    ${secondary_container_html}
                                    <div class="items-container">
                                        <div class="items ${row_cols_class}">
                                            ${items_html}
                                        </div>
                                        <div class="no-items">No Items</div>
                                    </div>
                                </div>
                            </div>`;

            if (add_to_top) {
                sections_el.insertAdjacentHTML('afterbegin', html);
            } else if (isNumeric(prev_index) && section_els.length) {
                // Insert section at correct position
                if (prev_index === 0) {
                    sections_el.insertAdjacentHTML('afterbegin', html);
                } else {
                    let insert_after_el = section_els[prev_index - 1];

                    insert_after_el.insertAdjacentHTML('afterend', html);
                }
            } else {
                sections_el.insertAdjacentHTML('beforeend', html);
            }

            befriend.me.events.onSectionCategory();
            befriend.me.events.onSectionTabs();
            befriend.me.events.onSectionActions();
            befriend.me.events.onSectionReorder();
            befriend.me.events.autoComplete();
            befriend.me.events.autoCompleteFilterList();
            befriend.me.events.onActionSelect();
            befriend.me.events.onUpdateSectionHeight();
            befriend.me.events.onSelectItem();
            befriend.me.events.onSelectOptionItem();
            befriend.me.events.onRemoveItem();
            befriend.me.events.onFavorite();
            befriend.me.events.onOpenSecondary();
            befriend.me.events.onSelectSecondary();

            // Initialize section height
            section_el = befriend.me.getSectionElByKey(key);

            if (!section_collapsed) {
                befriend.me.updateSectionHeight(section_el, false, true, true);
            }
        }
    },
    addSectionItem: function (section_key, item_token, table_key) {
        console.log({
            add_section_item: table_key,
        });

        return new Promise(async (resolve, reject) => {
            try {
                let section_data = befriend.me.getActiveSection(section_key);
                let section_el = befriend.me.getSectionElByKey(section_key);

                if (!('items' in section_data)) {
                    section_data.items = {};
                }

                if (!table_key) {
                    table_key = befriend.me.getSectionTableKey(section_key);
                }

                let filterKey = section_data.data?.autoComplete?.filter?.hashKey;
                let hash_token = null;

                if (filterKey) {
                    hash_token =
                        befriend.me.autoComplete.selected.filterList[section_key].item[filterKey];
                }

                befriend.toggleSpinner(true);

                let r = await befriend.auth.post(`/me/sections/item`, {
                    section_key: section_key,
                    table_key: table_key,
                    item_token: item_token,
                    hash_token: hash_token || null,
                });

                section_data.items[item_token] = r.data;

                //add unique selection to options if not exists
                if (section_data.data.options) {
                    let option = section_data.data.options.find(
                        (item) => item.token === item_token,
                    );

                    if (!option) {
                        section_data.data.options.push(r.data);
                    }
                }

                //select first category
                let category_btn_first = section_el.querySelector('.category-btn');

                if (category_btn_first) {
                    fireClick(category_btn_first);
                }

                //select corresponding tab if
                let tab_els = section_el.querySelectorAll('.section-container .tab');

                if (tab_els && r.data.table_key) {
                    for (let i = 0; i < tab_els.length; i++) {
                        let tab_el = tab_els[i];

                        if (tab_el.getAttribute('data-key') === r.data.table_key) {
                            fireClick(tab_el);
                            break;
                        }
                    }
                }

                //re-add section if no categories
                if (!category_btn_first) {
                    befriend.me.addSection(section_key, false, true);
                }
            } catch (e) {
                console.error(e);
            }

            befriend.toggleSpinner(false, 100);

            resolve();
        });
    },
    deleteSection: function (section_key) {
        return new Promise(async (resolve, reject) => {
            try {
                let r = await befriend.auth.delete(`/me/sections/${section_key}`);

                befriend.me.toggleConfirm(false);

                //copy data all->options
                befriend.me.data.sections.options[section_key] =
                    befriend.me.data.sections.all[section_key];

                //delete from active
                delete befriend.me.data.sections.active[section_key];

                //delete in collapsed
                delete befriend.me.data.sections.collapsed[section_key];

                befriend.user.setLocal(
                    'me.sections.collapsed',
                    befriend.me.data.sections.collapsed,
                );

                //remove el
                let section_el = befriend.me.getSectionElByKey(section_key);

                if (section_el) {
                    section_el.parentNode.removeChild(section_el);
                }

                //reset options and event handlers
                befriend.me.setOptions();

                befriend.me.events.onSelectAvailableSection();

                resolve();
            } catch (e) {
                console.error(e);
                reject();
            }
        });
    },
    setActive: function () {
        if (befriend.me.data.sections.active) {
            for (let key in befriend.me.data.sections.active) {
                befriend.me.addSection(key, false, false, true);
            }

            //enable first category for each section
            let sections = befriend.els.me
                .querySelector('.sections')
                .getElementsByClassName('section');

            for (let i = 0; i < sections.length; i++) {
                let category_btns = sections[i].getElementsByClassName('category-btn');

                if (category_btns && category_btns.length) {
                    fireClick(category_btns[0]);
                }
            }
        }
    },
    setOptions: function () {
        let html = ``;

        let sections = befriend.me.data.sections.options;

        if (sections) {
            for (let key in sections) {
                let section = sections[key];

                html += `<div class="option" data-key="${section.section_key}">
                        <div class="icon">${section.icon}</div>
                        <div class="name">${section.section_name}</div>
                        <div class="add">
                            Add
                            <svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 266.7608 511.9493"><path d="M263.6408,248.3075L18.3078,2.9745C14.0408-1.0785,7.3208-.9725,3.2678,3.1875-.6792,7.3475-.6792,13.8545,3.2678,18.0145l237.76,237.76L3.2678,493.6415c-4.267,4.053-4.373,10.88-.213,15.04,4.053,4.267,10.88,4.373,15.04.213.107-.107.213-.213.213-.213l245.333-245.333c4.16-4.161,4.16-10.881,0-15.041Z"/></svg>
                        </div>
                    </div>`;
            }

            befriend.els.meSectionOptions.querySelector('.options').innerHTML = html;
        }
    },
    getSectionCategoryItemOptions: function (section_key, category_token) {
        if (!category_token) {
            return null;
        }

        let section_data = this.getActiveSection(section_key);

        if (!section_data?.data?.options?.length) {
            return null;
        }

        let items = [];

        for (let item of section_data.data.options) {
            if (category_token === item.category_token) {
                items.push(item);
            }
        }

        return items.length ? { items } : null;
    },
    searchItems: function (section_key, search_value) {
        return new Promise(async (resolve, reject) => {
            search_value = search_value ? search_value.trim() : '';

            let sectionAutocomplete = befriend.me.getSectionAutoComplete(section_key);

            let minChars = isNumeric(sectionAutocomplete.minChars)
                ? sectionAutocomplete.minChars
                : befriend.me.autoComplete.minChars;

            if (search_value.length < minChars) {
                befriend.me.toggleAutoComplete(null);
                return resolve();
            }

            try {
                let category_name = null,
                    category_token = null,
                    table_key = null;

                let section_el = befriend.me.getSectionElByKey(section_key);

                let endpoint = befriend.me.getSectionAutoComplete(section_key).endpoint;

                let filterId =
                    befriend.me.autoComplete.selected.filterList[section_key]?.item?.id || null;

                let active_category = section_el.querySelector('.category-btn.active');

                if (active_category) {
                    category_name = active_category.getAttribute('data-category') || null;
                    category_token = active_category.getAttribute('data-category-token');
                    table_key =
                        active_category.getAttribute('data-category-table') ||
                        befriend.me.getSectionTableKey(section_key) ||
                        null;
                }

                const r = await befriend.auth.get(endpoint, {
                    search: search_value,
                    filterId: filterId,
                    location: befriend.location.device || null,
                    category: {
                        name: category_name,
                        token: category_token,
                        table: table_key,
                    },
                });

                befriend.me.setAutoComplete(section_key, r.data.items);
            } catch (error) {
                console.error('Search error:', error);
            }
        });
    },
    setAutoComplete: async function (section_key, items) {
        let section_el = befriend.me.getSectionElByKey(section_key);

        let search_container_el = section_el.querySelector('.search-container');

        if (search_container_el) {
            let list = search_container_el.querySelector('.autocomplete-list');

            if (list) {
                let section_data = befriend.me.getActiveSection(section_key);
                let auto_compete_data = section_data.data.autoComplete;
                let items_html = '';

                if (auto_compete_data.groups && Object.keys(auto_compete_data.groups).length) {
                    for (let k in auto_compete_data.groups) {
                        let group = auto_compete_data.groups[k];

                        let group_html = '';

                        let groupItems = items[k];

                        if (groupItems && groupItems.length) {
                            for (let item of groupItems) {
                                if (item.token in section_data.items) {
                                    continue;
                                }

                                let location_html = '';

                                if (item.city) {
                                    if (item.state) {
                                        location_html = `<div class="location">${item.city}, ${item.state}</div>`;
                                    } else {
                                        location_html = `<div class="location">${item.city}</div>`;
                                    }
                                }

                                group_html += `<div class="item" data-token="${item.token}" data-table-key="${item.table_key || ''}">
                                                   ${location_html}
                                                   <div class="name">${item.name}</div>
                                              </div>`;
                            }

                            if (group_html) {
                                items_html += `<div class="group">
                                            <div class="group-name">${group.name}</div>
                                            <div class="group-list">${group_html}</div>
                                        </div>`;
                            }
                        }
                    }
                } else {
                    if (items) {
                        for (let item of items) {
                            if (item.token in section_data.items) {
                                continue;
                            }

                            let label = '';
                            let meta = '';

                            if (item.label) {
                                label = `<div class="label">
                                            <div class="text">${item.label}</div>
                                        </div>`;
                            }

                            if (item.meta) {
                                meta = `<div class="meta">${item.meta}</div>`;
                            }

                            items_html += `<div class="item ${label ? 'has-label' : ''}" data-token="${item.token}" data-table-key="${item.table_key || ''}">
                                                <div class="name-meta">
                                                    <div class="name">${item.name}</div>
                                                    ${meta}
                                                </div>
                                                ${label}
                                            </div>`;
                        }
                    }
                }

                if (!items_html) {
                    items_html = `<div class="no-results">No results</div>`;
                }

                list.innerHTML = items_html;

                befriend.me.toggleAutoComplete(search_container_el, true);

                //reset scroll
                list.scrollTop = 0;

                befriend.me.events.onSelectAutoCompleteItem();
            }
        }
    },
    isAutoCompleteShown: function () {
        let el = befriend.els.me.querySelector(
            `.search-container.${befriend.classes.autoCompleteMe}`,
        );

        return !!el;
    },
    isAutoCompleteSelectShown: function () {
        let el = befriend.els.me.querySelector(`.search-container .select-container.open`);

        return !!el;
    },
    updateCollapsed: async function (without_transition) {
        await rafAwait();

        //initialize height for transition
        let section_els = befriend.els.me
            .querySelector('.sections')
            .getElementsByClassName('section');

        for (let i = 0; i < section_els.length; i++) {
            let el = section_els[i];

            let key = el.getAttribute('data-key');

            let collapse = false;

            if (key in befriend.me.data.sections.collapsed) {
                collapse = befriend.me.data.sections.collapsed[key];
            }

            befriend.me.updateSectionHeight(el, collapse, without_transition, true);
        }
    },
    isSectionOptionsShown: function () {
        return elHasClass(document.documentElement, befriend.classes.availableMeSections);
    },
    toggleSectionOptions: function (show) {
        if (show) {
            addClassEl(befriend.classes.availableMeSections, document.documentElement);
        } else {
            removeClassEl(befriend.classes.availableMeSections, document.documentElement);
        }
    },
    toggleSectionActions: function (el, show) {
        if (show) {
            addClassEl('show-menu', el);
        } else {
            removeClassEl('show-menu', el);
        }
    },
    generateSecondaryOptionsHtml: function(section_data, table_key, item) {
        const secondary_options = section_data.data?.secondary?.[table_key]?.options;
        if (!secondary_options) return '';

        let secondary_options_html = '';

        for (let option of secondary_options) {
            let selected = item.secondary === option ? 'selected' : '';
            secondary_options_html += `<div class="option ${selected}" data-option="${option}">
            ${option}
        </div>`;
        }

        return `<div data-token="${item.token}" class="item ${item.token} ${!item.secondary ? 'unselected' : ''}">
                    <div class="current-selected">
                            ${item.secondary ? item.secondary : 
                            section_data.data?.secondary?.[table_key]?.unselectedStr}
                    </div>
                    <svg class="arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 82.1 43.2">
                            <path d="M41.1,43.2L0,2.2,2.1,0l39,39L80,0l2.1,2.2-41,41Z"/>
                        </svg>
                    <div class="options" data-item-token="${item.token}">
                        ${secondary_options_html}
                    </div>
                </div>`;
    },
    updateSecondaryPosition: function (section_el, options_el) {
        let secondary_container = section_el.querySelector('.secondary-container');
        let secondaryContainerBox = secondary_container.getBoundingClientRect();
        let item_token = options_el.getAttribute('data-item-token');
        let secondary_item = secondary_container.querySelector(`.item[data-token="${item_token}"]`)
        let item_el = section_el.querySelector(`.item.mine[data-token="${item_token}"]`);

        let secondary_el = item_el.querySelector('.secondary');
        let secondaryBox = secondary_el.getBoundingClientRect();

        let offsetTop = secondaryBox.top - secondaryContainerBox.top;
        let offsetLeft = secondaryBox.left - secondaryContainerBox.left;

        secondary_item.style.width = `${secondary_el.offsetWidth}px`;
        secondary_item.style.top = `${offsetTop}px`;
        secondary_item.style.left = `${offsetLeft}px`;
    },
    transitionSecondary: async function (secondary_el, show, on_internal) {
        let section_el = secondary_el.closest('.section');
        let secondary_container = section_el.querySelector('.secondary-container');
        let item_el = secondary_el.closest('.item');
        let current_selected_el = secondary_el.querySelector('.current-selected');
        let token = item_el.getAttribute('data-token');

        // Find all items with open secondaries in the same section
        const openSecondaryItems = section_el.querySelectorAll('.item-secondary-open');

        // Get the options element for the secondary
        let options_el = secondary_container.querySelector(`.options[data-item-token="${token}"]`);
        let options_item_el = options_el.closest('.item');

        let activeEl = befriend.me.secondaries.activeEl;

        if (secondary_el._transitionTimeout) {
            clearTimeout(secondary_el._transitionTimeout);
        }

        if (show) {
            // First set the current height of any open options before transitioning
            for(let openItem of openSecondaryItems) {
                if (openItem !== item_el && openItem !== options_item_el) {
                    const openToken = openItem.getAttribute('data-token');
                    const openOptions = secondary_container.querySelector(`.options[data-item-token="${openToken}"]`);
                    if (openOptions) {
                        // Set current height before transitioning to 0
                        openOptions.style.height = `${openOptions.scrollHeight}px`;
                        // Force reflow
                        void openOptions.offsetHeight;
                        // Now set height to 0 to trigger transition
                        openOptions.style.height = '0';

                        // Remove class from both main item and options item
                        removeClassEl('item-secondary-open', openItem);
                        const openOptionsItem = openOptions.closest('.item');
                        if (openOptionsItem) {
                            removeClassEl('item-secondary-open', openOptionsItem);
                        }
                    }
                }
            }

            // Handle active element from different section
            if (activeEl && activeEl !== secondary_el) {
                let active_section = activeEl.closest('.section');

                if (active_section !== section_el) {
                    let active_item = activeEl.closest('.item');
                    let active_options = active_section.querySelector(`.options[data-item-token="${active_item.getAttribute('data-token')}"]`);

                    removeClassEl('item-secondary-open', active_item);
                    if (active_options) {
                        const activeOptionsItem = active_options.closest('.item');
                        if (activeOptionsItem) {
                            removeClassEl('item-secondary-open', activeOptionsItem);
                        }
                        active_options.style.height = '0';
                    }

                    setTimeout(() => {
                        removeClassEl('secondary-open', active_section);
                        if (active_options) {
                            active_options.style.removeProperty('height');
                        }
                    }, befriend.variables.secondary_transition_ms);
                }
            }

            befriend.me.updateSecondaryPosition(section_el, options_el);

            // Set initial height of 0 before showing
            options_el.style.height = '0';
            // Force reflow
            void options_el.offsetHeight;

            addClassEl('secondary-open', section_el);
            // Add class to both main item and options item
            addClassEl('item-secondary-open', item_el);
            addClassEl('item-secondary-open', options_item_el);

            requestAnimationFrame(() => {
                options_item_el.style.height = `${options_el.scrollHeight + current_selected_el.scrollHeight + 2}px`;
                options_el.style.height = `${options_el.scrollHeight}px`;
            });

            befriend.me.secondaries.activeEl = secondary_el;
        } else {
            const currentHeight = options_el.scrollHeight;
            options_el.style.height = `${currentHeight}px`;
            void options_el.offsetHeight;

            options_el.style.height = '0';

            addClassEl('closing-secondary', options_item_el);
            addClassEl('closing-secondary', item_el);

            secondary_el._transitionTimeout = setTimeout(function () {
                removeClassEl('closing-secondary', options_item_el);
                removeClassEl('closing-secondary', item_el);

                removeClassEl('item-secondary-open', item_el);
                removeClassEl('item-secondary-open', options_item_el);

                if (!befriend.els.me.querySelector('.item-secondary-open')) {
                    removeClassEl('secondary-open', section_el);
                }

                options_el.style.removeProperty('height');

                if (!on_internal) {
                    if (secondary_el === activeEl) {
                        befriend.me.secondaries.activeEl = null;
                    }
                }
            }, befriend.variables.secondary_transition_ms);
        }
    },
    hideActiveSecondaryIf: function (target = null) {
        let open_secondary_el = befriend.me.secondaries.activeEl;

        if (open_secondary_el && !target?.closest('.secondary')) {
            befriend.me.transitionSecondary(open_secondary_el, false);
        }
    },
    updateSectionHeightT: {},
    updateSectionHeight: async function (el, collapse, no_transition, skip_save) {
        let section_container = el.querySelector('.section-container');
        let section_key = el.getAttribute('data-key');

        if (no_transition) {
            section_container.style.transition = 'none';
            await rafAwait();
        }

        clearTimeout(befriend.me.updateSectionHeightT[section_key]);
        section_container.style.removeProperty('overflow-y');

        if (collapse) {
            addClassEl('collapsed', el);
            section_container.style.height = 0;
        } else {
            removeClassEl('collapsed', el);
            setElHeightDynamic(section_container);

            befriend.me.updateSectionHeightT[section_key] = setTimeout(function () {
                section_container.style.overflowY = 'initial';
            }, befriend.variables.me_section_transition_ms);
        }

        if (!skip_save) {
            befriend.me.data.sections.collapsed[section_key] = collapse;

            befriend.user.setLocal('me.sections.collapsed', befriend.me.data.sections.collapsed);
        }

        await rafAwait();

        if (no_transition) {
            setTimeout(function () {
                section_container.style.removeProperty('transition');
            }, befriend.variables.me_section_transition_ms);
        } else {
            section_container.style.removeProperty('transition');
        }
    },
    isConfirmActionShown: function () {
        return elHasClass(document.documentElement, befriend.classes.confirmMeAction);
    },
    toggleAutoComplete: function (el, show) {
        if (!el) {
            el = befriend.els.me.querySelector(
                `.search-container.${befriend.classes.autoCompleteMe}`,
            );
        }

        if (!el) {
            return;
        }

        let section_el = el.closest('.section');

        if (show) {
            addClassEl(befriend.classes.autoCompleteMe, section_el);
            addClassEl(befriend.classes.autoCompleteMe, el);
            addClassEl('autocomplete-shown', befriend.els.me);
        } else {
            removeClassEl(befriend.classes.autoCompleteMe, section_el);
            removeClassEl(befriend.classes.autoCompleteMe, el);
            removeClassEl('autocomplete-shown', befriend.els.me);
        }
    },
    toggleAutoCompleteSelect: function (el, show) {
        if (!el) {
            el = befriend.els.me.querySelector('.search-container .select-container.open');
        }

        let section_el = el.closest('.section');

        let section_key = section_el.getAttribute('data-key');

        if (show) {
            let input = el.querySelector('.select-input');
            input.value = '';
            input.focus();
            befriend.me.updateAutoCompleteSelectList(section_key);

            //show el
            addClassEl('open', el);

            section_el.style.zIndex = 100;
        } else {
            removeClassEl('open', el);

            section_el.style.removeProperty('z-index');
        }
    },
    updateAutoCompleteSelectList(section_key) {
        function filterSort(items, search) {
            if (!search) {
                //show selected country at top of list
                let selectedItem = befriend.me.autoComplete.selected.filterList[section_key]?.item;

                if (selectedItem) {
                    let updated_items = [selectedItem];

                    for (let item of items) {
                        if (item.id !== selectedItem.id) {
                            updated_items.push(item);
                        }
                    }

                    return updated_items;
                } else {
                    return items;
                }
            }

            search = search.toLowerCase();

            const startsWithMatch = [];
            const wordStartsWithMatch = [];
            const includesMatch = [];

            for (let item of items) {
                let nameLower = item.name.toLowerCase();
                let words = nameLower.split(' ');

                if (nameLower.startsWith(search)) {
                    startsWithMatch.push(item);
                } else if (words.slice(1).some((word) => word.startsWith(search))) {
                    wordStartsWithMatch.push(item);
                } else if (nameLower.includes(search)) {
                    includesMatch.push(item);
                }
            }

            // Combine all matches in priority order
            return startsWithMatch.concat(wordStartsWithMatch).concat(includesMatch);
        }

        let section_el = befriend.me.getSectionElByKey(section_key);

        let select_input = section_el.querySelector('.select-input');

        let search_value = select_input.value;

        let select_list = section_el.querySelector('.select-list');

        let section_data = befriend.me.getActiveSection(section_key);

        if (!section_data?.data?.autoComplete?.filter?.list) {
            return;
        }

        let list_items = section_data.data.autoComplete.filter.list;

        let filtered_items = filterSort(list_items, search_value);

        let select_container_el = section_el.querySelector('.select-container');

        if (!filtered_items.length) {
            addClassEl('no-items', select_container_el);
            select_list.innerHTML = '';
        } else {
            removeClassEl('no-items', select_container_el);

            let list_html = '';

            for (let item of filtered_items) {
                let emoji = '';

                if (item.emoji) {
                    emoji = `<div class="emoji">${item.emoji}</div>`;
                }

                list_html += `<div class="item" data-id="${item.id}">
                            ${emoji}
                            <div class="name">${item.name}</div>
                        </div>`;
            }

            select_list.innerHTML = list_html;

            befriend.me.events.autoCompleteFilterList();
        }
    },
    toggleConfirm: function (show) {
        if (show) {
            addClassEl(befriend.classes.confirmMeAction, document.documentElement);
        } else {
            removeClassEl(befriend.classes.confirmMeAction, document.documentElement);
        }
    },
    sectionItemHtml: function (section_key, table_key, item) {
        let section_data = befriend.me.getActiveSection(section_key);
        let table_data = section_data.data.tables?.find((item) => item.name === table_key);
        let section_type = section_data.data?.type?.name;

        if (['buttons'].includes(section_type)) {
            return befriend.me.sectionItemOptionHtml(section_key, table_key, item);
        }

        let favorite_html = '';
        let secondary_html = '';

        let secondary_options = section_data.data?.secondary?.[table_key]?.options;

        let isFavorable = table_data?.isFavorable;

        //favorable
        if (isFavorable) {
            favorite_html = `<div class="favorite heart">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 439.9961">
                                  <path class="outline" d="M240,422.9023c-29.3828-16.2148-224-129.4961-224-282.9023,0-66.0547,54.1992-124,116-124,41.8672.0742,80.4609,22.6602,101.0312,59.1289,1.5391,2.3516,4.1602,3.7656,6.9688,3.7656s5.4297-1.4141,6.9688-3.7656c20.5703-36.4688,59.1641-59.0547,101.0312-59.1289,61.8008,0,116,57.9453,116,124,0,153.4062-194.6172,266.6875-224,282.9023Z"/>
                                </svg>
                            </div>`;
        }

        // Secondary UI in the item itself
        if (secondary_options) {
                let unselected = !item.secondary ? 'unselected' : '';

                secondary_html = `<div class="secondary ${unselected}" 
                                      data-section="${section_key}"
                                      data-item-token="${item.token}">
                                    <div class="current-selected">
                                        ${item.secondary ? item.secondary : section_data.data?.secondary?.[table_key]?.unselectedStr}
                                    </div>
                                    <svg class="arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 82.1 43.2">
                                        <path d="M41.1,43.2L0,2.2,2.1,0l39,39L80,0l2.1,2.2-41,41Z"/>
                                    </svg>
                                </div>`;
        }

            return `<div class="item mine ${isFavorable ? 'favorable' : ''} ${item.is_favorite ? 'is-favorite' : ''} ${secondary_html ? 'has-secondary' : ''}" 
                                 data-token="${item.token}" 
                                 data-table-key="${item.table_key || ''}">
                        <div class="content">
                            <div class="rank">${isNumeric(item.favorite_position) ? item.favorite_position : ''}</div>
                            <div class="name-favorite">
                                ${favorite_html}
                                <div class="name">${item.name}</div>
                            </div>
                            ${secondary_html}
                            <div class="remove">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 121.805 14.619">
                                    <path d="M7.308,14.619h107.188c4.037,0,7.309-3.272,7.309-7.31s-3.271-7.309-7.309-7.309H7.308C3.272.001,0,3.273,0,7.31s3.272,7.309,7.308,7.309Z"/>
                                </svg>
                            </div>
                        </div>
                    </div>`;
    },
    sectionItemOptionHtml: function (section_key, table_key, item) {
        if(typeof item.is_visible !== 'undefined' && !item.is_visible) {
            return '';
        }

        let section_data = befriend.me.getActiveSection(section_key);
        let section_type = section_data.data?.type;

        if (section_type?.name === 'buttons') {
            let is_selected = false;

            //select previously selected options
            if (section_type.name === 'buttons' && section_data.items) {
                is_selected = Object.values(section_data.items).some(
                    (selected_item) => selected_item.token === item.token,
                );
            }

            return `<div class="item button-option ${is_selected ? 'selected' : ''}" 
                     data-token="${item.token}" 
                     data-table-key="${table_key}">
                    <div class="content">
                        <div class="name">${item.name}</div>
                    </div>
                </div>`;
        }
    },
    updateSectionItems: function (section_el, filter_params = {}) {
        return new Promise(async (resolve, reject) => {
            try {
                let section_key = section_el.getAttribute('data-key');
                let section_data = befriend.me.getActiveSection(section_key);
                let table_key = befriend.me.getSectionTableKey(section_key);
                let items_html = '';
                let secondaryItems = '';

                // Extract filter parameters
                const {
                    category = '',
                    category_token = null,
                    category_table_key = '',
                    tab_key = null,
                } = filter_params;

                // Update table key if provided
                if (category_table_key) {
                    section_el.setAttribute('data-table-key', category_table_key);
                }

                // Get container to handle scroll
                let container_el = section_el.querySelector('.items-container');

                // Cancel any ongoing smooth scroll
                if (container_el) {
                    container_el.style.scrollBehavior = 'auto';
                    container_el.style.overflowY = 'hidden';
                }

                let resetScroll = false;

                // Handle "my items" view
                if (category === 'mine' || !category) {
                    addClassEl('my-items', section_el);

                    let items_filtered = [];

                    for (let token in section_data.items) {
                        let item = section_data.items[token];

                        // Filter by tab if exists
                        if (tab_key && item.table_key && item.table_key !== tab_key) {
                            continue;
                        }

                        items_filtered.push(item);
                    }

                    if (items_filtered.length) {
                        // Sort favorite items first by position, then default
                        items_filtered.sort((a, b) => {
                            if (a.is_favorite && !b.is_favorite) return -1;
                            if (!a.is_favorite && b.is_favorite) return 1;
                            if (a.is_favorite && b.is_favorite) {
                                return (a.favorite_position || 0) - (b.favorite_position || 0);
                            }

                            return 0;
                        });

                        for (let item of items_filtered) {
                            items_html += befriend.me.sectionItemHtml(
                                section_key,
                                item.table_key || table_key,
                                item,
                            );
                        }

                        removeClassEl('no-items', section_el);
                    } else {
                        addClassEl('no-items', section_el);
                    }

                    // Generate secondary items HTML
                    const secondary_container = section_el.querySelector('.secondary-container');
                    if (secondary_container && section_data.data?.secondary?.[table_key]?.options) {
                        for (let token in section_data.items) {
                            let item = section_data.items[token];
                            // Filter by tab if needed
                            if (tab_key && item.table_key && item.table_key !== tab_key) {
                                continue;
                            }
                            secondaryItems += befriend.me.generateSecondaryOptionsHtml(section_data, table_key, item);
                        }
                    }
                } else {
                    removeClassEl('my-items', section_el);
                    removeClassEl('no-items', section_el);

                    // Handle category-based options
                    if (category_token) {
                        //1. find cached options
                        //2. find from section data
                        //3. dynamic endpoint data

                        let category_options = befriend.me.data.categories[category_token];

                        if (!category_options) {
                            category_options = befriend.me.getSectionCategoryItemOptions(
                                section_key,
                                category_token,
                            );
                        }

                        try {
                            if (!category_options) {
                                befriend.toggleSpinner(true);

                                category_options = await befriend.me.getCategoryOptions(
                                    section_data.data.categories.endpoint,
                                    category_token,
                                );

                                befriend.toggleSpinner(false);

                                befriend.me.data.categories[category_token] = category_options;

                                resetScroll = true;
                            }

                            for (let item of category_options.items) {
                                if (!(item.token in section_data.items)) {
                                    let label = '';
                                    let meta = '';

                                    if (item.label) {
                                        label = `<div class="label">${item.label}</div>`;
                                    }

                                    if (item.meta) {
                                        meta = `<div class="meta">${item.meta}</div>`;
                                    }

                                    items_html += `<div class="item" data-token="${item.token}">
                                                <div class="name-label">
                                                    <div class="name">${item.name}</div>
                                                    ${label}
                                                </div>
                                                
                                                ${meta}
                                            </div>`;
                                }
                            }
                        } catch (e) {
                            console.error('Error fetching category options:', e);
                        }
                    } else {
                        // Filter options by category
                        for (let item of section_data.data.options) {
                            if (
                                item.category?.toLowerCase() === category.toLowerCase() &&
                                !(item.token in section_data.items)
                            ) {
                                items_html += `<div class="item" data-token="${item.token}">
                                                ${item.name}
                                            </div>`;
                            }
                        }
                    }
                }

                // Update DOM
                let section_items_el = section_el.querySelector('.items');
                section_items_el.innerHTML = items_html;

                // Update secondary container
                const secondary_container = section_el.querySelector('.secondary-container');
                if (secondary_container) {
                    secondary_container.innerHTML = secondaryItems;
                }

                //update row-cols class
                let rowColCls = befriend.me.getRowColsClass(section_data, category);

                //remove previous cls
                for (let i = 0; i < section_items_el.classList.length; i++) {
                    let cls = section_items_el.classList[i];

                    if (cls.startsWith('col')) {
                        removeClassEl(cls, section_items_el);
                    }
                }

                addClassEl(rowColCls, section_items_el);

                // Reattach event handlers
                befriend.me.events.onSelectItem();
                befriend.me.events.onSelectOptionItem();
                befriend.me.events.onRemoveItem();
                befriend.me.events.onFavorite();
                befriend.me.events.onOpenSecondary();
                befriend.me.events.onSelectSecondary();

                // Update UI height
                befriend.me.updateSectionHeight(section_el, elHasClass(section_el, 'collapsed'));

                //reset scroll to top
                if (resetScroll) {
                    container_el.scrollTop = 0;
                }

                //reset scroll properties
                requestAnimationFrame(() => {
                    container_el.style.removeProperty('scroll-behavior');
                    container_el.style.removeProperty('overflow-y');
                });

                resolve();
            } catch (e) {
                console.error('Error updating section items:', e);
                reject(e);
            } finally {
                // befriend.toggleSpinner(false);
            }
        });
    },
    getFavoriteHighestPosition: function (section_key, table_key) {
        let section_data = this.getActiveSection(section_key);
        let highest = 0;

        if (!section_data?.items) {
            return highest;
        }

        for (let token in section_data.items) {
            let item = section_data.items[token];

            if (item.table_key === table_key && item.is_favorite && item.favorite_position) {
                highest = Math.max(highest, item.favorite_position);
            }
        }

        return highest;
    },
    reorderFavoritePositions: function (section_key, table_key) {
        let section_data = this.getActiveSection(section_key);
        let reorderedItems = [];
        let positions = {};

        // Get all favorited items for this table
        for (let token in section_data.items) {
            let item = section_data.items[token];

            if (item.table_key === table_key && item.is_favorite) {
                reorderedItems.push(item);
            }
        }

        // Sort by current positions
        reorderedItems.sort((a, b) => a.favorite_position - b.favorite_position);

        // Reassign positions sequentially
        for (let index = 0; index < reorderedItems.length; index++) {
            let item = reorderedItems[index];
            let newPosition = index + 1;

            if (item.favorite_position !== newPosition) {
                item.favorite_position = newPosition;
                positions[item.token] = {
                    id: item.id,
                    token: item.token,
                    favorite_position: newPosition,
                };
            }
        }

        return positions;
    },
    getInitialPositions: (item_els) => {
        let positions = {};
        for (let item of Array.from(item_els)) {
            let rect = item.getBoundingClientRect();
            positions[item.getAttribute('data-token')] = {
                top: rect.top,
                height: rect.height,
                left: rect.left,
                width: rect.width,
            };
        }
        return positions;
    },
    sortItemsByFavorite: (itemsArray, active_section) => {
        return itemsArray.sort((a, b) => {
            let aItem = active_section.items[a.getAttribute('data-token')];
            let bItem = active_section.items[b.getAttribute('data-token')];

            if (aItem.is_favorite && !bItem.is_favorite) return -1;
            if (!aItem.is_favorite && bItem.is_favorite) return 1;
            if (aItem.is_favorite && bItem.is_favorite) {
                return (aItem.favorite_position || 0) - (bItem.favorite_position || 0);
            }
            return 0;
        });
    },
    updateRankDisplays: (section_el, item_el, item, updatedPositions) => {
        // Update current item rank
        let rank_el = item_el.querySelector('.rank');
        rank_el.innerHTML = item.favorite_position || '';

        // Update other ranks if positions were reordered
        if (updatedPositions && Object.keys(updatedPositions).length) {
            for (let token in updatedPositions) {
                let item_el = section_el.querySelector(`.item[data-token="${token}"]`);
                if (item_el) {
                    item_el.querySelector('.rank').innerHTML =
                        updatedPositions[token].favorite_position;
                }
            }
        }
    },
    calculateTargetPosition: (item_el, items_el, oldPositions, newOrder) => {
        // Find item's position in new order
        const itemToken = item_el.getAttribute('data-token');
        const itemIndex = newOrder.findIndex((el) => el.getAttribute('data-token') === itemToken);

        const scrollContainer = items_el.closest('.items-container');

        // Get container dimensions
        const containerRect = scrollContainer.getBoundingClientRect();
        const containerScrollTop = scrollContainer.scrollTop;

        // Calculate new position based on grid layout
        const itemHeight = oldPositions[itemToken].height;
        const gridGap = befriend.variables.me_items_gap_tb;
        const targetTop = itemIndex * (itemHeight + gridGap);

        // Determine if scroll is needed
        const containerVisibleHeight = containerRect.height;
        const scrollNeeded =
            targetTop < containerScrollTop ||
            targetTop + itemHeight > containerScrollTop + containerVisibleHeight;

        if (scrollNeeded) {
            return {
                element: scrollContainer,
                scrollTop: targetTop - (containerVisibleHeight - itemHeight) / 2,
            };
        }

        return null;
    },
    animateItemTransitions: (itemsArray, items_el, initialPositions, favorited_item_el) => {
        // Remove transition temporarily
        itemsArray.forEach((item) => {
            item.style.transition = 'none';
        });

        // Calculate target scroll position before reordering
        let scrollTarget = null;
        if (favorited_item_el) {
            scrollTarget = befriend.me.calculateTargetPosition(
                favorited_item_el,
                items_el,
                initialPositions,
                itemsArray,
            );
        }

        // Reposition items in DOM
        itemsArray.forEach((item) => {
            items_el.appendChild(item);
        });

        // Force reflow to ensure transitions will work
        void items_el.offsetHeight;

        // Apply transitions from old positions to new positions
        requestAnimationFrame(() => {
            itemsArray.forEach((item) => {
                const token = item.getAttribute('data-token');
                const oldPos = initialPositions[token];
                const newPos = item.getBoundingClientRect();

                if (oldPos && (oldPos.top !== newPos.top || oldPos.left !== newPos.left)) {
                    const deltaY = oldPos.top - newPos.top;
                    const deltaX = oldPos.left - newPos.left;

                    // Apply the initial offset
                    item.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

                    requestAnimationFrame(() => {
                        // Enable transitions
                        item.style.transition = 'transform 300ms ease-out';
                        // Move to final position
                        item.style.transform = '';
                    });
                }
            });

            // make sure favorited item is visible
            if (scrollTarget) {
                scrollTarget.element.scrollTo({
                    top: scrollTarget.scrollTop,
                    behavior: 'smooth',
                });
            }
        });

        // Clean up transitions after animation
        setTimeout(() => {
            itemsArray.forEach((item) => {
                item.style.transition = '';
                item.style.transform = '';
            });
        }, 300);
    },
    account: {
        view: 'profile', // 'profile' or 'account'

        initEvents: function () {
            let profileViewEl = befriend.els.me.querySelector('.view-profile');
            let accountViewEl = befriend.els.me.querySelector('.view-account');
            let accountBtn = befriend.els.me.querySelector('.account-btn');
            let profileBtn = befriend.els.me.querySelector('.profile-btn');

            accountBtn.addEventListener('click', function (e) {
                befriend.me.account.setView('account');
            });

            profileBtn.addEventListener('click', function (e) {
                befriend.me.account.setView('profile');
            });
        },
        setView: function (view) {
            this.view = view;

            let views = befriend.els.me.querySelectorAll('.view-section');

            for (let viewEl of views) {
                if (elHasClass(viewEl, `view-${view}`)) {
                    addClassEl('active', viewEl);
                } else {
                    removeClassEl('active', viewEl);
                }
            }
        },

        handleAction: async function (action) {
            switch (action) {
                case 'change-email':
                    // Show email change modal/form
                    break;

                case 'change-password':
                    // Show password change modal/form
                    break;

                case 'change-country':
                    // Show country selection modal
                    break;

                case 'delete-account':
                    if (
                        confirm(
                            'Are you sure you want to delete your account? This cannot be undone.',
                        )
                    ) {
                        try {
                            await befriend.auth.delete('/me');
                            // Handle successful deletion (logout, redirect, etc)
                        } catch (e) {
                            console.error('Error deleting account:', e);
                        }
                    }
                    break;
            }
        },
    },
    events: {
        sectionReorder: {
            ip: false,
            start: {
                x: null,
                y: null,
            },
            el: null,
            itemsGap: 0,
            prevRect: null,
            sections: [],
            dragStarted: false,
            autoScroll: {
                animationFrame: null,
                scrolling: false,
                startPosition: null,
                targetPosition: null,
                startTime: null,
                duration: 250, // ms for scroll animation
            },
            isItemAbove: function (item) {
                return item.hasAttribute('data-is-above');
            },
            isItemToggled: function (item) {
                return item.hasAttribute('data-is-toggled');
            },
            getIdleSections: function (sectionsContainer) {
                let allSections = Array.from(sectionsContainer.querySelectorAll(`.section`));
                return allSections.filter((el) => !elHasClass(el, 'is-draggable'));
            },
            setSectionsGap: function (idleSections) {
                if (idleSections.length < 1) {
                    this.itemsGap = 0;
                    return;
                }

                this.itemsGap = befriend.variables.me_sections_gap_h;
            },
            initReorderSection: function (section) {
                addClassEl('is-draggable', section);
            },
            initSectionsState: function (reorderEl, idleSections) {
                const reorderRect = reorderEl.getBoundingClientRect();
                const reorderTop = reorderRect.top;

                for (let section of idleSections) {
                    const sectionRect = section.getBoundingClientRect();
                    if (sectionRect.top < reorderTop) {
                        section.dataset.isAbove = '';
                    }
                }
            },
            updateIdleSectionsStateAndPosition: function (reorderEl, sectionY) {
                const reorderElRect = reorderEl.getBoundingClientRect();
                const reorderElTop = reorderElRect.top;
                const reorderElBottom = reorderElRect.bottom;

                // Get idle sections and update their states based on position
                const idleSections = this.getIdleSections(reorderEl.parentElement);
                const draggingUp = sectionY < this.start.y;

                for (let section of idleSections) {
                    const sectionRect = section.getBoundingClientRect();
                    const sectionTop = sectionRect.top;
                    const topEl = section.querySelector('.section-top');
                    const topElBottom = topEl.getBoundingClientRect().bottom;

                    if (draggingUp) {
                        if (this.isItemAbove(section)) {
                            // Section is above the dragged section
                            if (reorderElTop <= sectionTop) {
                                section.dataset.isToggled = '';
                            } else {
                                delete section.dataset.isToggled;
                            }
                        } else {
                            // Section is below the dragged section
                            if (reorderElTop >= sectionTop) {
                                section.dataset.isToggled = '';
                            } else {
                                delete section.dataset.isToggled;
                            }
                        }
                    } else {
                        //dragging down
                        if (this.isItemAbove(section)) {
                            delete section.dataset.isToggled;
                        } else {
                            // dragged section is below bottom of top bar
                            if (reorderElBottom > topElBottom) {
                                section.dataset.isToggled = '';
                            } else {
                                delete section.dataset.isToggled;
                            }
                        }
                    }
                }

                // Update positions
                for (let section of idleSections) {
                    if (this.isItemToggled(section)) {
                        const direction = this.isItemAbove(section) ? 1 : -1;
                        const transformY = direction * (reorderElRect.height + this.itemsGap);
                        section.style.transform = `translateY(${transformY}px)`;
                    } else {
                        section.style.transform = '';
                    }
                }
            },
            applyNewSectionOrder: async function (reorderEl) {
                const sectionsContainer = reorderEl.parentElement;
                const allSections = Array.from(sectionsContainer.children);

                // Get current positions of all sections
                const sectionPositions = new Map();

                for (let section of allSections) {
                    const rect = section.getBoundingClientRect();
                    sectionPositions.set(section, rect.top);
                }

                // Sort sections by their vertical position
                const sortedSections = Array.from(sectionPositions.entries())
                    .sort((a, b) => a[1] - b[1])
                    .map((entry) => entry[0]);

                // Clean up temporary attributes
                for (let section of this.getIdleSections(sectionsContainer)) {
                    delete section.dataset.isAbove;
                    delete section.dataset.isToggled;
                    section.style.transition = 'none';
                    section.style.transform = '';

                    requestAnimationFrame(() => {
                        section.style.removeProperty('transition');
                    });
                }

                // Animate transition
                const reorderTransform = reorderEl.style.transform;
                const transformValues = reorderTransform
                    .replace('translate(', '')
                    .replace(')', '')
                    .split(',');
                const prevTransform = {
                    x: parseInt(transformValues[0]),
                    y: parseInt(transformValues[1]),
                };

                const reorderedBoxBefore = reorderEl.getBoundingClientRect();

                // Reorder in DOM based on vertical positions
                for (let section of sortedSections) {
                    sectionsContainer.appendChild(section);
                }

                const reorderedBoxAfter = reorderEl.getBoundingClientRect();

                // Remove animation temporarily
                reorderEl.style.transition = 'none';
                await rafAwait();

                // Update final position
                const xDiff = reorderedBoxBefore.left - reorderedBoxAfter.left;
                const yDiff = reorderedBoxBefore.top - reorderedBoxAfter.top;
                const tX = prevTransform.x + xDiff;
                const tY = prevTransform.y + yDiff;
                reorderEl.style.transform = `translate(${tX}px, ${tY}px)`;

                await rafAwait();
                reorderEl.style.removeProperty('transition');

                // Update positions in data and server
                this.updateSectionPositions(sortedSections);

                requestAnimationFrame(() => {
                    removeClassEl('is-draggable', reorderEl);
                    reorderEl.style.transform = '';
                });
            },
            updateSectionPositions: async function (sections) {
                let positions = {};
                let updates = {};

                // Get section keys and build position updates
                for (let i = 0; i < sections.length; i++) {
                    let section = sections[i];
                    let key = section.getAttribute('data-key');

                    if (befriend.me.data.sections.active[key]) {
                        positions[key] = i;
                        updates[key] = {
                            key: key,
                            position: i,
                        };
                    }
                }

                // Update local data
                for (let key in positions) {
                    if (befriend.me.data.sections.active[key]) {
                        befriend.me.data.sections.active[key].position = positions[key];
                    }
                }

                // Update server
                if (Object.keys(updates).length) {
                    try {
                        await befriend.auth.put('/me/sections/positions', {
                            positions: updates,
                        });
                    } catch (e) {
                        console.error('Error updating section positions:', e);
                    }
                }
            },
        },
        itemReorder: {
            ip: false,
            start: {
                x: null,
                y: null,
            },
            el: null,
            itemsGap: 0,
            prevRect: null,
            items: [],
            autoScroll: {
                animationFrame: null,
                scrolling: false,
                startPosition: null,
                targetPosition: null,
                startTime: null,
                duration: 250, // ms for scroll animation
            },
            dragStarted: false,
            isItemAbove: function (item) {
                return item.hasAttribute('data-is-above');
            },
            isItemToggled: function (item) {
                return item.hasAttribute('data-is-toggled');
            },
            getIdleItems: function (itemsContainer) {
                let allItems = Array.from(itemsContainer.querySelectorAll('.item.is-favorite'));

                return allItems.filter((el) => !elHasClass(el, 'is-draggable'));
            },
            setItemsGap: function (idleItems) {
                if (idleItems.length <= 1) {
                    this.itemsGap = 0;
                    return;
                }

                this.itemsGap = befriend.variables.me_items_gap_tb;
            },
            initReorderItem: function (item) {
                addClassEl('is-draggable', item);
            },
            initItemsState: function (reorderEl, idleItems) {
                for (let i = 0; i < idleItems.length; i++) {
                    let item = idleItems[i];

                    if (Array.from(reorderEl.parentElement.children).indexOf(reorderEl) > i) {
                        item.dataset.isAbove = '';
                    }
                }
            },
            updateIdleItemsStateAndPosition: function (reorderEl) {
                const reorderElRect = reorderEl.getBoundingClientRect();
                const reorderElY = reorderElRect.top + reorderElRect.height / 2;

                // Update state
                for (let item of this.getIdleItems(reorderEl.parentElement)) {
                    const itemRect = item.getBoundingClientRect();
                    const itemY = itemRect.top + itemRect.height / 2;
                    if (this.isItemAbove(item)) {
                        if (reorderElY <= itemY) {
                            item.dataset.isToggled = '';
                        } else {
                            delete item.dataset.isToggled;
                        }
                    } else {
                        if (reorderElY >= itemY) {
                            item.dataset.isToggled = '';
                        } else {
                            delete item.dataset.isToggled;
                        }
                    }
                }

                // Update position
                for (let item of this.getIdleItems(reorderEl.parentElement)) {
                    if (this.isItemToggled(item)) {
                        const direction = this.isItemAbove(item) ? 1 : -1;
                        item.style.transform = `translateY(${
                            direction * (reorderElRect.height + this.itemsGap)
                        }px)`;
                    } else {
                        item.style.transform = '';
                    }
                }
            },
            applyNewItemOrder: async function (reorderEl, section_el, section_key) {
                const reorderedItems = [];
                const itemsContainer = reorderEl.parentElement;
                const allItems = Array.from(itemsContainer.children);

                let prevIndex = allItems.indexOf(reorderEl);
                let skipUpdate = false;

                for (let i = 0; i < allItems.length; i++) {
                    let item = allItems[i];

                    if (item === reorderEl) {
                        continue;
                    }

                    if (!this.isItemToggled(item)) {
                        reorderedItems[i] = item;
                        continue;
                    }

                    const newIndex = this.isItemAbove(item) ? i + 1 : i - 1;
                    reorderedItems[newIndex] = item;
                }

                // Fill in the dragged item
                for (let index = 0; index < allItems.length; index++) {
                    if (typeof reorderedItems[index] === 'undefined') {
                        if (prevIndex === index) {
                            skipUpdate = true;
                            break;
                        }
                        reorderedItems[index] = reorderEl;
                    }
                }

                // Clean up temporary attributes
                for (let item of this.getIdleItems(itemsContainer)) {
                    delete item.dataset.isAbove;
                    delete item.dataset.isToggled;
                    item.style.transition = 'none';
                    item.style.transform = '';

                    requestAnimationFrame(() => {
                        item.style.removeProperty('transition');
                    });
                }

                if (skipUpdate) {
                    return requestAnimationFrame(() => {
                        removeClassEl('is-draggable', reorderEl);
                        reorderEl.style.transform = '';
                    });
                }

                // Update DOM and positions
                const reorderTransform = reorderEl.style.transform;
                const transformValues = reorderTransform
                    .replace('translate(', '')
                    .replace(')', '')
                    .split(',');
                const prevTransform = {
                    x: parseInt(transformValues[0]),
                    y: parseInt(transformValues[1]),
                };

                const reorderedBoxBefore = reorderEl.getBoundingClientRect();

                // Reorder items in DOM
                for (let item of reorderedItems) {
                    itemsContainer.appendChild(item);
                }

                const reorderedBoxAfter = reorderEl.getBoundingClientRect();

                //remove animation
                reorderEl.style.transition = 'none';

                await rafAwait();

                // Update final position
                const xDiff = reorderedBoxBefore.left - reorderedBoxAfter.left;
                const yDiff = reorderedBoxBefore.top - reorderedBoxAfter.top;
                const tX = prevTransform.x + xDiff;
                const tY = prevTransform.y + yDiff;
                reorderEl.style.transform = `translate(${tX}px, ${tY}px)`;

                await rafAwait();

                reorderEl.style.removeProperty('transition');

                // Update positions in data model
                this.updateFavoritePositions(section_key, section_el);

                requestAnimationFrame(() => {
                    addClassEl('is-drag-ending', reorderEl);
                    removeClassEl('is-draggable', reorderEl);
                    reorderEl.style.transform = '';
                    setTimeout(function () {
                        removeClassEl('is-drag-ending', reorderEl);
                    }, 1000);
                });
            },
            updateFavoritePositions: async function (section_key, section_el) {
                const active_section = befriend.me.getActiveSection(section_key);
                const items_el = section_el.querySelector('.items');
                const item_els = items_el.querySelectorAll('.item.is-favorite');
                let positions = {};

                for (let i = 0; i < item_els.length; i++) {
                    let item_el = item_els[i];

                    const token = item_el.getAttribute('data-token');
                    const item = active_section.items[token];
                    const newPosition = i + 1;

                    if (item.favorite_position !== newPosition) {
                        item.favorite_position = newPosition;
                        positions[token] = {
                            id: item.id,
                            token: token,
                            favorite_position: newPosition,
                        };
                    }

                    const rank_el = item_el.querySelector('.rank');

                    if (rank_el) {
                        rank_el.innerHTML = newPosition;
                    }
                }

                if (Object.keys(positions).length) {
                    try {
                        await befriend.auth.put(`/me/sections/item`, {
                            section_key: section_key,
                            table_key: section_el.getAttribute('data-table-key'),
                            section_item_id: Object.values(positions)[0].id,
                            favorite: {
                                reorder: positions,
                            },
                        });
                    } catch (e) {
                        console.error('Error updating favorite positions:', e);
                    }
                }
            },
        },
        init: function () {
            return new Promise(async (resolve, reject) => {
                befriend.me.events.onModeSelect();
                befriend.me.events.onAddSectionBtn();
                befriend.me.events.onSelectAvailableSection();
                befriend.me.events.confirmAction();

                befriend.me.account.initEvents();

                resolve();
            });
        },
        onPartnerGenderSelect: function () {
            let option_els = befriend.els.me.querySelectorAll(
                '.selected-mode-container .partner .option',
            );

            for (let i = 0; i < option_els.length; i++) {
                let el = option_els[i];

                if (el._listener) {
                    continue;
                }

                el._listener = true;

                el.addEventListener('click', async function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    let token = this.getAttribute('data-gender');

                    if (elHasClass(el, 'selected')) {
                        removeClassEl('selected', el);
                    } else {
                        removeElsClass(option_els, 'selected');
                        addClassEl('selected', el);
                    }

                    await befriend.auth.put(`/me/mode/partner`, {
                        gender: token,
                        isSelect: elHasClass(el, 'selected'),
                    });
                });
            }
        },
        onKids: function () {
            let add_btn = befriend.els.me.querySelector('.selected-mode-container .kids .add-btn');

            if (!add_btn._listener) {
                add_btn._listener = true;

                add_btn.addEventListener('click', async function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    try {
                        befriend.toggleSpinner(true);
                        // Add kid on server
                        let r = await befriend.auth.post('/me/mode/kids');

                        befriend.me.data.modes.data.kids[r.data.token] = r.data;

                        // Add to UI with token from response
                        befriend.me.addKidHtml(r.data);

                        befriend.toggleSpinner(false);
                    } catch (e) {
                        console.error('Error adding kid:', e);
                    }
                });
            }

            befriend.me.events.onKidsAgeSelect();
            befriend.me.events.onKidsGenderSelect();
            befriend.me.events.onKidsActive();
            befriend.me.events.onKidsRemove();
        },
        onKidsActive: function () {
            let active_btns = befriend.els.me.querySelectorAll('.kids .kid .kid-active');

            for (let btn of active_btns) {
                if (btn._listener) continue;
                btn._listener = true;

                btn.addEventListener('click', async function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    let kid_el = this.closest('.kid');
                    let token = kid_el.getAttribute('data-token');

                    let toggle_el = btn.querySelector('.toggle');

                    let is_active = !elHasClass(toggle_el, 'active');

                    toggleElClass(toggle_el, 'active');

                    try {
                        await befriend.auth.put('/me/mode/kids', {
                            kid_token: token,
                            is_active,
                        });

                        befriend.me.data.modes.data.kids[token].is_active = is_active;
                    } catch (e) {
                        console.error('Error removing kid:', e);
                    }
                });
            }
        },
        onKidsRemove: function () {
            let remove_btns = befriend.els.me.querySelectorAll('.kids .kid .remove');

            for (let btn of remove_btns) {
                if (btn._listener) continue;
                btn._listener = true;

                btn.addEventListener('click', async function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    let kid_el = this.closest('.kid');
                    let token = kid_el.getAttribute('data-token');

                    befriend.toggleSpinner(true);

                    try {
                        await befriend.auth.delete('/me/mode/kids', {
                            kid_token: token,
                        });

                        if (befriend.me.data.modes.data.kids) {
                            delete befriend.me.data.modes.data.kids[token];
                        }

                        kid_el.parentNode.removeChild(kid_el);

                        requestAnimationFrame(() => {
                            befriend.me.updateModeHeight();
                        });
                    } catch (e) {
                        console.error('Error removing kid:', e);
                    }

                    befriend.toggleSpinner(false);
                });
            }
        },
        onKidsAgeSelect: function () {
            let list_els = befriend.els.me.querySelectorAll('.kids .kid .select-list');

            for (let i = 0; i < list_els.length; i++) {
                let list_el = list_els[i];

                if (list_el._listener) continue;
                list_el._listener = true;

                list_el.querySelector('.current-selected').addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    // Close any other open options
                    let other_list_els =
                        befriend.els.me.querySelectorAll('.kids .kid .select-list');

                    for (let other of Array.from(other_list_els)) {
                        if (other !== list_el) {
                            other.querySelector('.options').style.height = '0';
                            removeClassEl('open', other);
                        }
                    }

                    befriend.me.transitionKidsAge(list_el, !elHasClass(list_el, 'open'));
                });

                // Handle option selection
                let options = list_el.getElementsByClassName('option');
                for (let j = 0; j < options.length; j++) {
                    let option = options[j];

                    if (option._listener) continue;
                    option._listener = true;

                    option.addEventListener('click', async function (e) {
                        e.preventDefault();
                        e.stopPropagation();

                        let token = this.getAttribute('data-token');
                        let selected_text = this.textContent;
                        let kid_el = this.closest('.kid');
                        let kid_token = kid_el.getAttribute('data-token');

                        // Update UI
                        removeClassEl('unselected', list_el);
                        list_el.querySelector('.current-selected').textContent = selected_text;
                        list_el.setAttribute('data-value', token);

                        // Close options
                        befriend.me.transitionKidsAge(list_el, false);

                        // Remove previous selection if any
                        removeElsClass(options, 'selected');
                        addClassEl('selected', this);

                        try {
                            // Update server
                            await befriend.auth.put('/me/mode/kids', {
                                kid_token: kid_token,
                                age_token: token,
                            });

                            // Update local data
                            if (befriend.me.data.modes.data.kids?.[kid_token]) {
                                let age = befriend.me.data.modes.options.kids[token];
                                befriend.me.data.modes.data.kids[kid_token].age_id =
                                    age?.id || null;
                            }
                        } catch (e) {
                            console.error('Error updating kid age:', e);
                        }
                    });
                }
            }
        },
        onKidsGenderSelect: function () {
            let gender_els = befriend.els.me.querySelectorAll('.kids .kid .gender .option');

            for (let el of gender_els) {
                if (el._listener) continue;
                el._listener = true;

                el.addEventListener('click', async function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    let kid_el = this.closest('.kid');
                    let kid_token = kid_el.getAttribute('data-token');
                    let gender_token = this.getAttribute('data-token');

                    try {
                        befriend.toggleSpinner(true);

                        // Update server
                        await befriend.auth.put('/me/mode/kids', {
                            kid_token: kid_token,
                            gender_token: gender_token,
                            is_select: !elHasClass(el, 'selected'),
                        });

                        // Update UI
                        let gender_options = kid_el.querySelectorAll('.gender .option');

                        if (elHasClass(el, 'selected')) {
                            removeClassEl('selected', this);
                        } else {
                            removeElsClass(gender_options, 'selected');
                            addClassEl('selected', this);
                        }

                        // Update local data
                        if (befriend.me.data.modes.data.kids?.[kid_token]) {
                            let gender = befriend.me.data.genders.find(
                                (g) => g.token === gender_token,
                            );
                            befriend.me.data.modes.data.kids[kid_token].gender_id =
                                gender?.id || null;
                        }

                        befriend.toggleSpinner(false);
                    } catch (e) {
                        console.error('Error updating kid gender:', e);
                    }
                });
            }
        },
        onAddSectionBtn: function () {
            //open available sections
            let btn_el = befriend.els.me.querySelector('.add-section-btn');

            btn_el.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();

                if (befriend.me.isSectionOptionsShown()) {
                    befriend.me.toggleSectionOptions(false);
                } else {
                    befriend.me.toggleSectionOptions(true);
                }
            });
        },
        onModeSelect: function () {
            const modeOptions = befriend.els.me.querySelectorAll('.mode-option');

            for (let option of modeOptions) {
                if (option._listener) continue;
                option._listener = true;

                option.addEventListener('click', async function () {
                    befriend.me.selectMode(this.getAttribute('data-mode'));
                });
            }
        },
        onSelectAvailableSection: function () {
            //add selected available section
            let options = befriend.els.meSectionOptions.getElementsByClassName('option');

            for (let i = 0; i < options.length; i++) {
                let option = options[i];

                if (option._listener) {
                    continue;
                }

                option._listener = true;

                option.addEventListener('click', async function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    let key = this.getAttribute('data-key');

                    befriend.me.addSection(key, true);

                    this.parentNode.removeChild(this);

                    //hide overlay, scroll to section
                    befriend.me.toggleSectionOptions(false);

                    for (let i = 0; i < 10; i++) {
                        await rafAwait();

                        let sectionEl = befriend.els.me.querySelector(
                            `.section[data-key="${key}"]`,
                        );

                        if (sectionEl) {
                            let scrollBarHeight = await befriend.styles.getStatusBarHeight();
                            const sectionRect = sectionEl.getBoundingClientRect();
                            const sectionTop = sectionRect.top - scrollBarHeight - 10;

                            try {
                                window.scrollTo({
                                    top: sectionTop,
                                    behavior: 'smooth',
                                });
                            } catch (e) {
                                console.error('Window scroll failed:', e);
                            }

                            break;
                        }
                    }
                });
            }
        },
        onSectionActions: function () {
            let actions_els = befriend.els.me.querySelectorAll('.section .actions');

            for (let i = 0; i < actions_els.length; i++) {
                let el = actions_els[i];

                if (el._listener) {
                    continue;
                }

                el._listener = true;

                el.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    removeElsClass(befriend.els.me.getElementsByClassName('section'), 'show-menu');

                    let section_el = this.closest('.section');

                    befriend.me.toggleSectionActions(section_el, true);

                    befriend.me.toggleAutoComplete(null, false);
                });
            }
        },
        onSectionReorder: function () {
            const TOUCH_DELAY = 80;
            const MOVE_THRESHOLD = 10;
            let touchTimeout;
            let initialTouchY;
            let hasMoved;

            const sectionReorder = befriend.me.events.sectionReorder;
            const sections = befriend.els.me.getElementsByClassName('section');

            for (let i = 0; i < sections.length; i++) {
                let section = sections[i];

                if (section._reorder_listener) {
                    continue;
                }

                section._reorder_listener = true;

                // Track touch move before drag starts
                section.addEventListener(
                    'touchmove',
                    function (e) {
                        if (sectionReorder.ip) {
                            e.preventDefault();
                            return;
                        }

                        if (!initialTouchY) return;

                        const touch = e.touches[0];
                        const moveDistance = Math.abs(touch.clientY - initialTouchY);

                        if (moveDistance > MOVE_THRESHOLD) {
                            hasMoved = true;
                            clearTimeout(touchTimeout);
                            initialTouchY = null;
                        }
                    },
                    {
                        passive: false,
                    },
                );

                section.addEventListener('touchstart', function (e) {
                    const target = e.target;

                    // befriend.me.hideActiveSecondaryIf(target);

                    if (target.closest('.secondary') || target.closest('.secondary-container')) {
                        return;
                    }

                    // Only handle drag start from section top area

                    const sectionTop = section.querySelector('.section-top');
                    if (!sectionTop.contains(target)) return;

                    if (target.closest('.actions') || target.closest('.menu')) return;

                    // Reset tracking variables
                    hasMoved = false;
                    initialTouchY = e.touches[0].clientY;

                    clearTimeout(touchTimeout);
                    touchTimeout = setTimeout(function () {
                        if (!hasMoved) {
                            e.preventDefault();
                            e.stopPropagation();

                            const coords = getEventCoords(e);
                            sectionReorder.start.x = coords.x;
                            sectionReorder.start.y = coords.y;
                            sectionReorder.el = section;
                            sectionReorder.ip = true;
                            sectionReorder.dragStarted = false;

                            // Disable scrolling
                            const scrollContainer = section.closest('.view-me');
                            if (scrollContainer) {
                                scrollContainer.style.overflow = 'hidden';
                            }

                            const idleSections = sectionReorder.getIdleSections(
                                section.parentElement,
                            );
                            sectionReorder.setSectionsGap(idleSections);
                            sectionReorder.initReorderSection(section);
                            sectionReorder.initSectionsState(section, idleSections);
                        }
                    }, TOUCH_DELAY);
                });
            }
        },
        autoComplete: function () {
            let els = befriend.els.me.getElementsByClassName('search-input');

            for (let i = 0; i < els.length; i++) {
                let el = els[i];

                if (el._listener) {
                    continue;
                }

                el._listener = true;

                let debounceTimer = null;

                el.addEventListener('input', function () {
                    clearTimeout(debounceTimer);

                    debounceTimer = setTimeout(async function () {
                        const value = el.value;

                        let section_key = el.closest('.section').getAttribute('data-key');

                        try {
                            befriend.me.searchItems(section_key, value);
                        } catch (e) {
                            console.error(e);
                        }
                    }, 100);
                });

                //focus
                el.addEventListener('focus', function () {
                    addClassEl('input-focus', el.closest('.input-container'));

                    //hide all other dropdowns
                    let search_containers =
                        befriend.els.me.getElementsByClassName('search-container');

                    removeElsClass(search_containers, befriend.classes.autoCompleteMe);

                    let section_key = el.closest('.section').getAttribute('data-key');

                    let sectionAutocomplete = befriend.me.getSectionAutoComplete(section_key);

                    let minChars = isNumeric(sectionAutocomplete.minChars)
                        ? sectionAutocomplete.minChars
                        : befriend.me.autoComplete.minChars;

                    if (el.value.length >= minChars) {
                        befriend.me.toggleAutoComplete(el.closest('.search-container'), true);
                    }
                });

                el.addEventListener('blur', function () {
                    removeClassEl('input-focus', el.closest('.input-container'));
                });
            }
        },
        autoCompleteFilterList: function () {
            //open list
            let selected_els = befriend.els.me.querySelectorAll(
                '.search-container .selected-container',
            );

            for (let i = 0; i < selected_els.length; i++) {
                let el = selected_els[i];

                if (el._listener) {
                    continue;
                }

                el._listener = true;

                el.addEventListener('click', function (e) {
                    let parent_el = el.closest('.select-container');
                    let section_key = el.closest('.section').getAttribute('data-key');

                    befriend.me.toggleAutoCompleteSelect(parent_el, !elHasClass(parent_el, 'open'));

                    //reset scroll to top after selection
                    if (befriend.me.autoComplete.selected.filterList[section_key]?.needsReset) {
                        let list = parent_el.querySelector('.select-list');

                        requestAnimationFrame(function () {
                            list.scrollTop = 0;
                        });

                        befriend.me.autoComplete.selected.filterList[section_key].needsReset =
                            false;
                    }
                });
            }

            //search list
            let input_els = befriend.els.me.querySelectorAll('.select-container input');

            for (let i = 0; i < input_els.length; i++) {
                let el = input_els[i];

                if (el._listener) {
                    continue;
                }

                el._listener = true;

                el.addEventListener('input', function (e) {
                    console.log("me input")
                    let section_key = el.closest('.section').getAttribute('data-key');

                    befriend.me.updateAutoCompleteSelectList(section_key);
                });
            }

            //select list item
            let item_els = befriend.els.me.querySelectorAll('.select-container .item');

            for (let i = 0; i < item_els.length; i++) {
                let el = item_els[i];

                if (el._listener) {
                    continue;
                }

                el._listener = true;

                el.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    let section_key = el.closest('.section').getAttribute('data-key');

                    let id = this.getAttribute('data-id');

                    befriend.me.selectAutoCompleteFilterItem(section_key, id);
                });
            }
        },
        onActionSelect: function () {
            let actions_els = befriend.els.me.querySelectorAll('.menu .action');

            for (let i = 0; i < actions_els.length; i++) {
                let el = actions_els[i];

                if (el._listener) {
                    continue;
                }

                el._listener = true;

                el.addEventListener('click', function (e) {
                    let action = this.getAttribute('data-action');

                    let section = this.closest('.section');
                    let section_key = section.getAttribute('data-key');
                    let section_data = befriend.me.data.sections.all[section_key];

                    if (action === 'delete') {
                        befriend.me.actions.delete.section = section_key;
                        befriend.els.confirmMeAction.querySelector('.main').innerHTML =
                            'Confirm Delete';
                        befriend.els.confirmMeAction.querySelector('.details').innerHTML =
                            section_data.section_name;

                        befriend.me.toggleConfirm(true);
                    }
                });
            }
        },
        onUpdateSectionHeight: function () {
            let top_els = befriend.els.me.getElementsByClassName('section-top');

            for (let i = 0; i < top_els.length; i++) {
                let el = top_els[i];

                if (el._listener) {
                    continue;
                }

                el._listener = true;

                el.addEventListener('click', (e) => {
                    // e.preventDefault();
                    // e.stopPropagation();

                    if (e.target.closest('.actions')) {
                        return false;
                    }

                    let section_el = el.closest('.section');

                    //hide actions if shown
                    if (elHasClass(section_el, 'show-menu')) {
                        return befriend.me.toggleSectionActions(section_el, false);
                    }

                    befriend.me.updateSectionHeight(
                        section_el,
                        !elHasClass(section_el, 'collapsed'),
                    );
                });
            }
        },
        onSectionCategory: function () {
            let category_btns = befriend.els.me.getElementsByClassName('category-btn');

            for (let i = 0; i < category_btns.length; i++) {
                let btn = category_btns[i];

                if (!btn._listener) {
                    btn._listener = true;

                    btn.addEventListener('click', async function (e) {
                        let section_el = this.closest('.section');

                        // Update active state
                        let section_btns = section_el.getElementsByClassName('category-btn');
                        removeElsClass(section_btns, 'active');
                        addClassEl('active', this);

                        // Get filter parameters
                        const filter_params = {
                            category: this.getAttribute('data-category') || '',
                            category_token: this.getAttribute('data-category-token'),
                            category_table_key: this.getAttribute('data-category-table') || '',
                            tab_key: section_el
                                .querySelector('.tab.active')
                                ?.getAttribute('data-key'),
                        };

                        // Update items
                        try {
                            await befriend.me.updateSectionItems(section_el, filter_params);
                        } catch (e) {
                            console.error(e);
                        }
                    });
                }
            }
        },
        onSectionTabs: function () {
            let tab_els = befriend.els.me.querySelectorAll('.section-container .tab');

            for (let i = 0; i < tab_els.length; i++) {
                let el = tab_els[i];

                if (!el._listener) {
                    el._listener = true;

                    el.addEventListener('click', async function (e) {
                        let section_el = this.closest('.section');

                        // Update active state
                        let section_tabs = section_el.querySelectorAll('.section-container .tab');
                        removeElsClass(section_tabs, 'active');
                        addClassEl('active', this);

                        // Get current category filter parameters
                        let active_category = section_el.querySelector('.category-btn.active');

                        const filter_params = {
                            category: active_category?.getAttribute('data-category') || '',
                            category_token: active_category?.getAttribute('data-category-token'),
                            category_table_key:
                                active_category?.getAttribute('data-category-table') || '',
                            tab_key: this.getAttribute('data-key'),
                        };

                        // Update items
                        try {
                            await befriend.me.updateSectionItems(section_el, filter_params);
                        } catch (e) {
                            console.error(e);
                        }
                    });
                }
            }
        },
        onSelectItem: function () {
            let items = befriend.els.me.querySelector('.sections').getElementsByClassName('item');

            for (let i = 0; i < items.length; i++) {
                let item = items[i];

                if (elHasClass(item, 'button-option')) {
                    continue;
                }

                if (!item._listener) {
                    item._listener = true;

                    item.addEventListener('click', function (e) {
                        if(this.closest('.secondary-container')) {
                            return false;
                        }

                        let section_el = this.closest('.section');

                        if (elHasClass(item, 'mine')) {
                            let open_secondary_el =
                                befriend.els.me.querySelector('.secondary.open');

                            if (open_secondary_el && !e.target.closest('.secondary')) {
                                befriend.me.transitionSecondary(open_secondary_el, false);
                            }

                            return false;
                        }

                        let section_key = section_el.getAttribute('data-key');
                        let token = this.getAttribute('data-token');
                        let table_key = this.getAttribute('data-table-key');

                        try {
                            item.parentNode.removeChild(item);
                        } catch (e) {}

                        try {
                            befriend.me.addSectionItem(section_key, token, table_key);
                        } catch (e) {
                            console.error(e);
                        }
                    });
                }
            }
        },
        onSelectOptionItem: function () {
            let items = befriend.els.me
                .querySelector('.sections')
                .querySelectorAll('.item.button-option');

            for (let i = 0; i < items.length; i++) {
                let item = items[i];

                if (!item._listener) {
                    item._listener = true;

                    item.addEventListener('click', async function (e) {
                        if (item._request_ip) {
                            return false;
                        }

                        item._request_ip = true;

                        try {
                            let section_el = this.closest('.section');
                            let section_buttons =
                                section_el.getElementsByClassName('button-option');
                            let section_key = section_el.getAttribute('data-key');
                            let table_key = befriend.me.getSectionTableKey(section_key);
                            let token = this.getAttribute('data-token');
                            let sectionData = befriend.me.getActiveSection(section_key).data;

                            let isSelect = !elHasClass(item, 'selected');
                            let exclusiveToken = sectionData?.type?.exclusive?.token;
                            let isExclusive = exclusiveToken === token;
                            let exclusiveButton = section_el.querySelector(
                                `.button-option[data-token="${exclusiveToken}"]`,
                            );
                            let isExclusiveSelected =
                                exclusiveButton && elHasClass(exclusiveButton, 'selected');

                            // If section is single-select or this is the exclusive token, deselect all others
                            if (!sectionData?.type?.multi || isExclusive) {
                                removeElsClass(section_buttons, 'selected');
                            }

                            // Toggle current item selection
                            if (isSelect) {
                                // If selecting non-exclusive and exclusive is selected, deselect exclusive
                                if (!isExclusive && isExclusiveSelected) {
                                    removeClassEl('selected', exclusiveButton);
                                }

                                addClassEl('selected', item);
                            } else {
                                removeClassEl('selected', item);
                            }

                            let r = await befriend.auth.put(`/me/sections/selection`, {
                                section_key: section_key,
                                table_key: table_key,
                                item_token: token,
                                is_select: isSelect,
                            });

                            // Update section data
                            let section_data = befriend.me.getActiveSection(section_key);
                            if (!isSelect) {
                                delete section_data.items[token];
                            } else {
                                if (!isExclusive && isExclusiveSelected) {
                                    delete section_data.items[exclusiveToken];
                                }
                                section_data.items[token] = r.data;
                            }

                            // If exclusive item is selected, deselect all others
                            if (isExclusive && isSelect) {
                                for (let i = 0; i < section_buttons.length; i++) {
                                    let btn = section_buttons[i];
                                    if (btn !== item) {
                                        removeClassEl('selected', btn);
                                        let btnToken = btn.getAttribute('data-token');
                                        delete section_data.items[btnToken];
                                    }
                                }
                            }
                        } catch (e) {
                            console.error(e);
                        }

                        item._request_ip = false;
                    });
                }
            }
        },
        onRemoveItem: function () {
            let items = befriend.els.me.querySelector('.sections').getElementsByClassName('item');

            for (let i = 0; i < items.length; i++) {
                let item = items[i];

                let remove_el = item.querySelector('.remove');

                if (!remove_el || remove_el._listener) {
                    continue;
                }

                remove_el._listener = true;

                remove_el.addEventListener('click', async function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    try {
                        befriend.toggleSpinner(true);

                        let section_el = this.closest('.section');
                        let section_key = section_el.getAttribute('data-key');
                        let item_el = this.closest('.item');
                        let delete_token = item_el.getAttribute('data-token');

                        let section_data = befriend.me.getActiveSection(section_key);
                        let item = section_data.items[delete_token];
                        let table_key = item.table_key;

                        // Get initial positions for animation
                        let items_el = section_el.querySelector('.items-container .items');
                        let item_els = items_el.getElementsByClassName('item');
                        let initialPositions = befriend.me.getInitialPositions(item_els);

                        // Handle reordering if this was a favorited item
                        let updatedPositions;
                        let favorite_data = {
                            active: false,
                            position: null,
                        };

                        if (item.is_favorite) {
                            // Remove favorite and reorder remaining favorites
                            item.is_favorite = false;
                            item.favorite_position = null;
                            favorite_data.reorder = updatedPositions =
                                befriend.me.reorderFavoritePositions(section_key, table_key);
                        }

                        // Update server with both delete and reorder
                        try {
                            await befriend.auth.put(`/me/sections/item`, {
                                section_key: section_key,
                                table_key: table_key,
                                section_item_id: item.id,
                                is_delete: true,
                                favorite: favorite_data,
                            });
                        } catch (e) {
                            console.error(e);
                            return; // Don't proceed with UI updates if server update failed
                        }

                        // Remove from data
                        delete section_data.items[delete_token];

                        // Get remaining filtered items
                        let items_filtered = [];
                        for (let token in section_data.items) {
                            let item = section_data.items[token];

                            // Filter by tab if exists
                            let active_tab = section_el.querySelector(
                                '.section-container .tab.active',
                            );
                            if (
                                active_tab &&
                                item.table_key &&
                                item.table_key !== active_tab.getAttribute('data-key')
                            ) {
                                continue;
                            }

                            let remaining_el = section_el.querySelector(
                                `.item.mine[data-token="${token}"]`,
                            );
                            if (remaining_el) {
                                items_filtered.push(remaining_el);
                            }
                        }

                        // Animate out the deleted item
                        item_el.style.transition = `opacity ${befriend.variables.me_remove_item_transition_ms}ms ease-out`;
                        item_el.style.opacity = '0';

                        await timeoutAwait(befriend.variables.me_remove_item_transition_ms);

                        // Remove the element after fade out
                        item_el.parentNode.removeChild(item_el);

                        // Handle animations and DOM updates
                        if (items_filtered.length > 0) {
                            // Sort and animate remaining items
                            let itemsArray = befriend.me.sortItemsByFavorite(
                                items_filtered,
                                section_data,
                            );
                            befriend.me.animateItemTransitions(
                                itemsArray,
                                items_el,
                                initialPositions,
                                null,
                            );

                            // Update rank displays for remaining favorites
                            if (updatedPositions) {
                                for (let token in updatedPositions) {
                                    let remaining_el = section_el.querySelector(
                                        `.item[data-token="${token}"]`,
                                    );
                                    if (remaining_el) {
                                        let rank_el = remaining_el.querySelector('.rank');
                                        rank_el.innerHTML =
                                            updatedPositions[token].favorite_position;
                                    }
                                }
                            }

                            removeClassEl('no-items', section_el);
                        } else {
                            addClassEl('no-items', section_el);
                        }

                        // Update section height after removing the last item
                        befriend.me.updateSectionHeight(
                            section_el,
                            elHasClass(section_el, 'collapsed'),
                        );
                    } catch (e) {
                        console.error(e);
                    } finally {
                        befriend.toggleSpinner(false);
                    }
                });
            }
        },
        onFavorite: function () {
            let meReorder = befriend.me.events.itemReorder;

            let favorite_els = befriend.els.me.getElementsByClassName('favorite');

            for (let i = 0; i < favorite_els.length; i++) {
                let favorite_el = favorite_els[i];

                if (!favorite_el._listener) {
                    favorite_el._listener = true;

                    favorite_el.addEventListener('click', async function (e) {
                        if (meReorder.ip) return;

                        e.preventDefault();
                        e.stopPropagation();

                        //data
                        let section_el = this.closest('.section');
                        let items_el = section_el.querySelector('.items-container .items');
                        let item_els = items_el.getElementsByClassName('item');
                        let item_el = this.closest('.item');

                        let section_key = section_el.getAttribute('data-key');
                        let item_token = item_el.getAttribute('data-token');
                        let active_section = befriend.me.getActiveSection(section_key);
                        let item = active_section.items[item_token];
                        let table_key =
                            item.table_key || befriend.me.getSectionTableKey(section_key);

                        //toggle favorite state
                        item.is_favorite = !item.is_favorite;
                        toggleElClass(this.closest('.item'), 'is-favorite');

                        // Get initial positions before any changes
                        let initialPositions = befriend.me.getInitialPositions(item_els);

                        // Handle favorite data updates
                        let updatedPositions;
                        let favorite_data = {
                            active: item.is_favorite,
                        };

                        if (item.is_favorite) {
                            // Adding favorite - get highest position and add 1
                            let highest = befriend.me.getFavoriteHighestPosition(
                                section_key,
                                table_key,
                            );
                            item.favorite_position = highest + 1;
                            favorite_data.position = item.favorite_position;
                        } else {
                            // Removing favorite - reorder remaining favorites
                            item.favorite_position = null;
                            favorite_data.position = null;
                            favorite_data.reorder = updatedPositions =
                                befriend.me.reorderFavoritePositions(section_key, table_key);
                        }

                        // Update rank displays
                        befriend.me.updateRankDisplays(section_el, item_el, item, updatedPositions);

                        // Sort and animate items
                        let itemsArray = Array.from(item_els);
                        itemsArray = befriend.me.sortItemsByFavorite(itemsArray, active_section);

                        befriend.me.animateItemTransitions(
                            itemsArray,
                            items_el,
                            initialPositions,
                            item.is_favorite ? item_el : null,
                        );

                        //server
                        try {
                            await befriend.auth.put(`/me/sections/item`, {
                                section_key: section_key,
                                table_key: table_key,
                                section_item_id: item.id,
                                favorite: favorite_data,
                            });
                        } catch (e) {
                            console.error(e);
                        }
                    });
                }
            }

            const TOUCH_DELAY = 80; // ms to wait before initiating drag
            const MOVE_THRESHOLD = 10; // pixels of movement to consider it a scroll
            let touchTimeout;
            let initialTouchY;
            let hasMoved;

            let item_els = befriend.els.me.getElementsByClassName('item');

            for (let i = 0; i < item_els.length; i++) {
                let item_el = item_els[i];

                if (!elHasClass(item_el, 'favorable')) {
                    continue;
                }

                if (item_el._reorder_listener) {
                    continue;
                }

                item_el._reorder_listener = true;

                // Track touch move before drag starts
                item_el.addEventListener(
                    'touchmove',
                    function (e) {
                        if (meReorder.ip) {
                            e.preventDefault();
                            return;
                        }

                        if (!initialTouchY) {
                            return;
                        }

                        const touch = e.touches[0];
                        const moveDistance = Math.abs(touch.clientY - initialTouchY);

                        if (moveDistance > MOVE_THRESHOLD) {
                            hasMoved = true;
                            clearTimeout(touchTimeout);
                            initialTouchY = null;
                        }
                    },
                    {
                        passive: false,
                    },
                );

                item_el.addEventListener('touchstart', function (e) {
                    if (!elHasClass(item_el, 'is-favorite')) return;

                    // Don't start drag if clicking the heart icon or secondary
                    const target = e.target;
                    if (
                        target.closest('.heart') ||
                        target.closest('.remove') ||
                        target.closest('.secondary')
                    ) {
                        return;
                    }

                    // Reset tracking variables
                    hasMoved = false;
                    initialTouchY = e.touches[0].clientY;

                    // Clear any existing timeout
                    clearTimeout(touchTimeout);

                    touchTimeout = setTimeout(function () {
                        if (!hasMoved) {
                            e.preventDefault();
                            e.stopPropagation();

                            const coords = getEventCoords(e);
                            meReorder.start.x = coords.x;
                            meReorder.start.y = coords.y;
                            meReorder.el = item_el;
                            meReorder.ip = true;
                            meReorder.dragStarted = false;

                            // Disable scrolling when drag starts
                            const scrollContainer = item_el.closest('.items-container');
                            if (scrollContainer) {
                                scrollContainer.style.overflowY = 'hidden';
                            }

                            const idleItems = meReorder.getIdleItems(item_el.parentElement);
                            meReorder.setItemsGap(idleItems);
                            meReorder.initReorderItem(item_el);
                            meReorder.initItemsState(item_el, idleItems);
                        }
                    }, TOUCH_DELAY);
                });
            }
        },
        onOpenSecondary: function () {
            let secondaries = befriend.els.me.getElementsByClassName('secondary');

            for (let i = 0; i < secondaries.length; i++) {
                let el = secondaries[i];

                if (!el._listener) {
                    el._listener = true;

                    el.addEventListener('click', function (e) {
                        e.preventDefault();
                        e.stopPropagation();

                        // Don't handle clicks on options menu
                        if (e.target.closest('.options')) {
                            return false;
                        }

                        befriend.me.transitionSecondary(
                            el,
                            !befriend.me.secondaries.activeEl ||
                            befriend.me.secondaries.activeEl !== el
                        );
                    });
                }
            }

            // Handle clicks in the secondary container
            const secondary_current_els = befriend.els.me.querySelectorAll('.secondary-container .current-selected');

            for(let el of secondary_current_els) {
                el._listener = true;

                el.addEventListener('click', async (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    const secondary_item = el.closest('.item');
                    if (!secondary_item) return;

                    const itemToken = secondary_item.getAttribute('data-token');
                    const original_item = el.closest('.section').querySelector(`.item.mine[data-token="${itemToken}"]`);
                    if (!original_item) return;

                    const secondary_el = original_item.querySelector('.secondary');
                    if (!secondary_el) return;

                    befriend.me.transitionSecondary(
                        secondary_el,
                        !befriend.me.secondaries.activeEl ||
                        befriend.me.secondaries.activeEl !== secondary_el
                    );
                });
            }
        },
        onSelectSecondary: function () {
            const secondary_containers = befriend.els.me.getElementsByClassName('secondary-container');

            for(let secondary_container of secondary_containers) {
                if (!secondary_container._listener) {
                    secondary_container._listener = true;

                    secondary_container.addEventListener('click', async (e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        const secondary_option = e.target.closest('.option');
                        if (!secondary_option) return;

                        const options_el = secondary_option.closest('.options');
                        if (!options_el) return;

                        const itemToken = options_el.getAttribute('data-item-token');
                        const option_value = secondary_option.getAttribute('data-option');

                        const section_el = secondary_container.closest('.section');
                        const section_key = section_el.getAttribute('data-key');
                        const table_key = section_el.getAttribute('data-table-key');

                        let active_section = befriend.me.getActiveSection(section_key);
                        let item = active_section.items[itemToken];

                        try {
                            // Update selection state
                            removeElsClass(options_el.querySelectorAll('.option'), 'selected');
                            addClassEl('selected', secondary_option);

                            // Update item data
                            item.secondary = option_value;

                            // Update display text in both locations
                            const displayText = option_value;

                            // Update original item's secondary element
                            const original_item = section_el.querySelector(`.item.mine[data-token="${itemToken}"]`);
                            const original_secondary = original_item?.querySelector('.secondary');
                            if (original_secondary) {
                                original_secondary.querySelector('.current-selected').textContent = displayText;
                                removeClassEl('unselected', original_secondary);
                            }

                            // Update secondary container's display
                            const secondary_item = secondary_container.querySelector(`.item[data-token="${itemToken}"]`);
                            if (secondary_item) {
                                secondary_item.querySelector('.current-selected').textContent = displayText;
                                removeClassEl('unselected', secondary_item);
                            }

                            // Close the secondary menu
                            befriend.me.transitionSecondary(original_secondary, false);

                            // Update server
                            await befriend.auth.put(`/me/sections/item`, {
                                section_key: section_key,
                                table_key: table_key,
                                section_item_id: item.id,
                                secondary: option_value
                            });

                            requestAnimationFrame(() => {
                                befriend.me.updateSecondaryPosition(section_el, options_el);
                                befriend.me.updateSectionHeight(section_el, false);
                            });

                        } catch (e) {
                            console.error('Error updating secondary:', e);
                        }
                    });
                }
            }
        },
        confirmAction: function () {
            let buttons = befriend.els.confirmMeAction.getElementsByClassName('button');

            for (let i = 0; i < buttons.length; i++) {
                let button = buttons[i];

                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    let action = button.getAttribute('data-action');

                    if (action === 'no') {
                        befriend.me.toggleConfirm(false);
                    } else if (action === 'yes') {
                        befriend.me.deleteSection(befriend.me.actions.delete.section);
                    }
                });
            }
        },
        onSelectAutoCompleteItem: function () {
            let els = befriend.els.me.querySelectorAll(`.autocomplete-list .item`);

            for (let i = 0; i < els.length; i++) {
                let el = els[i];

                if (el._listener) {
                    continue;
                }

                el._listener = true;

                el.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    let section = el.closest('.section');
                    let section_key = section.getAttribute('data-key');
                    let table_key = el.getAttribute('data-table-key');
                    let token = el.getAttribute('data-token');

                    befriend.me.toggleAutoComplete(null, false);

                    befriend.me.addSectionItem(section_key, token, table_key);

                    el.closest('.search-container').querySelector('.search-input').value = '';
                });
            }
        },
    },
};
