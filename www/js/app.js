/* Befriend v1.0.0  | © 2024 */

window['befriend'] = {
    init: function () {
        console.log("Befriend: [init]");

        return new Promise(async (resolve, reject) => {
            cordova.plugins.notification.local.addActions('activity-request', [
                { id: 'yes', title: 'Accept' },
                { id: 'no', title: 'Decline' },
                { id: 'view', title: 'View' },
            ]);

            cordova.plugins.notification.local.schedule({
                title: 'Coffee',
                text: '10:30 am',
                actions: [
                    { id: 'yes', title: 'Yes' },
                    { id: 'no',  title: 'No' }
                ],
                foreground: true,
                smallIcon: 'res://n_icon.png',
                icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzfXKe6Yfjr6rCtR6cMPJB8CqMAYWECDtDqH-eMnerHHuXv9egrw'
            });

            resolve();
        });
    }
};

function addClassEl(name, el) {
    if(typeof el !== 'object') {
        el = document.getElementById(el);
    }

    if(!el) {
        return;
    }

    if(!el.classList.contains(name)) {
        el.classList.add(name);
    }
}

function removeClassEl(name, el) {
    if(typeof el !== 'object') {
        el = document.getElementById(el);
    }

    if(!el) {
        return;
    }

    if(el.classList.contains(name)) {
        el.classList.remove(name);
    }
}

function toggleElClass(el, css_class) {
    if(!el.classList.contains(css_class)) {
        el.classList.add(css_class);
    } else {
        el.classList.remove(css_class);
    }
}

function loadCSS() {
    return new Promise(async (resolve, reject) => {
        try {
            let css_link = 'css/styles.css';

            if(dev_host) {
                css_link = joinPaths(dev_host, css_link);
            } else if(hosts.latest) {
                css_link = joinPaths(hosts.latest, css_link);
            }

            let link = document.createElement('link');
            link.setAttribute("rel", "stylesheet");
            link.setAttribute("type", "text/css");

            link.onload = function() {
                resolve()
            };

            link.setAttribute("href", css_link);

            document.getElementsByTagName("head")[0].appendChild(link);
        } catch (e) {
            console.error(e);
            return reject(e);
        }
    });
}


(async function() {
    addClassEl('loading', document.body);

    try {
        await loadCSS();
    } catch(e) {
        console.error(e);
    }

    try {
        await befriend.init();
    } catch(e) {
        console.error(e);
    }

    removeClassEl('loading', document.body);
})();