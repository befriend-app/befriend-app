befriend.styles = {
    init: function () {
        return new Promise(async (resolve, reject) => {
            try {
                befriend.styles.setBackgroundAlpha(1);
                await befriend.styles.setStatusBarBorder(1);

                //set margin top based on status bar height
                if(is_ios) {
                    try {
                        let sbh = await befriend.styles.getStatusBarHeight();

                        let views_el = document.getElementById('views');

                        views_el.style.marginTop = sbh + befriend.variables.view_gap_tb + 'px';
                    } catch(e) {

                    }
                }

            } catch (e) {
                console.error(e);
            }

            resolve();
        });
    },
    toggleStatusBar: function (show) {
        if(!StatusBar) {
            return;
        }

        if(show) {
            StatusBar.show();
        } else {
            befriend.styles.setStatusBarBorder(0);
            StatusBar.hide();
        }
    },
    setStatusBarBorder: function (px) {
        return new Promise(async (resolve, reject) => {
            try {
                if (befriend.variables.app_background) {
                    StatusBar.addBorder(
                        befriend.variables.app_background, //color
                        px, //height
                        function () {
                            resolve();
                        },
                        function (error) {
                            console.error("Error adding border: " + error);
                            resolve();
                        },
                    );
                } else {
                    resolve();
                }
            } catch (e) {
                console.error(e);
                resolve();
            }
        });
    },
    setBackgroundAlpha: function (alpha) {
        try {
            StatusBar.setBackgroundTransparency(alpha, 300);
        } catch(e) {
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
};
