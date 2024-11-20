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
    getCategoryOptions: function (endpoint, category_token) {
        return new Promise(async (resolve, reject) => {
            try {
                 let r = await befriend.auth.get(endpoint, {
                     category_token
                 });

                 resolve(r.data);
            } catch(e) {
                console.error(e);
                return reject();
            }
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
    getRowColsClass: function (section_data, category) {
        if (section_data?.data?.styles?.rowCols) {
            if (typeof section_data.data.styles.rowCols === 'object') {
                return category === 'mine' ?
                    section_data.data.styles.rowCols.my || section_data.data.styles.rowCols.default :
                    section_data.data.styles.rowCols.default;
            }
            return section_data.data.styles.rowCols;
        }
        return '';
    },
    addSection: async function (key, on_update, skip_save) {
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

            let table_data = section_data.data.tables ? section_data.data.tables[0] : null;

            let autocomplete_html = '';
            let categories_html = '';
            let tabs_html = '';
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
                    categories_html = `<div class="category-btn mine active" data-category="mine">
                                                ${section_data.data.myStr}
                                        </div>`;

                    for (let category of section_data.data.categories.options) {
                        let heading_html = category.heading ? `<div class="heading">${category.heading}</div>` : '';

                        let data_category = `data-category="${category.name}"`;

                        let data_category_token = '';

                        if(category.token) {
                            data_category_token = `data-category-token="${category.token}"`;
                        }

                        let data_table_key = '';

                        if(category.table_key) {
                            data_table_key = `data-category-table="${category.table_key}"`;
                        }

                        categories_html += `<div class="category-btn ${heading_html ? 'w-heading' : ''}" ${data_category} ${data_table_key} ${data_category_token}>
                                            ${heading_html}
                                            <div class="name">${category.name}</div>
                                        </div>`;
                    }

                    categories_html = `<div class="categories-container">
                                        <div class="category-filters">${categories_html}</div>
                                    </div>`;
                }

                //tabs
                if(section_data.data?.tabs?.length) {
                    for(let i = 0; i < section_data.data.tabs.length; i++) {
                        let tab = section_data.data.tabs[i];

                        tabs_html += `<div class="tab ${i === 0 ? 'active': ''}" data-key="${tab.key}">${tab.name}</div>`
                    }

                    tabs_html = `<div class="tabs">${tabs_html}</div>`;
                }

                //items
                if (Object.keys(section_data.items).length) {
                    for (let token in section_data.items) {
                        //filter by tab
                        let item = section_data.items[token];

                        if(tabs_html) {
                            let active_tab = section_data.data.tabs[0];

                            if(active_tab && item.table_key !== active_tab.key) {
                                continue;
                            }
                        }

                        let item_html = befriend.me.sectionItemHtml(key, table_data?.name, item);

                        items_html += item_html;
                    }
                }
            }

            //initialize collapsed if saved
            if (befriend.me.data.sections.collapsed[key]) {
                section_collapsed = 'collapsed';
                section_height = '0';
            }

            let has_tabs = '';

            let has_categories = '';

            if(tabs_html) {
                has_tabs = 'w-tabs';
            }

            if(categories_html) {
                has_categories = 'w-categories';
            }

            let html = `<div class="section my-items ${key} ${section_collapsed} ${has_categories} ${has_tabs} ${items_html ? '' : 'no-items'}" data-key="${key}" data-table-key="${table_data?.name ? table_data.name : ''}" style="${section_height}">
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
                                    <div class="items-container">
                                        <div class="items ${befriend.me.getRowColsClass(section_data, 'mine')}">
                                            ${items_html }
                                        </div>
                                        <div class="no-items">No Items</div>
                                    </div>
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
            befriend.me.events.onSectionTabs();
            befriend.me.events.onSectionActions();
            befriend.me.events.autoComplete();
            befriend.me.events.autoCompleteFilterList();
            befriend.me.events.onActionSelect();
            befriend.me.events.onUpdateSectionHeight();
            befriend.me.events.onRemoveItem();
            befriend.me.events.onFavorite();
            befriend.me.events.onOpenSecondary();
            befriend.me.events.onSelectSecondary();

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
                let section_el = befriend.me.getSectionElByKey(section_key);

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
                    table_key: befriend.me.getSectionTableKey(section_key),
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

                //select first category
                let category_btn_first = section_el.querySelector('.category-btn');

                if (category_btn_first) {
                    fireClick(category_btn_first);
                }

                //select corresponding tab if
                let tab_els = section_el.querySelectorAll('.section-container .tab');

                if(tab_els && r.data.table_key) {
                    for(let i = 0; i < tab_els.length; i++) {
                        let tab_el = tab_els[i];

                        if(tab_el.getAttribute('data-key') === r.data.table_key) {
                            fireClick(tab_el);
                            break;
                        }
                    }
                }

                //re-add section if no categories
                if(!category_btn_first) {
                    befriend.me.addSection(section_key, true);
                }
            } catch (e) {
                console.error(e);
            }

            resolve();
        });
    },
    removeSectionItem: function (section_key, item_token) {
        return new Promise(async (resolve, reject) => {
            let section_data = befriend.me.getActiveSection(section_key);

            let item = section_data.items[item_token];

            let table_key = item.table_key || befriend.me.getSectionTableKey(section_key);

            delete section_data.items[item_token];

            try {
                await befriend.auth.put(`/me/sections/item`, {
                    section_key: section_key,
                    table_key: table_key,
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
                befriend.me.addSection(key, false, true);
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
                befriend.me.toggleAutoComplete(null);
                return resolve();
            }

            try {
                let category_name = null, category_token = null, table_key = null;

                let section_el = befriend.me.getSectionElByKey(section_key);

                let endpoint =
                    befriend.me.getSectionAutoComplete(section_key).endpoint;

                let filterId =
                    befriend.me.autoComplete.selected.filterList[section_key]?.item?.id || null;

                let active_category = section_el.querySelector('.category-btn.active');

                if(active_category) {
                    category_name = active_category.getAttribute('data-category') || null;
                    category_token = active_category.getAttribute('data-category-token');
                    table_key = active_category.getAttribute('data-category-table') || befriend.me.getSectionTableKey(section_key) || null;
                }

                const r = await befriend.auth.get(endpoint, {
                    search: search_value,
                    filterId: filterId,
                    location: befriend.location.device || null,
                    category: {
                        name: category_name,
                        token: category_token,
                        table: table_key
                    }
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
    transitionSecondaryT: null,
    transitionSecondary: function (secondary_el, show) {
        clearTimeout(this.transitionSecondaryT);

        let options_el = secondary_el.querySelector('.options');

        let items_container_el = secondary_el.closest('.items-container');

        items_container_el.style.setProperty('overflow-y', 'initial');

        if (show) {
            addClassEl('secondary-open', secondary_el.closest('.section'));

            setElHeightDynamic(options_el);
        } else {
            removeClassEl('secondary-open', secondary_el.closest('.section'));

            options_el.style.removeProperty('height');
        }

        this.transitionSecondaryT = setTimeout(function () {
            items_container_el.style.removeProperty('overflowY');
        }, 300);
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
    sectionItemHtml: function (section_key, table_key, item) {
        let section_data = befriend.me.getActiveSection(section_key);
        let table_data = section_data.data.tables?.find(item => item.name === table_key);

        let favorite_html = '';
        let secondary_html = '';
        let secondary_options_html = '';

        let secondary_options = section_data.data?.secondary?.options;

        let isFavorable = table_data?.isFavorable;

        //favorable
        if(isFavorable) {
            favorite_html = `<div class="favorite heart">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 439.9961">
                                  <path class="outline" d="M240,422.9023c-29.3828-16.2148-224-129.4961-224-282.9023,0-66.0547,54.1992-124,116-124,41.8672.0742,80.4609,22.6602,101.0312,59.1289,1.5391,2.3516,4.1602,3.7656,6.9688,3.7656s5.4297-1.4141,6.9688-3.7656c20.5703-36.4688,59.1641-59.0547,101.0312-59.1289,61.8008,0,116,57.9453,116,124,0,153.4062-194.6172,266.6875-224,282.9023Z"/>
                                </svg>
                            </div>`;
        }

        //secondary
        if (secondary_options) {
            let unselected = '';

            if (!item.secondary) {
                unselected = 'unselected';
            }

            for (let option of secondary_options) {
                let selected = item.secondary === option ? 'selected' : '';

                secondary_options_html += `<div class="option ${selected}" data-option="${option}">${option}</div>`;
            }

            secondary_html = `<div class="secondary ${unselected}" data-value="${item.secondary ? item.secondary : ''}">
                                                    <div class="current-selected">${item.secondary ? item.secondary : section_data.data?.secondary?.unselectedStr}</div>
                                                    <svg class="arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 82.1 43.2"><path d="M41.1,43.2L0,2.2,2.1,0l39,39L80,0l2.1,2.2-41,41Z"/></svg>
                                                    <div class="options">${secondary_options_html}</div>
                                                </div>`;
        }

        return `<div class="item mine ${isFavorable ? 'favorable': ''} ${item.is_favorite ? 'is-favorite' : ''}" data-token="${item.token}" data-table-key="${item.table_key ? item.table_key : ''}">
                                                            <div class="content">
                                                                    <div class="rank">${isNumeric(item.favorite_position) ? item.favorite_position : ''}</div>
                                                                    <div class="name-favorite">
                                                                        ${favorite_html}
                                                                        <div class="name">${item.name}</div>
                                                                    </div>
                                                                
                                                                    ${secondary_html}
                                                                    <div class="remove">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 121.805 14.619"><path d="M7.308,14.619h107.188c4.037,0,7.309-3.272,7.309-7.31s-3.271-7.309-7.309-7.309H7.308C3.272.001,0,3.273,0,7.31s3.272,7.309,7.308,7.309Z"/></svg>
                                                                    </div>
                                                            </div>
                                                        </div>`;
    },
    updateSectionItems: function(section_el, filter_params = {}) {
        return new Promise(async (resolve, reject) => {
            try {
                let section_key = section_el.getAttribute('data-key');
                let section_data = befriend.me.getActiveSection(section_key);
                let table_key = befriend.me.getSectionTableKey(section_key);
                let items_html = '';

                // Extract filter parameters
                const {
                    category = '',
                    category_token = null,
                    category_table_key = '',
                    tab_key = null
                } = filter_params;

                // Update table key if provided
                if(category_table_key) {
                    section_el.setAttribute('data-table-key', category_table_key);
                }

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

                    if(items_filtered.length) {
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
                            items_html += befriend.me.sectionItemHtml(section_key, table_key, item);
                        }

                        removeClassEl('no-items', section_el);
                    } else {
                        addClassEl('no-items', section_el);
                    }
                } else {
                    removeClassEl('my-items', section_el);
                    removeClassEl('no-items', section_el);

                    // Handle category-based options
                    if (category_token) {
                        let category_options = befriend.me.data.categories[category_token];

                        try {
                            if (!category_options) {
                                befriend.toggleSpinner(true);
                                category_options = await befriend.me.getCategoryOptions(
                                    section_data.data.categories.endpoint,
                                    category_token
                                );

                                befriend.toggleSpinner(false);

                                befriend.me.data.categories[category_token] = category_options;
                            }

                            for (let item of category_options.items) {
                                if (!(item.token in section_data.items)) {
                                    let label = '';

                                    if(item.label) {
                                        label = `<div class="label">${item.label}</div>`;
                                    }

                                    items_html += `<div class="item" data-token="${item.token}">
                                                ${label}
                                                <div class="name">${item.name}</div>
                                            </div>`;
                                }
                            }
                        } catch(e) {
                            console.error('Error fetching category options:', e);
                        }
                    } else {
                        // Filter options by category
                        for (let item of section_data.data.options) {
                            if (item.category?.toLowerCase() === category.toLowerCase() &&
                                !(item.token in section_data.items)) {
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

                //update row-cols class
                let rowColCls = befriend.me.getRowColsClass(section_data, category);

                //remove previous cls
                for(let i = 0; i < section_items_el.classList.length; i++) {
                    let cls = section_items_el.classList[i];

                    if(cls.startsWith('col')) {
                        removeClassEl(cls, section_items_el);
                    }
                }

                addClassEl(rowColCls, section_items_el);

                // Reattach event handlers
                befriend.me.events.onSelectItem();
                befriend.me.events.onRemoveItem();
                befriend.me.events.onFavorite();
                befriend.me.events.onOpenSecondary();
                befriend.me.events.onSelectSecondary();

                // Update UI height
                befriend.me.updateSectionHeight(section_el, elHasClass(section_el, 'collapsed'));

                resolve();
            } catch(e) {
                console.error('Error updating section items:', e);
                reject(e);
            } finally {
                befriend.toggleSpinner(false);
            }
        });
    },
    getFavoriteHighestPosition: function(section_key, table_key) {
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
    reorderFavoritePositions: function(section_key, table_key) {
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
        for(let index = 0; index < reorderedItems.length; index++) {
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
        for(let item of Array.from(item_els)) {
            let rect = item.getBoundingClientRect();
            positions[item.getAttribute('data-token')] = {
                top: rect.top,
                height: rect.height,
                left: rect.left,
                width: rect.width
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
                    item_el.querySelector('.rank').innerHTML = updatedPositions[token].favorite_position;
                }
            }
        }
    },
    calculateTargetPosition: (item_el, items_el, oldPositions, newOrder) => {
        // Find item's position in new order
        const itemToken = item_el.getAttribute('data-token');
        const itemIndex = newOrder.findIndex(el => el.getAttribute('data-token') === itemToken);

        const scrollContainer = items_el.closest('.items-container');

        // Get container dimensions
        const containerRect = scrollContainer.getBoundingClientRect();
        const containerScrollTop = scrollContainer.scrollTop;

        // Calculate new position based on grid layout
        const itemHeight = oldPositions[itemToken].height;
        const gridGap = befriend.variables.me_items_gap_tb;
        const targetTop = (itemIndex * (itemHeight + gridGap));

        // Determine if scroll is needed
        const containerVisibleHeight = containerRect.height;
        const scrollNeeded = targetTop < containerScrollTop ||
            (targetTop + itemHeight) > (containerScrollTop + containerVisibleHeight);

        if (scrollNeeded) {
            return {
                element: scrollContainer,
                scrollTop: targetTop - (containerVisibleHeight - itemHeight) / 2
            }
        }

        return null;
    },
    animateItemTransitions: (itemsArray, items_el, initialPositions, favorited_item_el) => {
        // Remove transition temporarily
        itemsArray.forEach(item => {
            item.style.transition = 'none';
        });

        // Calculate target scroll position before reordering
        let scrollTarget = null;
        if (favorited_item_el) {
            scrollTarget = befriend.me.calculateTargetPosition(
                favorited_item_el,
                items_el,
                initialPositions,
                itemsArray
            );
        }

        // Reposition items in DOM
        itemsArray.forEach(item => {
            items_el.appendChild(item);
        });

        // Force reflow to ensure transitions will work
        void items_el.offsetHeight;

        // Apply transitions from old positions to new positions
        requestAnimationFrame(() => {
            itemsArray.forEach(item => {
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
                    behavior: 'smooth'
                });
            }
        });

        // Clean up transitions after animation
        setTimeout(() => {
            itemsArray.forEach(item => {
                item.style.transition = '';
                item.style.transform = '';
            });
        }, 300);
    },
    events: {
        reorder: {
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
                duration: 250 // ms for scroll animation
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

                return allItems.filter(el => !elHasClass(el, 'is-draggable'));
            },
            setItemsGap: function (idleItems) {
                if (idleItems.length <= 1) {
                    this.itemsGap = 0;
                    return;
                }

                const item1Rect = idleItems[0].getBoundingClientRect();
                const item2Rect = idleItems[1].getBoundingClientRect();
                this.itemsGap = Math.abs(item1Rect.bottom - item2Rect.top);
            },
            initReorderItem: function (item) {
                // removeClassEl('is-idle', item);
                addClassEl('is-draggable', item);
            },
            initItemsState: function (reorderEl, idleItems) {
                for(let i = 0; i < idleItems.length; i++) {
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
                for(let item of this.getIdleItems(reorderEl.parentElement)) {
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
                for(let item of this.getIdleItems(reorderEl.parentElement)) {
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

                for(let i = 0; i < allItems.length; i++) {
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
                        if(prevIndex === index) {
                            skipUpdate = true;
                            break;
                        }
                        reorderedItems[index] = reorderEl;
                    }
                }

                // Clean up temporary attributes
                for(let item of this.getIdleItems(itemsContainer)) {
                    delete item.dataset.isAbove;
                    delete item.dataset.isToggled;
                    item.style.transition = 'none';
                    item.style.transform = '';

                    requestAnimationFrame(() => {
                        item.style.removeProperty('transition');
                    });
                }

                if(skipUpdate) {
                    return requestAnimationFrame(() => {
                        removeClassEl('is-draggable', reorderEl);
                        reorderEl.style.transform = '';
                    });
                }

                // Update DOM and positions
                const reorderTransform = reorderEl.style.transform;
                const transformValues = reorderTransform.replace('translate(', '').replace(')', '').split(',');
                const prevTransform = {
                    x: parseInt(transformValues[0]),
                    y: parseInt(transformValues[1])
                };

                const reorderedBoxBefore = reorderEl.getBoundingClientRect();

                // Reorder items in DOM
                for(let item of reorderedItems) {
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

                for(let i = 0; i < item_els.length; i++) {
                    let item_el = item_els[i];

                    const token = item_el.getAttribute('data-token');
                    const item = active_section.items[token];
                    const newPosition = i + 1;

                    if (item.favorite_position !== newPosition) {
                        item.favorite_position = newPosition;
                        positions[token] = {
                            id: item.id,
                            token: token,
                            favorite_position: newPosition
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
                                reorder: positions
                            }
                        });
                    } catch (e) {
                        console.error('Error updating favorite positions:', e);
                    }
                }
            }
        },
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
        onSectionCategory: function() {
            let category_btns = befriend.els.me.getElementsByClassName('category-btn');

            for (let i = 0; i < category_btns.length; i++) {
                let btn = category_btns[i];

                if (!btn._listener) {
                    btn._listener = true;

                    btn.addEventListener('click', async function(e) {
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
                            tab_key: section_el.querySelector('.tab.active')?.getAttribute('data-key')
                        };

                        // Update items
                        try {
                            await befriend.me.updateSectionItems(section_el, filter_params);
                        } catch(e) {
                            console.error(e)
                        }
                    });
                }
            }
        },
        onSectionTabs: function() {
            let tab_els = befriend.els.me.querySelectorAll('.section-container .tab');

            for (let i = 0; i < tab_els.length; i++) {
                let el = tab_els[i];

                if (!el._listener) {
                    el._listener = true;

                    el.addEventListener('click', async function(e) {
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
                            category_table_key: active_category?.getAttribute('data-category-table') || '',
                            tab_key: this.getAttribute('data-key')
                        };

                        // Update items
                        try {
                            await befriend.me.updateSectionItems(section_el, filter_params);
                        } catch(e) {
                            console.error(e)
                        }
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
                            position: null
                        };

                        if (item.is_favorite) {
                            // Remove favorite and reorder remaining favorites
                            item.is_favorite = false;
                            item.favorite_position = null;
                            favorite_data.reorder = updatedPositions = befriend.me.reorderFavoritePositions(section_key, table_key);
                        }

                        // Update server with both delete and reorder
                        try {
                            await befriend.auth.put(`/me/sections/item`, {
                                section_key: section_key,
                                table_key: table_key,
                                section_item_id: item.id,
                                is_delete: true,
                                favorite: favorite_data
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
                            let active_tab = section_el.querySelector('.section-container .tab.active');
                            if (active_tab && item.table_key && item.table_key !== active_tab.getAttribute('data-key')) {
                                continue;
                            }

                            let remaining_el = section_el.querySelector(`.item[data-token="${token}"]`);
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
                            let itemsArray = befriend.me.sortItemsByFavorite(items_filtered, section_data);
                            befriend.me.animateItemTransitions(itemsArray, items_el, initialPositions, null);

                            // Update rank displays for remaining favorites
                            if (updatedPositions) {
                                for (let token in updatedPositions) {
                                    let remaining_el = section_el.querySelector(`.item[data-token="${token}"]`);
                                    if (remaining_el) {
                                        let rank_el = remaining_el.querySelector('.rank');
                                        rank_el.innerHTML = updatedPositions[token].favorite_position;
                                    }
                                }
                            }

                            removeClassEl('no-items', section_el);
                        } else {
                            addClassEl('no-items', section_el);
                        }

                        // Update section height after removing the last item
                        befriend.me.updateSectionHeight(section_el, elHasClass(section_el, 'collapsed'));
                    } catch(e) {
                        console.error(e);
                    } finally {
                        befriend.toggleSpinner(false);
                    }
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
        onFavorite: function () {
            let meReorder = befriend.me.events.reorder;

            let favorite_els = befriend.els.me.getElementsByClassName('favorite');

            for (let i = 0; i < favorite_els.length; i++) {
                let favorite_el = favorite_els[i];

                if(!favorite_el._listener) {
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
                        let table_key = item.table_key || befriend.me.getSectionTableKey(section_key);

                        //toggle favorite state
                        item.is_favorite = !item.is_favorite;
                        toggleElClass(this.closest('.item'), 'is-favorite');

                        // Get initial positions before any changes
                        let initialPositions = befriend.me.getInitialPositions(item_els);

                        // Handle favorite data updates
                        let updatedPositions;
                        let favorite_data = {
                            active: item.is_favorite
                        };

                        if(item.is_favorite) {
                            // Adding favorite - get highest position and add 1
                            let highest = befriend.me.getFavoriteHighestPosition(section_key, table_key);
                            item.favorite_position = highest + 1;
                            favorite_data.position = item.favorite_position;
                        } else {
                            // Removing favorite - reorder remaining favorites
                            item.favorite_position = null;
                            favorite_data.position = null;
                            favorite_data.reorder = updatedPositions = befriend.me.reorderFavoritePositions(section_key, table_key);
                        }

                        // Update rank displays
                        befriend.me.updateRankDisplays(section_el, item_el, item, updatedPositions);

                        // Sort and animate items
                        let itemsArray = Array.from(item_els);
                        itemsArray = befriend.me.sortItemsByFavorite(itemsArray, active_section);

                        befriend.me.animateItemTransitions(itemsArray, items_el, initialPositions,
                            item.is_favorite ? item_el : null
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

                if(!elHasClass(item_el, 'favorable')) {
                    continue;
                }

                if(item_el._reorder_listener) {
                    continue;
                }

                item_el._reorder_listener = true;

                // Track touch move before drag starts
                item_el.addEventListener('touchmove', function(e) {
                    if (meReorder.ip) {
                        e.preventDefault();
                        return;
                    }

                    if(!initialTouchY) {
                        return;
                    }

                    const touch = e.touches[0];
                    const moveDistance = Math.abs(touch.clientY - initialTouchY);

                    if (moveDistance > MOVE_THRESHOLD) {
                        hasMoved = true;
                        clearTimeout(touchTimeout);
                        initialTouchY = null;
                    }
                }, {
                    passive: false,
                });

                item_el.addEventListener('touchstart', function(e) {
                    if (!elHasClass(item_el, 'is-favorite')) return;

                    // Don't start drag if clicking the heart icon
                    const target = e.target;
                    if (target.closest('.heart') || target.closest('.remove')) {
                        return;
                    }

                    // Reset tracking variables
                    hasMoved = false;
                    initialTouchY = e.touches[0].clientY;

                    // Clear any existing timeout
                    clearTimeout(touchTimeout);

                    touchTimeout = setTimeout(function() {
                        if(!hasMoved) {
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
                                scrollContainer.style.overflow = 'hidden';
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

                                let table_key = item.table_key || befriend.me.getSectionTableKey(section_key);

                                //server
                                try {
                                    await befriend.auth.put(`/me/sections/item`, {
                                        section_key: section_key,
                                        table_key: table_key,
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
