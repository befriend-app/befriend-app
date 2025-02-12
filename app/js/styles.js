befriend.styles = {
    init: function () {
        console.log('[init] Styles');

        return new Promise(async (resolve, reject) => {
            try {
                await befriend.styles.transformStatusBar(0, 0);
                await befriend.styles.setStatusBarBorder(1);

                //set margin top based on status bar height
                if (is_ios) {
                    try {
                        let sbh = await befriend.styles.getStatusBarHeight();

                        befriend.els.app.style.setProperty('--sbh', sbh + 'px');
                        befriend.els.app.style.setProperty(
                            '--view-top',
                            sbh + befriend.variables.view_gap_tb + 'px',
                        );

                        // befriend.els.views.style.marginTop = sbh + befriend.variables.view_gap_tb + 'px';
                    } catch (e) {}
                }
            } catch (e) {
                console.error(e);
            }

            resolve();
        });
    },
    transformStatusBar: function (px, transition_sec) {
        return new Promise(async (resolve, reject) => {
            if (!isNumeric(transition_sec)) {
                transition_sec = 0.3;
            }

            try {
                befriend.plugins.statusBar.transform(
                    px,
                    transition_sec,
                    function (success) {
                        resolve();
                    },
                    function (error) {
                        resolve();
                    },
                );
            } catch (e) {
                console.error(e);
                resolve();
            }
            resolve();
        });
    },
    setStatusBarBorder: function (px, color) {
        if (!color) {
            color = befriend.variables.app_background;
        }

        return new Promise(async (resolve, reject) => {
            try {
                befriend.plugins.statusBar.setBorder(
                    px,
                    color,
                    function (success) {
                        resolve();
                    },
                    function (error) {
                        resolve();
                    },
                );
            } catch (e) {
                console.error(e);
                resolve();
            }
        });
    },
    getStatusBarHeight: function () {
        return new Promise(async (resolve, reject) => {
            try {
                befriend.plugins.statusBar.getHeight(
                    function (height) {
                        resolve(height);
                    },
                    function (error) {
                        console.error('Error adding border: ' + error);
                        return resolve(0);
                    },
                );
            } catch (e) {
                console.error(e);
                resolve(0);
            }
        });
    },
    getVariableValue: function (var_string) {
        return parseFloat(getComputedStyle(befriend.els.app).getPropertyValue(`--${var_string}`));
    },
    getInsetHeight: function () {
        let inset_height = getComputedStyle(document.documentElement).getPropertyValue('--sat');

        inset_height = parseFloat(inset_height);

        if (!isNumeric(inset_height)) {
            inset_height = 0;
        }

        return inset_height;
    },
    hideOverlay: function (hide) {
        if (hide) {
            addClassEl('hide', 'overlay');
        } else {
            removeClassEl('hide', 'overlay');
        }
    },
    createActivity: {
        updateCloseMessagePosition: function () {
            const messageEl = document.querySelector('#create-activity-top-message .message');
            const closeEl = document.querySelector('#create-activity-top-message .close');

            if (messageEl && closeEl) {
                const rect = messageEl.getBoundingClientRect();
                closeEl.style.left = `${rect.width + 5}px`;
            }
        },
    },
    displayActivity: {
        updateSectionsHeight: async function() {
            let view = befriend.els.currentActivityView;

            let sections_wrapper_el = view.querySelector('.sections-wrapper');

            let sections_box = sections_wrapper_el.getBoundingClientRect();

            let footer_box = befriend.els.footer.getBoundingClientRect();

            sections_wrapper_el.style.height = `${footer_box.top - sections_box.top}px`;
        },
    },
    notifications: {
        updateSectionsHeight: function() {
            const notificationView = befriend.els.activityNotificationView;

            let sections_wrapper_el = notificationView.querySelector('.sections-wrapper');

            let sections_box = sections_wrapper_el.getBoundingClientRect();
            let footer_box = befriend.els.footer.getBoundingClientRect();

            sections_wrapper_el.style.height = `${footer_box.top - sections_box.top}px`;
        },
    },
};
