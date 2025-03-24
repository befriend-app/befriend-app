befriend.device = {
    token: null,
    init: function () {
        return new Promise(async (resolve, reject) => {
            try {
                await befriend.device.getToken();

                resolve();
            } catch (e) {
                console.error(e);
                return reject();
            }
        });
    },
    getToken: async function (force_update) {
        return new Promise(async (resolve, reject) => {
            try {
                befriend.plugins.notifications.registerForPushNotifications(
                    function (token) {
                        befriend.device.setToken(token, force_update);
                        resolve();
                    },
                    function (err) {
                        console.error(err);
                        reject(err);
                    },
                );
            } catch (e) {
                console.error(e);
                return reject();
            }
        });
    },
    setToken: async function (token, force_update) {
        //save on server if new device token
        if (!this.sameDeviceToken(token) || force_update) {
            let platform = null;

            if (is_ios) {
                platform = 'ios';
            } else if (is_android) {
                platform = 'android';
            }

            try {
                let r = await befriend.auth.post(`/devices`, {
                    device_token: token,
                    platform: platform,
                });

                befriend.device.token = token;

                befriend.user.setLocal('device.token', token);
            } catch (e) {
                console.error(e);
            }
        }
    },
    sameDeviceToken: function (token) {
        return token === this.token;
    },
};
