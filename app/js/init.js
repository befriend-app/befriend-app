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
        await loadCSS();
    } catch (e) {
        console.error(e);
    }

    if (is_ios) {
        addClassEl("ios", document.documentElement);
    } else if (is_android) {
        addClassEl("android", document.documentElement);
    }

    try {
        await befriend.init();
    } catch (e) {
        console.error(e);
    }

    removeClassEl("loading", document.body);
})();
