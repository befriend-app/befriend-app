befriend.styles = {
    init: function () {
        console.log("[init] Styles");

        return new Promise(async (resolve, reject) => {
            try {
                await befriend.styles.transformStatusBar(0, 0);
                await befriend.styles.setStatusBarBorder(1);

                //set margin top based on status bar height
                if (is_ios) {
                    try {
                        let sbh = await befriend.styles.getStatusBarHeight();

                        let views_el = document.getElementById("views");

                        views_el.style.marginTop = sbh + befriend.variables.view_gap_tb + "px";
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
                StatusBar.transformStatusBar(
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
    toggleStatusBar: function (show) {
        if (!StatusBar) {
            return;
        }

        if (show) {
            StatusBar.show();
        } else {
            befriend.styles.setStatusBarBorder(0);
            StatusBar.hide();
        }
    },
    setStatusBarBorder: function (px, color) {
        if (!color) {
            color = befriend.variables.app_background;
        }

        return new Promise(async (resolve, reject) => {
            try {
                StatusBar.setStatusBarBorder(
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
    setBackgroundAlpha: function (alpha, transition_sec) {
        try {
            if (!isNumeric(transition_sec)) {
                transition_sec = 0.3;
            }

            StatusBar.setBackgroundTransparency(alpha, transition_sec);
        } catch (e) {
            console.error(e);
        }
    },
    getStatusBarHeight: function () {
        return new Promise(async (resolve, reject) => {
            try {
                StatusBar.getHeight(
                    function (height) {
                        resolve(height);
                    },
                    function (error) {
                        console.error("Error adding border: " + error);
                        return resolve(0);
                    },
                );
            } catch (e) {
                console.error(e);
                resolve(0);
            }
        });
    },
    getInsetHeight: function () {
        let inset_height = getComputedStyle(document.documentElement).getPropertyValue("--sat");

        inset_height = parseFloat(inset_height);

        if (!isNumeric(inset_height)) {
            inset_height = 0;
        }

        return inset_height;
    },
    hideOverlay: function (hide) {
        if (hide) {
            addClassEl("hide", "overlay");
        } else {
            removeClassEl("hide", "overlay");
        }
    },
};
