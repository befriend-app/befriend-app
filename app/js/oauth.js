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
            function hideProviderSignIn(provider) {
                addElsClass(document.querySelectorAll(`.oauth-button.${provider}`), 'dni');
            }

            function hideSeparator() {
                let parentEl = document.querySelector('.login-signup-wrapper');
                addElsClass(parentEl.querySelectorAll(`#phone-screen .separator`), 'dni');
                addElsClass(parentEl.querySelectorAll(`#email-screen .separator`), 'dni');
            }

            let googleHidden = false;
            let appleHidden = false;

            //hide sign-in with apple on non-ios devices
            if(!is_ios) {
                try {
                    hideProviderSignIn('apple');
                    appleHidden = true;
                } catch(e) {
                    console.error(e);
                }
            }


            try {
                 let r = await befriend.api.get('/oauth/clients');

                 befriend.oauth.clients = r.data.clients;

                 //hide sign in with google if no client keys setup
                if(is_ios && !befriend.oauth.clients?.google?.ios) {
                    hideProviderSignIn('google');
                    googleHidden = true;
                }

                //hide "or separator" if all providers hidden
                if(googleHidden && appleHidden) {
                    hideSeparator();
                }

                 resolve();
            } catch(e) {
                console.error(e);
                return reject(e);
            }
        });
    },
    signInWithGoogle: function() {
        return new Promise(async (resolve, reject) => {
            //get client data in case app started offline and trying again
            let platform = befriend.getPlatform();

            if(!befriend.oauth.clients.google?.[platform]) {
                try {
                    await befriend.oauth.getClients();

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
                            return reject(e?.message);
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
    signInWithApple: function() {
        return new Promise(async (resolve, reject) => {
            try {
                BefriendPlugin.oauth.signInWithApple({}, async function (authData) {
                    if (authData?.idToken) {
                        try {
                            let loginData = await befriend.oauth.sendAuthSuccessToServer(authData, 'apple');

                            resolve(loginData);
                        } catch(e) {
                            return reject(e?.message);
                        }
                    } else {
                        return reject('Unknown login error');
                    }
                }, function (err) {
                    console.error(err);
                    return reject();
                });
            } catch (error) {
                console.error('Apple sign-in failed:', error);
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