function loadCSS() {
    return new Promise(async (resolve, reject) => {
        try {
            //default
            let css_url = joinPaths('css', css_name);

            //latest
            if (hosts.latest) {
                css_url = joinPaths(dev_host, 'css', css_name);
            }

            //dev
            if (dev_host) {
                css_url = joinPaths(dev_host, 'css', css_name);
            }

            let link = document.createElement('link');
            link.setAttribute('rel', 'stylesheet');
            link.setAttribute('type', 'text/css');

            link.onload = function () {
                resolve();
            };

            link.setAttribute('href', css_url);

            document.getElementsByTagName('head')[0].appendChild(link);
        } catch (e) {
            console.error(e);
            return reject(e);
        }
    });
}

(async function () {
    addClassEl('loading', document.body);

    try {
        await loadCSS();
    } catch (e) {
        console.error(e);
    }

    if (is_ios) {
        addClassEl('ios', document.documentElement);
    } else if (is_android) {
        addClassEl('android', document.documentElement);
    }

    try {
        await befriend.init();
    } catch (e) {
        console.error(e);
    }

    if (!window.launched_from_notification) {
        removeClassEl('loading', document.body);
    }
})();
