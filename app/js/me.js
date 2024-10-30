befriend.me = {
    data: null,
    init: function () {
        return new Promise(async (resolve, reject) => {
            try {
                await befriend.me.getMe();
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

                befriend.me.data = r.data.me;

                befriend.html.setMe();
            } catch(e) {
                console.error(e);
            }

            resolve();
        });
    }
};