befriend.styles = {
    init: function () {
        return new Promise(async (resolve, reject) => {
            try {
                await befriend.styles.setStatusBarBorder(1);
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
                }
            } catch (e) {
                console.error(e);
                resolve();
            }
        });
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
