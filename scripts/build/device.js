let {devPort, joinPaths, loadScriptEnv, readFile, repoRoot, writeFile, execCmd, checkPathExists, listFilesDir, isDirF,
    copyFile
} = require('../helpers');

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

function copyIconsIOS() {
    return new Promise(async (resolve, reject) => {
         let asset_dir = null;

         let image_dir = null;

         let ios_dir = joinPaths(repoRoot(), 'platforms', 'ios');

         try {
             let platform_exists = await checkPathExists(ios_dir);

             if(platform_exists) {
                 //level 1
                 let level_1_files = await listFilesDir(ios_dir);

                 for(let f of level_1_files) {
                     let level_1_path = joinPaths(ios_dir, f);

                     let is_dir = await isDirF(level_1_path);

                     if(is_dir) {
                         let level_2_files = await listFilesDir(level_1_path);

                         for(let f of level_2_files) {
                             if(f.includes('Assets.xcassets')) {
                                 asset_dir = joinPaths(level_1_path, f);
                             }

                             if(f.includes('Images.xcassets')) {
                                 image_dir = joinPaths(level_1_path, f);
                             }

                             if(asset_dir && image_dir) {
                                 break;
                             }
                         }
                     }

                     if(asset_dir && image_dir) {
                         break;
                     }
                 }

                 if(asset_dir && image_dir) {
                     let image_icon_dir = joinPaths(image_dir, 'AppIcon.appiconset');
                     let asset_icon_dir = joinPaths(asset_dir, 'AppIcon.appiconset');

                     let image_files = await listFilesDir(image_icon_dir);

                     for(let f of image_files) {
                        try {
                            let from = joinPaths(image_icon_dir, f);
                            let to = joinPaths(asset_icon_dir, f);
                            await copyFile(from, to);
                        } catch(e) {

                        }
                     }
                 }
             }
         } catch(e) {
             console.error(e);
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
            await copyIconsIOS();
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

