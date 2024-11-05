befriend.user = {
    local: {
        key: 'user.json',
        data: {},
    },
    device: {
        token: null,
    },
    person: {
        token: null,
    },
    login: {
        token: null,
    },
    init: function () {
        return new Promise(async (resolve, reject) => {
            befriend.user.loadLocal();

            let localData = befriend.user.getLocal();

            if (localData.person && localData.person.token) {
                befriend.user.person.token = localData.person.token;
            }

            if (localData.login && localData.login.token) {
                befriend.user.login.token = localData.login.token;
            }

            if (localData.device && localData.device.token) {
                befriend.user.device.token = localData.device.token;
            }

            if (localData.me) {
                if (localData.me.sections && localData.me.sections.collapsed) {
                    befriend.me.data.sections.collapsed = localData.me.sections.collapsed;
                }
            }

            resolve();
        });
    },
    loadLocal: function () {
        let data = window.localStorage.getItem(befriend.user.local.key);

        if (data) {
            try {
                data = JSON.parse(data);
                befriend.user.local.data = data;
            } catch (e) {
                console.error(e);
            }
        }
    },
    getLocal: function () {
        return befriend.user.local.data;
    },
    setLocal: function (key, value) {
        let data = befriend.user.getLocal();

        setNestedValue(data, key, value);

        befriend.user.saveLocal();
    },
    saveLocal: function () {
        window.localStorage.setItem(
            befriend.user.local.key,
            JSON.stringify(befriend.user.local.data),
        );
    },
    sameDeviceToken: function (token) {
        let data = befriend.user.getLocal();

        if (!data.device || data.device.token !== token) {
            return false;
        }

        return true;
    },
    setDeviceToken: function (token) {
        befriend.user.device.token = token;

        befriend.user.setLocal('device.token', token);
    },
    setPersonToken: function (token) {
        befriend.user.person.token = token;

        befriend.user.setLocal('person.token', token);
    },
    setLoginToken: function (token) {
        befriend.user.login.token = token;

        befriend.user.setLocal('login.token', token);
    },
};
