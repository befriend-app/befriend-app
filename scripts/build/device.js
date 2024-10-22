let {
    devPort,
    joinPaths,
    loadScriptEnv,
    makeDir,
    readFile,
    repoRoot,
    writeFile,
    execCmd,
    checkPathExists,
    listFilesDir,
    isDirF,
    copyFile,
} = require('../helpers');

loadScriptEnv();

const yargs = require('yargs');
const gm = require('gm').subClass({ imageMagick: '7+' });

const args = yargs.argv;

let is_ios = false;
let is_android = false;

let no_icon = args.skip_icon;

let api_domain = process.env.API_DOMAIN || `https://api.befriend.app`;

let dev = {
    is_dev: false,
    host: null,
};

let icons = {
    path: `resources/icon.png`,
    foreground: `resources/android/foreground.png`,
    background: `resources/android/background.png`,
};

let api_domain_str = `let api_domain =`;

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

            for (let i = 0; i < lines.length; i++) {
                let line = lines[i];

                if (line.includes(api_domain_str)) {
                    lines[i] = `    ${api_domain_str} '${api_domain}';`;
                }

                if (line.includes(dev_variable_str)) {
                    if (dev.host) {
                        lines[i] = `    ${dev_variable_str} '${dev.host}';`;
                    } else {
                        lines[i] = `    ${dev_variable_str} null;`;
                    }
                }
            }

            let new_content = lines.join('\n');

            await writeFile(index_html, new_content);

            resolve();
        } catch (e) {
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

            if (platform_exists) {
                //level 1
                let level_1_files = await listFilesDir(ios_dir);

                for (let f of level_1_files) {
                    let level_1_path = joinPaths(ios_dir, f);

                    let is_dir = await isDirF(level_1_path);

                    if (is_dir) {
                        let level_2_files = await listFilesDir(level_1_path);

                        for (let f of level_2_files) {
                            if (f.includes('Assets.xcassets')) {
                                asset_dir = joinPaths(level_1_path, f);
                            }

                            if (f.includes('Images.xcassets')) {
                                image_dir = joinPaths(level_1_path, f);
                            }

                            if (asset_dir && image_dir) {
                                break;
                            }
                        }
                    }

                    if (asset_dir && image_dir) {
                        break;
                    }
                }

                if (asset_dir && image_dir) {
                    let image_icon_dir = joinPaths(image_dir, 'AppIcon.appiconset');
                    let asset_icon_dir = joinPaths(asset_dir, 'AppIcon.appiconset');

                    let image_files = await listFilesDir(image_icon_dir);

                    for (let f of image_files) {
                        try {
                            let from = joinPaths(image_icon_dir, f);
                            let to = joinPaths(asset_icon_dir, f);
                            await copyFile(from, to);
                        } catch (e) {}
                    }
                }
            }
        } catch (e) {
            console.error(e);
        }

        resolve();
    });
}

function setSplashAndroid() {
    return new Promise(async (resolve, reject) => {
        try {
            let splash_path = joinPaths(
                repoRoot(),
                `platforms/android/app/src/main/res/drawable`,
                `ic_cdv_splashscreen.xml`,
            );

            await writeFile(
                splash_path,
                `
<vector xmlns:android="http://schemas.android.com/apk/res/android">
</vector>`,
            );
        } catch (e) {}

        resolve();
    });
}

function setAndroidUserAgent(ua) {
    return new Promise(async (resolve, reject) => {
        let android_dir = joinPaths(repoRoot(), 'platforms/android');
        let config_loc = joinPaths(android_dir, 'app/src/main/res/xml/config.xml');
        let config_data = require('fs').readFileSync(config_loc).toString();
        let config_lines = config_data.split('\n');

        let ua_str = `\t<preference name="OverrideUserAgent" value="${ua}" />`;

        let lines = [];

        for (let l of config_lines) {
            if (!l.includes('OverrideUserAgent')) {
                lines.push(l);
            }
        }

        let new_str = lines.join('\n');
        new_str = new_str.replace(
            '</widget>',
            `${ua_str}
</widget>`,
        );

        require('fs').writeFileSync(config_loc, new_str);

        resolve();
    });
}

