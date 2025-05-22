befriend.oauth = {
    clients: {
        google: null,
        apple: null
    },
    init: function() {
        return new Promise(async (resolve, reject) => {
            try {
                await befriend.oauth.getClients();
            } catch(e) {
                console.error(e);
            }

            resolve();
        });
    },
    getClients: function() {
        return new Promise(async (resolve, reject) => {
            try {
                 let r = await befriend.api.get('/oauth/clients');

                 befriend.oauth.clients = r.data.clients;

                 resolve();
            } catch(e) {
                console.error(e);
                return reject(e);
            }
        });
    },
    signInWithGoogle: async function() {
        return new Promise(async (resolve, reject) => {
            //get client data in case app started offline and trying again
            let platform = befriend.getPlatform();

            if(!befriend.oauth.clients.google?.[platform]) {
                try {
                    await befriend.oauth.clients();

                    //still no client
                    if(!befriend.oauth.clients.google?.[platform]) {
                        return reject();
                    }
                } catch(e) {
                    console.error(e);
                    return reject(e);
                }
            }

            try {
                let info = befriend.oauth.clients.google[platform];

                BefriendPlugin.oauth.signInWithGoogle({
                    clientId: info.client,
                    reversedClientId: info.urlScheme
                }, async function (authData) {
                    if (authData?.idToken) {
                        try {
                            let loginData = await befriend.oauth.sendAuthSuccessToServer(authData, 'google');

                            resolve(loginData);
                        } catch(e) {
                            return reject(e);
                        }
                    } else {
                        return reject('Unknown login error');
                    }
                }, function (err) {
                    console.error(err);
                    return reject();
                });
            } catch (error) {
                console.error('Google sign-in failed:', error);
                return reject();
            }
        });
    },
    sendAuthSuccessToServer: async function(profile, provider) {
        return new Promise(async (resolve, reject) => {
            try {
                let r = await befriend.api.post(`/oauth/${provider}/success`, {
                    profile
                });

                resolve(r.data);
            } catch (error) {
                return reject(error?.response?.data || `Error logging in with ${provider.capitalize()} `);
            }
        });
    },
}