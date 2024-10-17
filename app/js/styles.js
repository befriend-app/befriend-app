function addStatusBarBorder() {
    return new Promise(async (resolve, reject) => {
        try {
            if (befriend.variables.app_background) {
                if(!StatusBar) {
                    await timeoutAwait(200);
                }

                StatusBar.addBorder(
                    befriend.variables.app_background, //color
                    1, //height
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
}

befriend.styles = {
    init: function () {
        return new Promise(async (resolve, reject) => {
            try {
                await addStatusBarBorder();
            } catch (e) {
                console.error(e);
            }

            resolve();
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
