befriend.me = {
    data: {
        me: null,
        sections: {
            all: null,
            options: null,
            active: null,
            collapsed: {}
        }
    },
    init: function () {
        return new Promise(async (resolve, reject) => {
            try {
                await befriend.me.getMe();
                befriend.me.setMe();
                befriend.me.setActive();
                befriend.me.setOptions();
            } catch(e) {
                console.error(e);
            }

            resolve();
        });
    },
    getMe: function () {
        return new Promise(async (resolve, reject) => {
            try {
                let r = await befriend.auth.get('/me');

                let data = r.data;

                befriend.me.data.me = data.me;
                befriend.me.data.sections.all = data.sections.all;
                befriend.me.data.sections.options = data.sections.options;
                befriend.me.data.sections.active = data.sections.active;

                //local data
                befriend.user.setLocal('me.me', data.me);
            } catch(e) {
                console.error(e);

                if(befriend.user.local.data && befriend.user.local.data.me
                    && befriend.user.local.data.me.me) {
                    console.log("Using local me data");
                    befriend.me.data.me = befriend.user.local.data.me.me;
                }
            }

            resolve();
        });
    },
    setMe: function () {
        if(!befriend.me.data.me) {
            return;
        }

        let me_obj = befriend.me.data.me;

        //first name
        let first_name_el = befriend.els.me.querySelector('.first-name');

        //birthday
        let birthday_el = befriend.els.me.querySelector('.birthday');

        //set
        if(me_obj.first_name) {
            first_name_el.innerHTML = me_obj.first_name;
        }

        if(me_obj.birth_date) {
            let years = dayjs().diff(dayjs(me_obj.birth_date), 'years');

            let date = dayjs(me_obj.birth_date).format('MMM. Do, YYYY');

            birthday_el.querySelector('.age').innerHTML = years;

            if(years >= 100) {
                addClassEl('one-hundred', birthday_el.querySelector('.age'));
            }

            // birthday_el.querySelector('.date').innerHTML = date;
        }
    },
    saveSection: function (key) {
        return new Promise(async (resolve, reject) => {
            try {
                 let r = await befriend.auth.post('/me/sections', {key});

                 befriend.me.data.sections.active[key] = r.data;
            } catch(e) {
                console.error(e);
            }

            resolve();
        });
    },
    addSection: async function (key, skip_save) {
        let option_data = befriend.me.data.sections.all[key];
        let sections_el = befriend.els.me.querySelector('.about-me').querySelector('.sections');

        if(option_data) {
            let key_exists = false;
            let all_sections = befriend.els.me.querySelector('.about-me').getElementsByClassName('section');

            for(let i = 0; i < all_sections.length; i++) {
                let section = all_sections[i];

                if(section.getAttribute('data-key') === key) {
                    key_exists = true;
                    break;
                }
            }

            if(!(key_exists)) {
                delete befriend.me.data.sections.options[key];

                if(!(key in befriend.me.data.sections.active)) {
                    if(!skip_save) {
                        //save to server
                        try {
                            await befriend.me.saveSection(key);
                        } catch(e) {
                            console.error(e);
                        }
                    }
                }

                let section_data = befriend.me.data.sections.active[key];

                let autocomplete = '';
                let categories = '';
                let secondary = '';
                let items = '';

                if(section_data.data) {
                    if(section_data.data.categories) {
                        categories = `<div class="category-btn active" data-category="mine">
                                                My ${option_data.section_name}
                                        </div>`;

                        for(let category of section_data.data.categories) {
                            categories += `<div class="category-btn" data-category="${category}">
                                                ${category}
                                        </div>`;
                        }

                        categories = `<div class="category-filters">${categories}</div>`
                    }

                    if(section_data.data.autocomplete) {
                        autocomplete = `
                            <div class="search-container">
                                <input type="text" class="search-input" placeholder="${section_data.data.autocomplete.string}">
                                <div class="autocomplete-list"></div>
                            </div>
                        `;
                    }

                    if(section_data.items) {
                        for(let token in section_data.items) {
                            let item = section_data.items[token];

                            items += `<div class="item" data-token="${token}">
                                        ${item.name}
                                    </div>`;
                        }
                    }
                }

                //initialize collapsed if saved
                let section_collapsed = '';
                let section_height = '';

                if(befriend.me.data.sections.collapsed[key]) {
                    section_collapsed = 'collapsed';
                    section_height = '0';
                }

                let html = `<div class="section ${section_collapsed}" data-key="${key}" style="${section_height}">
                                <div class="section-top">
                                    <div class="icon">${option_data.icon}</div>
                                    <div class="title">${option_data.section_name}</div>
                                    <div class="actions">                                                   
                                        <svg class="more" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 426.667 85.334"><circle cx="42.667" cy="42.667" r="42.667"/><circle cx="213.333" cy="42.667" r="42.667"/><circle cx="384" cy="42.667" r="42.667"/></svg>
                                    </div>
                                </div>
                                
                                <div class="section-container">
                                    ${categories}
                                    ${autocomplete}
                                    ${secondary}
                                    <div class="items ${!items ? 'no-items': ''}">${items}</div>
                                </div>
                            </div>`;

                sections_el.insertAdjacentHTML('beforeend', html);

                befriend.me.events.onupdateSectionHeight();
                befriend.me.events.onSectionCategory();
            }
        }
    },
    addSectionItem: function (section_key, item_token) {
        return new Promise(async (resolve, reject) => {
            let section_data = befriend.me.data.sections.active[section_key];

            if(!('items' in section_data)) {
                section_data.items = {};
            }

            section_data.items[item_token] = section_data.data.options.find(item => item.token === item_token);

            let section_els = befriend.els.me.querySelector('.sections').getElementsByClassName('section');

            for(let i = 0; i < section_els.length; i++) {
                let el = section_els[i];

                if(el.getAttribute('data-key') === section_key) {
                    //remove no-items
                    removeClassEl('no-items', el.querySelector('.items'));

                    //automatically switch to first category

                    let category_btn_first = el.querySelector('.category-btn');

                    if(category_btn_first) {
                        if(!elHasClass(category_btn_first, 'active')) {
                            fireClick(category_btn_first);
                        }
                    }

                    break;
                }
            }

            try {
                let r = await befriend.auth.post(`/me/sections/item`, {
                    section_key: section_key,
                    item_token: item_token
                });

                section_data.items[item_token].id = r.data.id;
            } catch(e) {
                console.error(e);
            }

            resolve();
        });
    },
    removeSectionItem: function (section_key, item_token) {
        return new Promise(async (resolve, reject) => {
            let section_data = befriend.me.data.sections.active[section_key];

            let item = section_data.items[item_token];

            delete section_data.items[item_token];

            try {
                await befriend.auth.put(`/me/sections/item`, {
                    section_name: befriend.me.data.sections.all[section_key].data_table,
                    section_item_id: item.id,
                    is_delete: true
                });
            } catch(e) {
                console.error(e);
            }

            resolve();
        });
    },
    setActive: function () {
        if(befriend.me.data.sections.active) {
            for(let key in befriend.me.data.sections.active) {
                befriend.me.addSection(key, true);
            }

            //enable first category for each section
            let sections = befriend.els.me.querySelector('.sections').getElementsByClassName('section');

            for(let i = 0; i < sections.length; i++) {
                let category_btns = sections[i].getElementsByClassName('category-btn');

                if(category_btns && category_btns.length) {
                    fireClick(category_btns[0]);
                }
            }

        }
    },
    setOptions: function () {
        let html = ``;

        let sections = befriend.me.data.sections.options;

        if(sections) {
            for(let key in sections) {
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
    updateCollapsed: async function () {
        await rafAwait();

        //initialize height for transition
        let section_els = befriend.els.me.querySelector('.sections').getElementsByClassName('section');

        for(let i = 0; i < section_els.length; i++) {
            let el = section_els[i];

            let key = el.getAttribute('data-key');

            let collapse = false;

            if(key in befriend.me.data.sections.collapsed) {
                collapse = befriend.me.data.sections.collapsed[key];
            }

            befriend.me.updateSectionHeight(el, collapse, false, true);
        }
    },
    isSectionOptionsShown: function () {
        return elHasClass(document.documentElement, befriend.classes.availableMeSections);
    },
    toggleSectionOptions: function (show) {
        if(show) {
            addClassEl(befriend.classes.availableMeSections, document.documentElement);
        } else {
            removeClassEl(befriend.classes.availableMeSections, document.documentElement);
        }
    },
    transitionSecondary: function (secondary_el, show) {
        let options_el = secondary_el.querySelector('.options');

        if(show) {
            addClassEl('open', secondary_el);

            setElHeightDynamic(options_el);
        } else {
            removeClassEl('open', secondary_el);

            options_el.style.removeProperty('height');
        }
    },
    updateSectionHeightT: null,
    updateSectionHeight: async function (el, collapse, no_transition, skip_save) {
        let section_container = el.querySelector('.section-container');

        if(no_transition) {
            section_container.style.transition = 'none';
            await rafAwait();
        }

        clearTimeout(befriend.me.updateSectionHeightT);
        section_container.style.removeProperty('overflow-y');

        if(collapse) {
            addClassEl('collapsed', el);
            section_container.style.height = 0;
        } else {
            removeClassEl('collapsed', el);
            setElHeightDynamic(section_container);

            befriend.me.updateSectionHeightT = setTimeout(function () {
                section_container.style.overflowY = 'initial';
            }, 300);
        }

        if(!skip_save) {
            let section_key = el.getAttribute('data-key');
            befriend.me.data.sections.collapsed[section_key] = collapse;

            befriend.user.setLocal('me.sections.collapsed', befriend.me.data.sections.collapsed);
        }

        await rafAwait();

        section_container.style.removeProperty('transition');
    },
    events: {
        init: function () {
            return new Promise(async (resolve, reject) => {
                befriend.me.events.onAddSection();

                resolve();
            });
        },
        onAddSection: function () {
            //open available sections
            let btn_el = befriend.els.me.querySelector('.add-section-btn');

            btn_el.addEventListener('click', function (e) {
                 e.preventDefault();
                 e.stopPropagation();

                 if(befriend.me.isSectionOptionsShown()) {
                     befriend.me.toggleSectionOptions(false);
                 } else {
                     befriend.me.toggleSectionOptions(true);
                 }
            });

            //add selected available section
            let options = befriend.els.meSectionOptions.getElementsByClassName('option');

            for(let i = 0; i < options.length; i++) {
                let option = options[i];

                if(option._listener) {
                    continue;
                }

                option._listener = true;

                option.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    let key = this.getAttribute('data-key');

                    befriend.me.addSection(key);

                    this.parentNode.removeChild(this);
                });
            }
        },
        onupdateSectionHeight: function () {
            let top_els = befriend.els.me.getElementsByClassName('section-top');

            for(let i = 0; i < top_els.length; i++) {
                let el = top_els[i];

                if(el._listener) {
                    continue;
                }

                el._listener = true;

                el.addEventListener('click', (e) => {
                     //actions handled separately
                     if(e.target.closest('.actions')) {
                         return false;
                     }

                     let section_el = el.closest('.section');

                     befriend.me.updateSectionHeight(section_el, !elHasClass(section_el, 'collapsed'));
                });
            }
        },
        onSectionCategory: function () {
            let category_btns = befriend.els.me.getElementsByClassName('category-btn');

            for(let i = 0; i < category_btns.length; i++) {
                let btn = category_btns[i];

                if(!btn._listener) {
                    btn._listener = true;

                    btn.addEventListener('click', function (e) {
                        let category = this.getAttribute('data-category');

                        let section = this.closest('.section');

                        let section_btns = section.getElementsByClassName('category-btn');

                        removeElsClass(section_btns, 'active');

                        addClassEl('active', this);

                        let section_key = section.getAttribute('data-key');
                        let section_data = befriend.me.data.sections.active[section_key];
                        let category_items_html = ``;

                        if(category === 'mine') {
                            if(!(Object.keys(section_data.items).length)) {
                                //no-items
                                addClassEl('no-items', section.querySelector('.items'));
                            } else {
                                for(let token in section_data.items) {
                                    let item = section_data.items[token];

                                    let secondary = '';
                                    let options = '';

                                    //current selected
                                    if(section_data.data && section_data.data.secondary) {
                                        let unselected = '';

                                        if(!item.secondary) {
                                            unselected = 'unselected';
                                        }

                                        for(let option of section_data.data.secondary) {
                                            let selected = item.secondary === option ? 'selected' : '';

                                            options += `<div class="option ${selected}" data-option="${option}">${option}</div>`;
                                        }

                                        secondary = `<div class="secondary ${unselected}" data-value="${item.secondary ? item.secondary : ''}">
                                                    <div class="current-selected">${item.secondary ? item.secondary : section_data.data.unselectedStr}</div>
                                                    <svg class="arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 82.1 43.2"><path d="M41.1,43.2L0,2.2,2.1,0l39,39L80,0l2.1,2.2-41,41Z"/></svg>
                                                    <div class="options">${options}</div>
                                                </div>`;
                                    }

                                    category_items_html += `<div class="item mine" data-token="${token}">
                                                            <div class="name">${item.name}</div>
                                                            ${secondary}
                                                            <div class="remove">
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 121.805 14.619"><path d="M7.308,14.619h107.188c4.037,0,7.309-3.272,7.309-7.31s-3.271-7.309-7.309-7.309H7.308C3.272.001,0,3.273,0,7.31s3.272,7.309,7.308,7.309Z"/></svg>
                                                            </div>
                                                        </div>`;
                                }
                            }

                        } else {
                            //remove no-items
                            removeClassEl('no-items', section.querySelector('.items'));

                            for(let item of section_data.data.options) {
                                if(item.category === category) {
                                    if(!(item.token in section_data.items)) {
                                        category_items_html += `<div class="item" data-token="${item.token}">
                                                            ${item.name}
                                                        </div>`;
                                    }
                                }
                            }
                        }

                        section.querySelector('.items').innerHTML = category_items_html;

                        //events
                        befriend.me.events.onSelectItem();
                        befriend.me.events.onRemoveItem();
                        befriend.me.events.onOpenSecondary();
                        befriend.me.events.onSelectSecondary();

                        //ui
                        befriend.me.updateSectionHeight(section, elHasClass(section, 'collapsed'));
                    });
                }
            }
        },
        onSelectItem: function () {
            let items = befriend.els.me.querySelector('.sections').getElementsByClassName('item');

            for(let i = 0; i < items.length; i++) {
                let item = items[i];

                if(!item._listener) {
                    item._listener = true;

                    item.addEventListener('click', function (e) {
                        if(elHasClass(item, 'mine')) {
                            let open_secondary_el = befriend.els.me.querySelector('.secondary.open');

                            if(open_secondary_el && !e.target.closest('.secondary')) {
                                befriend.me.transitionSecondary(open_secondary_el, false);
                            }

                            return false;
                        }

                        let section = this.closest('.section');
                        let section_key = section.getAttribute('data-key');
                        let token = this.getAttribute('data-token');

                        try {
                            item.parentNode.removeChild(item);
                        } catch(e) {

                        }

                        try {
                            befriend.me.addSectionItem(section_key, token);
                        } catch(e) {
                            console.error(e);
                        }
                    });
                }
            }
        },
        onRemoveItem: function () {
            let items = befriend.els.me.querySelector('.sections').getElementsByClassName('item');

            for(let i = 0; i < items.length; i++) {
                let item = items[i];
                
                let remove_el = item.querySelector('.remove');
                
                if(!remove_el || remove_el._listener) {
                    continue;
                }

                remove_el._listener = true;

                remove_el.addEventListener('click', function (e) {
                    let section = this.closest('.section');
                    let section_key = section.getAttribute('data-key');
                    let item = this.closest('.item');
                    let token = item.getAttribute('data-token');

                    //dom
                    try {
                        item.parentNode.removeChild(item);
                    } catch(e) {
                        console.error(e);
                    }

                    //data/server
                    befriend.me.removeSectionItem(section_key, token);

                    //ui
                    let section_data = befriend.me.data.sections.active[section_key];

                    if(!Object.keys(section_data.items).length) {
                        addClassEl('no-items', section.querySelector('.items'));
                    }

                    befriend.me.updateSectionHeight(section, elHasClass(section, 'collapsed'));
                });
            }
        },
        onOpenSecondary: function () {
            let secondaries = befriend.els.me.getElementsByClassName('secondary');

            for(let i = 0; i < secondaries.length; i++) {
                let el = secondaries[i];

                if(!el._listener) {
                    el._listener = true;

                    el.addEventListener('click', function (e) {
                        e.preventDefault();
                        e.stopPropagation();

                        if(e.target.closest('.options')) {
                            return false;
                        }

                        //hide all except current
                        for(let i2 = 0; i2 < secondaries.length; i2++) {
                            let secondary_2 = secondaries[i2];

                            if(el !== secondary_2) {
                                befriend.me.transitionSecondary(secondary_2, false);
                            }
                        }

                        if(elHasClass(el, 'open')) {
                            befriend.me.transitionSecondary(el, false);
                        } else {
                            befriend.me.transitionSecondary(el, true);
                        }
                    });
                }
            }
        },
        onSelectSecondary: function () {
            let secondaries = befriend.els.me.getElementsByClassName('secondary');

            for(let i = 0; i < secondaries.length; i++) {
                let secondary = secondaries[i];

                let options = secondary.getElementsByClassName('option');

                for(let i2 = 0; i2 < options.length; i2++) {
                    let option = options[i2];

                    if(!option._listener) {
                        option._listener = true;

                        option.addEventListener('click', async function (e) {
                            e.preventDefault();
                            e.stopPropagation();

                            let option_value = this.getAttribute('data-option');

                            let section = this.closest('.section');
                            let section_key = section.getAttribute('data-key');

                            let item_el = this.closest('.item');

                            let item_token = item_el.getAttribute('data-token');

                            let current_selected_el = secondary.querySelector('.current-selected');

                            //el
                            removeElsClass(options, 'selected');
                            addClassEl('selected', option);
                            befriend.me.transitionSecondary(secondary, false);
                            removeClassEl('unselected', secondary);
                            current_selected_el.innerHTML = option_value;

                            //data
                            let active_section = befriend.me.data.sections.active[section_key];

                            let item = active_section.items[item_token];

                            let prev_option_value = item.secondary;

                            if(prev_option_value !== option_value) {
                                item.secondary = option_value;

                                //server
                                try {
                                    await befriend.auth.put(`/me/sections/item`, {
                                        section_name: befriend.me.data.sections.all[section_key].data_table,
                                        section_item_id: item.id,
                                        secondary: option_value
                                    });
                                } catch(e) {
                                    console.error(e);
                                }
                            }
                        });
                    }
                }
            }
        }
    }
};