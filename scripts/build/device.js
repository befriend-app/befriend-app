let {devPort, joinPaths, loadScriptEnv, readFile, repoRoot, writeFile, execCmd} = require('../helpers');

loadScriptEnv();

const yargs = require('yargs');

const args = yargs.argv;

let is_ios = false;
let is_android = false;

let dev = {
    is_dev: false,
    host: null
};

let dev_variable_str = `let dev_host =`;

function getIPAddress() {
    let interfaces = require('os').networkInterfaces();

    for (let devName in interfaces) {
        let iface = interfaces[devName];

        for (let i = 0; i < iface.length; i++) {
            let alias = iface[i];

            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal)
                return alias.address;
        }
    }

    return '0.0.0.0';
}

function setDocumentDevHost() {
    return new Promise(async (resolve, reject) => {
        let repo_root = repoRoot();

        let index_html = joinPaths(repo_root, 'www', 'index.html');

        try {
            let data = await readFile(index_html);

            let lines = data.split('\n');

            for(let i = 0; i < lines.length; i++) {
                let line = lines[i];

                if(line.includes(dev_variable_str)) {
                    if(dev.host) {
                        lines[i] = `    ${dev_variable_str} '${dev.host}';`;
                    } else {
                        lines[i] = `    ${dev_variable_str} null;`;
                    }

                }
            }

            let new_content = lines.join('\n');

            await writeFile(index_html, new_content);

            resolve();
        } catch(e) {
            return reject(e);
        }
    });
}

(async function() {
    if(args.ios) {
        is_ios = true;
    }

    if(args.android) {
        is_android = true;
    }

    if(!args.ios && !args.android) {
        is_ios = true;
        is_android = true;
    }

    if(args.dev) {
        dev.is_dev = true;

        if(typeof args.dev === 'string') {
            if(args.dev.includes('http')) {
                dev.host = args.dev;
            } else {
                dev.host = `http://${args.dev}`;
            }
        }
    }

    console.log({
        building: 'app: js/css'
    });

    try {
        await require('app').build(null, args.min);
    } catch(e) {

    }

    console.log({
        building: {
            ios: is_ios,
            android: is_android
        }
    });

    //dev
    if(dev.is_dev) {
        //add host url to index.html

        //if no host defined, use local ip and default dev port
        if(!dev.host) {
            let ip = getIPAddress();

            dev.host = `http://${ip}:${devPort()}`;
        }
    }

    //set dev host to null or custom
    await setDocumentDevHost();

    // ios
    if(is_ios) {
        try {
            await execCmd(`cordova build ios`);
        } catch(e) {
            console.error(e);
        }
    }

    //android
    if(is_android) {
        try {
            await execCmd(`cordova build android`);
        } catch(e) {
            console.error(e);
        }
    }
})();

