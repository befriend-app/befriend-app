befriend.user = {
    local: {
        key: 'user.json',
        data: {},
    },
    person: {
        token: null,
    },
    login: {
        token: null,
    },
    network: null,
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
                befriend.device.token = localData.device.token;
            }

            if (localData.activities?.person?.mode) {
                befriend.activities.createActivity.setAppMode(
                    localData.activities.person.mode,
                    true,
                );
            }

            if (localData.me) {
                if (localData.me.sections && localData.me.sections.collapsed) {
                    befriend.me.data.sections.collapsed = localData.me.sections.collapsed;
                }
            }

            if (localData.notifications?.networks) {
                befriend.notifications.data.networks = localData.notifications.networks;
            }

            if (localData.notifications?.removed) {
                befriend.notifications.data.removed = localData.notifications.removed;
            }

            if (localData.reviews?.lastNewActivityToken) {
                befriend.reviews.lastNewActivityToken = localData.reviews.lastNewActivityToken;
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
    setPersonToken: function (token) {
        befriend.user.person.token = token;

        befriend.user.setLocal('person.token', token);
    },
    setLoginToken: function (token) {
        befriend.user.login.token = token;

        befriend.user.setLocal('login.token', token);
    },
};