function generateIconsAndroid() {
    function createIcon(input, output, dim) {
        return new Promise(async (resolve, reject) => {
            await gm(input)
                .resize(dim, dim)
                .write(output, function (err) {
                    if (err) {
                        return reject(err);
                    }

                    resolve();
                });
        });
    }

    return new Promise(async (resolve, reject) => {
        let source_file = joinPaths(repoRoot(), icons.path);

        let foreground_source = joinPaths(repoRoot(), icons.foreground);
        let background_source = joinPaths(repoRoot(), icons.background);

        let output_root = joinPaths(repoRoot(), 'platforms/android/app/src/main/res');

        let output_dirs = ['mipmap', 'drawable'];

        let output_name = 'ic_launcher.png';

        //update icons
        let icon_sizes = {
            hdpi: '100',
            mdpi: '50',
            ldpi: '30',
            xhdpi: '150',
            xxhdpi: '300',
            xxxhdpi: '600',
        };

        //without foreground
        for (let i in icon_sizes) {
            let dim = icon_sizes[i];

            for (let od of output_dirs) {
                let output_folder = require('path').join(output_root, `${od}-${i}`);

                if (!(await checkPathExists(output_folder))) {
                    try {
                        await makeDir(output_folder);
                    } catch (e) {}
                }

                let p_out = joinPaths(output_folder, output_name);

                try {
                    await createIcon(source_file, p_out, dim);
                } catch (e) {
                    console.error(e);
                }
            }

            //drawable
            try {
                await createIcon(source_file, joinPaths(output_root, 'drawable', output_name), dim);
            } catch (e) {
                console.error(e);
            }
        }

        //with foreground/background
        let res_dirs = await listFilesDir(output_root);

        for (let size in icon_sizes) {
            let dim = icon_sizes[size];

            for (let folder of res_dirs) {
                if (folder.includes(`-${size}-v`)) {
                    // foreground
                    let foreground_out = joinPaths(
                        output_root,
                        folder,
                        `ic_launcher_foreground.png`,
                    );

                    try {
                        await createIcon(foreground_source, foreground_out, dim);
                    } catch (e) {
                        console.error(e);
                    }

                    // background
                    let background_out = joinPaths(
                        output_root,
                        folder,
                        `ic_launcher_background.png`,
                    );

                    try {
                        await createIcon(background_source, background_out, dim);
                    } catch (e) {
                        console.error(e);
                    }
                }
            }
        }

        //set splash screen
        try {
            await setSplashAndroid();
        } catch (e) {}

        resolve();
    });
}

(async function () {
    if (args.ios) {
        is_ios = true;
    }

    if (args.android) {
        is_android = true;
    }

    if (!args.ios && !args.android) {
        is_ios = true;
        is_android = true;
    }

    if (args.api) {
        if (args.api.toLocaleLowerCase().includes('http')) {
            api_domain = args.api;
        } else {
            api_domain = `https://${args.api}`;
        }
    }

    if (args.dev) {
        dev.is_dev = true;

        if (typeof args.dev === 'string') {
            if (args.dev.includes('http')) {
                dev.host = args.dev;
            } else {
                dev.host = `http://${args.dev}`;
            }
        }
    }

    console.log({
        building: 'app: js/css',
    });

    try {
        await require('app').build(null, args.min);
    } catch (e) {}

    console.log({
        building: {
            ios: is_ios,
            android: is_android,
        },
    });

    //dev
    if (dev.is_dev) {
        //add host url to index.html

        //if no host defined, use local ip and default dev port
        if (!dev.host) {
            let ip = getIPAddress();

            dev.host = `http://${ip}:${devPort()}`;
        }
    }

    //set dev host to null or custom
    await setDocumentDevHost();

    // ios
    if (is_ios) {
        console.log('Build iOS');

        try {
            if (!no_icon) {
                await execCmd(`cordova-icon --icon=${icons.path}`);
                await copyIconsIOS();
            }

            await execCmd(`cordova build ios`);
        } catch (e) {
            console.error(e);
        }
    }

    //android
    if (is_android) {
        console.log('Build Android');

        try {
            await setAndroidUserAgent('OS: Android');

            await execCmd(`cordova build android`);

            if (!no_icon) {
                await generateIconsAndroid();
            }
        } catch (e) {
            console.error(e);
        }
    }
})();
