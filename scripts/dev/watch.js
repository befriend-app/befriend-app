// https://github.com/egekhter/life-minute-photos/blob/main/scripts/watch.js

const {joinPaths, dateTimeStr, repoRoot} = require('../helpers');

const chokidar = require('chokidar');

// Initialize watcher.
let dirs = [
    joinPaths(repoRoot(), 'app')
];

function build() {
    return new Promise(async (resolve, reject) => {
        console.log("Build: ", dateTimeStr());

        require('../build/app').build(null);

        resolve();
    });
}

for (let i = 0; i < dirs.length; i++) {
    let d = dirs[i];

    console.log("Watching: ", d);

    const watcher = chokidar.watch(d, { persistent: true });

    // Add event listeners.
    let events = ['change', 'ready'];

    for(let e of events) {
        watcher.on(e, function (trigger) {
            if(trigger && trigger.includes('_variables')) {
                return;
            }

            try {
                build()
            } catch (e) {
                console.error(e);
            }
        });
    }
}