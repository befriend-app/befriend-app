befriend.me = {
    actions: {
        delete: {
            section: null,
        },
    },
    data: {
        me: null,
        sections: {
            all: null,
            options: null,
            active: null,
            collapsed: {},
        },
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
    init: function () {
        return new Promise(async (resolve, reject) => {
            try {
                await befriend.me.getMe();
                befriend.me.setMe();
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
                befriend.me.data.sections.all = data.sections.all;
                befriend.me.data.sections.options = data.sections.options;
                befriend.me.data.sections.active = data.sections.active;

                if (data.country) {
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
    setMe: function () {
        if (!befriend.me.data.me) {
            return;
        }

        let me_obj = befriend.me.data.me;

        //first name
        let first_name_el = befriend.els.me.querySelector('.first-name');

        //birthday
        let birthday_el = befriend.els.me.querySelector('.birthday');

        //set
        if (me_obj.first_name) {
            first_name_el.innerHTML = me_obj.first_name;
        }

        if (me_obj.birth_date) {
            let years = dayjs().diff(dayjs(me_obj.birth_date), 'years');

            let date = dayjs(me_obj.birth_date).format('MMM. Do, YYYY');

            birthday_el.querySelector('.age').innerHTML = years;

            if (years >= 100) {
                addClassEl('one-hundred', birthday_el.querySelector('.age'));
            }

            // birthday_el.querySelector('.date').innerHTML = date;
        }
    },
    saveSection: function (key) {
        return new Promise(async (resolve, reject) => {
            try {
                befriend.toggleSpinner(true);
                let location = befriend.location.device;
                let r = await befriend.auth.post('/me/sections', { key, location });

                befriend.me.data.sections.active[key] = r.data;
            } catch (e) {
                console.error(e);
            }

            befriend.toggleSpinner(false);

            resolve();
        });
    },
    getSectionElByKey: function (key) {
        let sections_el = befriend.els.me.querySelector('.about-me').querySelector('.sections');

        return sections_el.querySelector(`.section[data-key="${key}"]`);
    },
    getActiveSection: function (key) {
        return befriend.me.data.sections.active?.[key];
    },
    getSectionAutoComplete: function (key) {
        let section = this.getActiveSection(key);

        if(section) {
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

        let filterListObj =  befriend.me.autoComplete.selected.filterList;

        if (key === 'schools') {
            if (befriend.me.data.country) {
                selected_str = befriend.me.data.country.name;

               filterListObj[key] = {
                    item: befriend.me.data.country,
                };
            } else if (
                befriend.user.local.data.me &&
                befriend.user.local.data.me.filterList &&
                befriend.user.local.data.me.filterList[key]
            ) {
                filterListObj[key] = {
                    item: befriend.user.local.data.me.filterList[key],
                };

                selected_str = befriend.user.local.data.me.filterList[key].name;
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
    addSection: async function (key, skip_save) {
        let option_data = befriend.me.data.sections.all[key];
        let sections_el = befriend.els.me.querySelector('.about-me').querySelector('.sections');
        let section_els = sections_el.getElementsByClassName('section');

        let section_el = befriend.me.getSectionElByKey(key);

        let section_collapsed = '';
        let section_height = '';

        if (option_data) {
            let prev_index;

            //delete section if prev, re-insert at same position
            if(section_el) {
                for(let i = 0; i < section_els.length; i++) {
                    if(section_els[i] === section_el) {
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

            let autocomplete = '';
            let categories = '';
            let secondary = '';
            let items = '';

            if (section_data.data) {
                if (section_data.data.categories) {
                    categories = `<div class="category-btn active" data-category="mine">
                                                My ${option_data.section_name}
                                        </div>`;

                    for (let category of section_data.data.categories) {
                        categories += `<div class="category-btn" data-category="${category}">
                                                ${category}
                                        </div>`;
                    }

                    categories = `<div class="category-filters">${categories}</div>`;
                }

                if (section_data.data.autoComplete) {
                    let select_list = befriend.me.buildSelectFilterList(
                        key,
                        section_data.data.autoComplete,
                    );

                    autocomplete = `
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

                if (section_data.items) {
                    for (let token in section_data.items) {
                        let item_html = befriend.me.sectionItemHtml(key, token);

                        items += item_html;
                    }
                }
            }

            //initialize collapsed if saved
            if (befriend.me.data.sections.collapsed[key]) {
                section_collapsed = 'collapsed';
                section_height = '0';
            }

            let html = `<div class="section ${key} ${section_collapsed}" data-key="${key}" style="${section_height}">
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
                                    ${categories}
                                    ${autocomplete}
                                    ${secondary}
                                    <div class="items ${!items ? 'no-items' : ''} ${section_data?.data?.styles?.rowCols || ''}">${items}</div>
                                </div>
                            </div>`;

            //re-insert section at prev index
            if(isNumeric(prev_index) && section_els.length) {
                if(prev_index === 0) {
                    sections_el.insertAdjacentHTML('afterbegin', html);
                } else {
                    let insert_after_el = section_els[prev_index - 1];

                    insert_after_el.insertAdjacentHTML('afterend', html);
                }
            } else {
                sections_el.insertAdjacentHTML('beforeend', html);
            }

            befriend.me.events.onSectionCategory();
            befriend.me.events.onSectionActions();
            befriend.me.events.autoComplete();
            befriend.me.events.autoCompleteFilterList();
            befriend.me.events.onActionSelect();
            befriend.me.events.onUpdateSectionHeight();

            section_el = befriend.me.getSectionElByKey(key);

            if (!section_collapsed) {
                befriend.me.updateSectionHeight(section_el, false, true, true);
            }
        }
    },
    addSectionItem: function (section_key, item_token) {
        return new Promise(async (resolve, reject) => {
            try {
                let section_data = befriend.me.getActiveSection(section_key);

                if (!('items' in section_data)) {
                    section_data.items = {};
                }

                let filterKey = section_data.data?.autoComplete?.filter?.hashKey;
                let hash_token = null;

                if(filterKey) {
                    hash_token = befriend.me.autoComplete.selected.filterList[section_key].item[filterKey];
                }

                let r = await befriend.auth.post(`/me/sections/item`, {
                    section_key: section_key,
                    item_token: item_token,
                    hash_token: hash_token || null,
                });

                section_data.items[item_token] = r.data;

                //add unique selection to options if not exists
                if(section_data.data.options) {
                    let option = section_data.data.options.find((item) => item.token === item_token);

                    if (!option) {
                        section_data.data.options.push(r.data);
                    }
                }

                //re-add section
                befriend.me.addSection(section_key, true);
            } catch (e) {
                console.error(e);
            }

            let section_el = befriend.me.getSectionElByKey(section_key);

            if (section_el) {
                removeClassEl('no-items', section_el.querySelector('.items'));

                //automatically switch to first category

                let category_btn_first = section_el.querySelector('.category-btn');

                if (category_btn_first) {
                    fireClick(category_btn_first);
                }
            }

            resolve();
        });
    },
    removeSectionItem: function (section_key, item_token) {
        return new Promise(async (resolve, reject) => {
            let section_data = befriend.me.getActiveSection(section_key);

            let item = section_data.items[item_token];

            delete section_data.items[item_token];

            try {
                await befriend.auth.put(`/me/sections/item`, {
                    section_key: section_key,
                    section_item_id: item.id,
                    is_delete: true,
                });
            } catch (e) {
                console.error(e);
            }

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
                befriend.me.addSection(key, true);
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
    searchItems: function (section_key, search_value) {
        return new Promise(async (resolve, reject) => {
            search_value = search_value ? search_value.trim() : '';

            let sectionAutocomplete = befriend.me.getSectionAutoComplete(section_key);

            let minChars = isNumeric(sectionAutocomplete.minChars) ? sectionAutocomplete.minChars : befriend.me.autoComplete.minChars;

            if (search_value.length < minChars) {
                befriend.me.toggleAutoComplete(false);
                return resolve();
            }

            try {
                let endpoint =
                    befriend.me.getSectionAutoComplete(section_key).endpoint;

                let filterId =
                    befriend.me.autoComplete.selected.filterList[section_key]?.item?.id || null;

                const r = await befriend.auth.get(endpoint, {
                    search: search_value,
                    filterId: filterId,
                    location: befriend.location.device || null
                });

                befriend.me.setAutoComplete(section_key, r.data.items);
            } catch (error) {
                console.error('Search error:', error);
            }
        });
    },
    setAutoComplete: function (section_key, items) {
        let section_el = befriend.me.getSectionElByKey(section_key);

        let search_container_el = section_el.querySelector('.search-container');

        if (search_container_el) {
            let list = search_container_el.querySelector('.autocomplete-list');

            if (list) {
                let section_data = befriend.me.getActiveSection(section_key);
                let auto_compete_data = section_data.data.autoComplete;
                let items_html = '';

                if(auto_compete_data.groups && Object.keys(auto_compete_data.groups).length) {
                    for(let k in auto_compete_data.groups) {
                        let group = auto_compete_data.groups[k];

                        let group_html = '';

                        let groupItems = items[k];

                        if(groupItems && groupItems.length) {
                            for(let item of groupItems) {
                                if (item.token in section_data.items) {
                                    continue;
                                }

                                let location_html = '';

                                if(item.city) {
                                    if(item.state) {
                                        location_html = `<div class="location">${item.city}, ${item.state}</div>`;
                                    } else {
                                        location_html = `<div class="location">${item.city}</div>`;
                                    }
                                }

                                group_html += `<div class="item" data-token="${item.token}">
                                                   ${location_html}
                                                   <div class="name">${item.name}</div>
                                              </div>`;
                            }

                            if(group_html) {
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

                            items_html += `<div class="item" data-token="${item.token}">${item.name}</div>`;
                        }
                    }
                }

                if (!items_html) {
                    items_html = `<div class="no-results">No results</div>`;
                }

                list.innerHTML = items_html;

                befriend.me.toggleAutoComplete(search_container_el, true);

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
    updateCollapsed: async function () {
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

            befriend.me.updateSectionHeight(el, collapse, false, true);
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
    transitionSecondary: function (secondary_el, show) {
        let options_el = secondary_el.querySelector('.options');

        if (show) {
            addClassEl('open', secondary_el);

            setElHeightDynamic(options_el);
        } else {
            removeClassEl('open', secondary_el);

            options_el.style.removeProperty('height');
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
            }, 300);
        }

        if (!skip_save) {
            befriend.me.data.sections.collapsed[section_key] = collapse;

            befriend.user.setLocal('me.sections.collapsed', befriend.me.data.sections.collapsed);
        }

        await rafAwait();

        section_container.style.removeProperty('transition');
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

        if (show) {
            addClassEl(befriend.classes.autoCompleteMe, el);
            addClassEl('autocomplete-shown', befriend.els.me);
        } else {
            removeClassEl(befriend.classes.autoCompleteMe, el);
            removeClassEl('autocomplete-shown', befriend.els.me);
        }
    },
    toggleAutoCompleteSelect: function (el, show) {
        if (!el) {
            el = befriend.els.me.querySelector('.search-container .select-container.open');
        }

        let section_key = el.closest('.section').getAttribute('data-key');

        if (show) {
            let input = el.querySelector('.select-input');
            input.value = '';
            input.focus();
            befriend.me.updateAutoCompleteSelectList(section_key);

            //show el
            addClassEl('open', el);
        } else {
            removeClassEl('open', el);
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

        if (!section_data || !section_data.autoComplete || !section_data.autoComplete.filterList) {
            return;
        }

        let list_items = section_data.autoComplete.filterList;

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
    sectionItemHtml: function (section_key, token) {
        let section_data = befriend.me.getActiveSection(section_key);

        let item = section_data.items[token];

        let secondary = '';
        let options = '';

        //current selected
        if (section_data.data && section_data.data.secondary) {
            let unselected = '';

            if (!item.secondary) {
                unselected = 'unselected';
            }

            for (let option of section_data.data.secondary) {
                let selected = item.secondary === option ? 'selected' : '';

                options += `<div class="option ${selected}" data-option="${option}">${option}</div>`;
            }

            secondary = `<div class="secondary ${unselected}" data-value="${item.secondary ? item.secondary : ''}">
                                                    <div class="current-selected">${item.secondary ? item.secondary : section_data.data.unselectedStr}</div>
                                                    <svg class="arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 82.1 43.2"><path d="M41.1,43.2L0,2.2,2.1,0l39,39L80,0l2.1,2.2-41,41Z"/></svg>
                                                    <div class="options">${options}</div>
                                                </div>`;
        }

        return `<div class="item mine" data-token="${token}">
                                                            <div class="name">${item.name}</div>
                                                            ${secondary}
                                                            <div class="remove">
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 121.805 14.619"><path d="M7.308,14.619h107.188c4.037,0,7.309-3.272,7.309-7.31s-3.271-7.309-7.309-7.309H7.308C3.272.001,0,3.273,0,7.31s3.272,7.309,7.308,7.309Z"/></svg>
                                                            </div>
                                                        </div>`;
    },
    events: {
        init: function () {
            return new Promise(async (resolve, reject) => {
                befriend.me.events.onAddSectionBtn();
                befriend.me.events.onSelectAvailableSection();
                befriend.me.events.confirmAction();

                resolve();
            });
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
        onSelectAvailableSection: function () {
            //add selected available section
            let options = befriend.els.meSectionOptions.getElementsByClassName('option');

            for (let i = 0; i < options.length; i++) {
                let option = options[i];

                if (option._listener) {
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

                    let minChars = isNumeric(sectionAutocomplete.minChars) ? sectionAutocomplete.minChars : befriend.me.autoComplete.minChars;

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

                    btn.addEventListener('click', function (e) {
                        let category = this.getAttribute('data-category');

                        let section = this.closest('.section');

                        let section_btns = section.getElementsByClassName('category-btn');

                        removeElsClass(section_btns, 'active');

                        addClassEl('active', this);

                        let section_key = section.getAttribute('data-key');
                        let section_data = befriend.me.getActiveSection(section_key);
                        let category_items_html = ``;

                        if (category === 'mine') {
                            if (!Object.keys(section_data.items).length) {
                                //no-items
                                addClassEl('no-items', section.querySelector('.items'));
                            } else {
                                for (let token in section_data.items) {
                                    let item_html = befriend.me.sectionItemHtml(section_key, token);

                                    category_items_html += item_html;
                                }
                            }
                        } else {
                            //remove no-items
                            removeClassEl('no-items', section.querySelector('.items'));

                            for (let item of section_data.data.options) {
                                if (item.category === category) {
                                    if (!(item.token in section_data.items)) {
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

            for (let i = 0; i < items.length; i++) {
                let item = items[i];

                if (!item._listener) {
                    item._listener = true;

                    item.addEventListener('click', function (e) {
                        if (elHasClass(item, 'mine')) {
                            let open_secondary_el =
                                befriend.els.me.querySelector('.secondary.open');

                            if (open_secondary_el && !e.target.closest('.secondary')) {
                                befriend.me.transitionSecondary(open_secondary_el, false);
                            }

                            return false;
                        }

                        let section = this.closest('.section');
                        let section_key = section.getAttribute('data-key');
                        let token = this.getAttribute('data-token');

                        try {
                            item.parentNode.removeChild(item);
                        } catch (e) {}

                        try {
                            befriend.me.addSectionItem(section_key, token);
                        } catch (e) {
                            console.error(e);
                        }
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

                remove_el.addEventListener('click', function (e) {
                    let section = this.closest('.section');
                    let section_key = section.getAttribute('data-key');
                    let item = this.closest('.item');
                    let token = item.getAttribute('data-token');

                    //dom
                    try {
                        item.parentNode.removeChild(item);
                    } catch (e) {
                        console.error(e);
                    }

                    //data/server
                    befriend.me.removeSectionItem(section_key, token);

                    //ui
                    let section_data = befriend.me.getActiveSection(section_key);

                    if (!Object.keys(section_data.items).length) {
                        addClassEl('no-items', section.querySelector('.items'));
                    }

                    befriend.me.updateSectionHeight(section, elHasClass(section, 'collapsed'));
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

                        if (e.target.closest('.options')) {
                            return false;
                        }

                        //hide all except current
                        for (let i2 = 0; i2 < secondaries.length; i2++) {
                            let secondary_2 = secondaries[i2];

                            if (el !== secondary_2) {
                                befriend.me.transitionSecondary(secondary_2, false);
                            }
                        }

                        if (elHasClass(el, 'open')) {
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

            for (let i = 0; i < secondaries.length; i++) {
                let secondary = secondaries[i];

                let options = secondary.getElementsByClassName('option');

                for (let i2 = 0; i2 < options.length; i2++) {
                    let option = options[i2];

                    if (!option._listener) {
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
                            let active_section = befriend.me.getActiveSection(section_key);

                            let item = active_section.items[item_token];

                            let prev_option_value = item.secondary;

                            if (prev_option_value !== option_value) {
                                item.secondary = option_value;

                                //server
                                try {
                                    await befriend.auth.put(`/me/sections/item`, {
                                        section_key: section_key,
                                        section_item_id: item.id,
                                        secondary: option_value,
                                    });
                                } catch (e) {
                                    console.error(e);
                                }
                            }
                        });
                    }
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
                    let token = el.getAttribute('data-token');

                    befriend.me.toggleAutoComplete(null, false);

                    befriend.me.addSectionItem(section_key, token);

                    el.closest('.search-container').querySelector('.search-input').value = '';
                });
            }
        },
    },
};
