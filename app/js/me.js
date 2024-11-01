befriend.me = {
    data: {
        me: null,
        sections: {
            all: null,
            options: null,
            active: null
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
            } catch(e) {
                console.error(e);
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

                    console.log(section_data.items)

                    if(section_data.items) {
                        for(let token in section_data.items) {
                            let item = section_data.items[token];

                            items += `<div class="item" data-id="${item.id}">
                                        ${item.name}
                                    </div>`;
                        }
                    }
                }

                let html = `<div class="section" data-key="${key}">
                                <div class="section-top">
                                    <div class="icon">${option_data.icon}</div>
                                    <div class="title">${option_data.section_name}</div>
                                    <div class="delete"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 346.8033 427.0013"><path d="M232.4016,154.7044c-5.5234,0-10,4.4766-10,10v189c0,5.5195,4.4766,10,10,10s10-4.4805,10-10v-189c0-5.5234-4.4766-10-10-10Z"/><path d="M114.4016,154.7044c-5.5234,0-10,4.4766-10,10v189c0,5.5195,4.4766,10,10,10s10-4.4805,10-10v-189c0-5.5234-4.4766-10-10-10Z"/><path d="M28.4016,127.1224v246.3789c0,14.5625,5.3398,28.2383,14.668,38.0508,9.2852,9.8398,22.207,15.4258,35.7305,15.4492h189.2031c13.5273-.0234,26.4492-5.6094,35.7305-15.4492,9.3281-9.8125,14.668-23.4883,14.668-38.0508V127.1224c18.543-4.9219,30.5586-22.8359,28.0781-41.8633-2.4844-19.0234-18.6914-33.2539-37.8789-33.2578h-51.1992v-12.5c.0586-10.5117-4.0977-20.6055-11.5391-28.0312C238.4212,4.0482,228.3118-.0846,217.8001.0013h-88.7969c-10.5117-.0859-20.6211,4.0469-28.0625,11.4688-7.4414,7.4258-11.5977,17.5195-11.5391,28.0312v12.5h-51.1992c-19.1875.0039-35.3945,14.2344-37.8789,33.2578-2.4805,19.0273,9.5352,36.9414,28.0781,41.8633ZM268.0032,407.0013H78.8001c-17.0977,0-30.3984-14.6875-30.3984-33.5v-245.5h250v245.5c0,18.8125-13.3008,33.5-30.3984,33.5ZM109.4016,39.5013c-.0664-5.207,1.9805-10.2188,5.6758-13.8945,3.6914-3.6758,8.7148-5.6953,13.9258-5.6055h88.7969c5.2109-.0898,10.2344,1.9297,13.9258,5.6055,3.6953,3.6719,5.7422,8.6875,5.6758,13.8945v12.5H109.4016v-12.5ZM38.2024,72.0013h270.3984c9.9414,0,18,8.0586,18,18s-8.0586,18-18,18H38.2024c-9.9414,0-18-8.0586-18-18s8.0586-18,18-18Z"/><path d="M173.4016,154.7044c-5.5234,0-10,4.4766-10,10v189c0,5.5195,4.4766,10,10,10s10-4.4805,10-10v-189c0-5.5234-4.4766-10-10-10Z"/></svg></div>
                                </div>
                                
                                <div class="section-container">
                                    ${categories}
                                    ${autocomplete}
                                    ${secondary}
                                    <div class="items">${items}</div>
                                </div>
                            </div>`;

                sections_el.insertAdjacentHTML('beforeend', html);

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
                await befriend.auth.post(`/me/sections/item`, {
                    section_key: section_key,
                    item_token: item_token
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
    isSectionOptionsShown: function () {
        return elHasClass(befriend.els.meSectionOptions, 'open');
    },
    toggleSectionOptions: function (show) {
        if(show) {
            addClassEl('open', befriend.els.meSectionOptions);
        } else {
            removeClassEl('open', befriend.els.meSectionOptions);
        }
    },
    events: {
        init: function () {
            return new Promise(async (resolve, reject) => {
                befriend.me.events.onAddSection();

                resolve();
            });
        },
        onAddSection: function () {
            //open
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

            //add
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
        onSectionCategory: function () {
            let category_btns = befriend.els.me.getElementsByClassName('category-btn');

            for(let i = 0; i < category_btns.length; i++) {
                let btn = category_btns[i];

                if(!btn._listener) {
                    btn._listener = true;

                    btn.addEventListener('click', function (e) {
                        e.preventDefault();
                        e.stopPropagation();

                        let category = this.getAttribute('data-category');

                        let section = this.closest('.section');

                        let section_btns = section.getElementsByClassName('category-btn');

                        removeElsClass(section_btns, 'active');

                        addClassEl('active', this);

                        let section_key = section.getAttribute('data-key');
                        let section_data = befriend.me.data.sections.active[section_key];
                        let category_items_html = ``;

                        if(category === 'mine') {
                            for(let token in section_data.items) {
                                let item = section_data.items[token];

                                category_items_html += `<div class="item" data-id="${item.id}">
                                                            ${item.name}
                                                        </div>`;
                            }
                        } else {
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

                        befriend.me.events.onSelectItem();
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
                        e.preventDefault();
                        e.stopPropagation();

                        let section = this.closest('.section');
                        let section_key = section.getAttribute('data-key');

                        let token = this.getAttribute('data-token');

                        try {
                            befriend.me.addSectionItem(section_key, token);
                        } catch(e) {
                            console.error(e);
                        }
                    });
                }
            }
        }
    }
};