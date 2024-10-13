function addStatusBarBorder() {
    return new Promise(async (resolve, reject) => {
        //add border to status bar

        try {
            if (befriend.styles.app_background) {
                StatusBar.addBorder(
                    befriend.styles.app_background, //color
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

function loadCSS() {
    return new Promise(async (resolve, reject) => {
        try {
            let css_link = "css/styles.css";

            if (dev_host) {
                css_link = joinPaths(dev_host, css_link);
            } else if (hosts.latest) {
                css_link = joinPaths(hosts.latest, css_link);
            }

            let link = document.createElement("link");
            link.setAttribute("rel", "stylesheet");
            link.setAttribute("type", "text/css");

            link.onload = function () {
                resolve();
            };

            link.setAttribute("href", css_link);

            document.getElementsByTagName("head")[0].appendChild(link);
        } catch (e) {
            console.error(e);
            return reject(e);
        }
    });
}

(async function () {
    addClassEl("loading", document.body);

    try {
        await addStatusBarBorder();
    } catch (e) {
        console.error(e);
    }

    try {
        await loadCSS();
    } catch (e) {
        console.error(e);
    }

    try {
        await befriend.init();
    } catch (e) {
        console.error(e);
    }

    removeClassEl("loading", document.body);
})();
