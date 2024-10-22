befriend.user = {
    local: {
        key: 'user.json',
        data: {}
    },
    person: {
        token: null
    },
    login: {
        token: null
    },
    init: function () {
        return new Promise(async (resolve, reject) => {
            befriend.user.loadLocal();

            let localData = befriend.user.getLocal();

            if(localData.person && localData.person.token) {
                befriend.user.person.token = localData.person.token;
            }

            if(localData.login && localData.login.token) {
                befriend.user.login.token = localData.login.token;
            }

            resolve();
        });
    },
    loadLocal: function () {
        let data = window.localStorage.getItem(befriend.user.local.key);

        if(data) {
            try {
                 data = JSON.parse(data);
                 befriend.user.local.data = data;
            } catch(e) {
                console.error(e);
            }
        }
    },
    getLocal: function () {
        return befriend.user.local.data;
    },
    saveLocal: function () {
        window.localStorage.setItem(befriend.user.local.key, JSON.stringify(befriend.user.local.data));
    },
    setPersonToken: function (token) {
        befriend.user.person.token = token;

        let data = befriend.user.getLocal();

        if(!('person' in data)) {
            data.person = {};
        }

        data.person.token = token;

        befriend.user.saveLocal();
    },
    setLoginToken: function (token) {
        befriend.user.login.token = token;

        let data = befriend.user.getLocal();

        if(!('login' in data)) {
            data.login = {};
        }

        data.login.token = token;

        befriend.user.saveLocal();
    }
};