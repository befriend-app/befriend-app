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
let yargs = require('yargs');
let gm = require('gm').subClass({ imageMagick: '7+' });
let os = require('os');
let plist = require('plist');
let xcode = require('xcode');

//load env variables
loadScriptEnv();

// Configuration
let CONFIG = {
    plugin_name: 'befriend-cordova-plugins',
    icons: {
        path: 'resources/icon.png',
        foreground: 'resources/android/foreground.png',
        background: 'resources/android/background.png',
    },
    urls: {
        api: process.env.API_DOMAIN || 'https://api.befriend.app',
        ws: process.env.WS_DOMAIN || 'wss://ws.befriend.app',
    },
    documentStrings: {
        apiDomain: 'window.api_domain =',
        wsDomain: 'window.ws_domain =',
        devHost: 'window.dev_host =',
    },
    ios: {
        dir: joinPaths(repoRoot(), 'platforms', 'ios'),
        capabilities: {
            push: {
                entitlement: 'aps-environment',
                development: 'development',
                production: 'production',
            },
            timeSensitive: {
                entitlement: 'com.apple.developer.usernotifications.time-sensitive',
                infoPlistKey: 'UNUserNotificationCenterSupportsTimeSensitiveNotifications',
            },
            appleSignIn: {
                capability: 'com.apple.SignInWithApple',
                entitlement: 'com.apple.developer.applesignin',
                infoPlistKey: 'AppleSignInEnabled',
            },
        },
    },
    android: {
        dir: joinPaths(repoRoot(), 'platforms', 'android'),
        iconSizes: {
            ldpi: '30',
            mdpi: '50',
            hdpi: '100',
            xhdpi: '150',
            xxhdpi: '300',
            xxxhdpi: '600',
        },
        resourceDirs: ['mipmap', 'drawable'],
    },
};

let PHOTO_CONFIG = {
    ios: {
        permissions: {
            camera: {
                key: 'NSCameraUsageDescription',
                description: 'This app needs access to your camera to take profile pictures.'
            },
            photoLibrary: {
                key: 'NSPhotoLibraryUsageDescription',
                description: 'This app needs access to your photo library to select profile pictures.'
            },
            // photoLibraryAdd: {
            //     key: 'NSPhotoLibraryAddUsageDescription',
            //     description: 'This app needs permission to save photos to your library.'
            // }
        }
    },
    android: {
        permissions: [
            'android.permission.CAMERA',
            'android.permission.READ_EXTERNAL_STORAGE',
            'android.permission.WRITE_EXTERNAL_STORAGE'
        ]
    }
};

// Parse command line arguments
function parseArguments() {
    let args = yargs.argv;

    return {
        platforms: {
            ios: args.ios || (!args.ios && !args.android),
            android: args.android || (!args.ios && !args.android),
        },
        urls: {
            api: ensureProtocol(args.api ? args.api : CONFIG.urls.api),
            ws: ensureProtocolWs(args.ws ? args.ws : CONFIG.urls.ws),
            dev: parseDevArguments(args.dev),
        },
        skipIcon: !!args.skip_icon,
        minify: !!args.min,
    };
}

function parseDevArguments(devArg) {
    if (!devArg) return { enabled: false, host: null };

    return {
        enabled: true,
        host:
            typeof devArg === 'string'
                ? ensureProtocol(devArg)
                : `http://${getIPAddress()}:${devPort()}`,
    };
}

// Utility functions
function ensureProtocol(url) {
    url = url.trim();
    return url.includes('http') ? url : `https://${url}`;
}

function ensureProtocolWs(url) {
    url = url.trim();
    return url.startsWith('ws') ? url : `wss://${url}`;
}

function getIPAddress() {
    let interfaces = os.networkInterfaces();

    for (let devName in interfaces) {
        let iface = interfaces[devName];

        for (let alias of iface) {
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }

    return '0.0.0.0';
}

// Document manipulation
async function updateIndexHtml(urls) {
    let indexPath = joinPaths(repoRoot(), 'www', 'index.html');
    let content = await readFile(indexPath);
    let lines = content.split('\n');

    let updatedLines = lines.map((line) => {
        if (line.includes(CONFIG.documentStrings.apiDomain)) {
            return `    ${CONFIG.documentStrings.apiDomain} '${urls.api}';`;
        }
        if (line.includes(CONFIG.documentStrings.wsDomain)) {
            return `    ${CONFIG.documentStrings.wsDomain} '${urls.ws}';`;
        }
        if (line.includes(CONFIG.documentStrings.devHost)) {
            return `    ${CONFIG.documentStrings.devHost} ${urls.dev.host ? `'${urls.dev.host}'` : 'null'};`;
        }
        return line;
    });

    await writeFile(indexPath, updatedLines.join('\n'));
}

function addUpdatePlugins() {
    return new Promise(async (resolve, reject) => {
        console.log('Plugins: add/update');

        let plugin_path = joinPaths(repoRoot(), 'os');

        try {
            let plugins_list = await execCmd(`cordova plugins ls`);

            if (
                plugins_list &&
                plugins_list.stdout &&
                plugins_list.stdout.includes(CONFIG.plugin_name)
            ) {
                //remove
                try {
                    await execCmd(`cordova plugins rm ${CONFIG.plugin_name}`);
                } catch (e) {
                    console.error(e);
                }
            }
        } catch (e) {
            console.error(e);
        }

        //add
        try {
            await execCmd(`cordova plugins add ${plugin_path}`);
        } catch (e) {
            console.error(e);
        }

        resolve();
    });
}

// iOS build functions

function getIOSNamePaths() {
    return new Promise(async (resolve, reject) => {
        try {
            // Find the .xcodeproj file
            let projectName = (await listFilesDir(CONFIG.ios.dir)).find((name) =>
                name.endsWith('.xcodeproj'),
            );

            if (!projectName) {
                console.error('Could not find Xcode project');
                return reject();
            }

            let projectPath = joinPaths(CONFIG.ios.dir, projectName);
            let pbxprojPath = joinPaths(projectPath, 'project.pbxproj');
            let appName = projectName.replace('.xcodeproj', '');

            resolve({
                appName,
                pbxprojPath,
            });
        } catch (e) {
            console.error(e);
            return reject();
        }
    });
}

async function addIOSCapabilities() {
    // console.log('Adding iOS capabilities...');

    return new Promise(async (resolve, reject) => {
        try {
            let { appName, pbxprojPath } = await getIOSNamePaths();

            // Parse the .xcodeproj file
            let proj = xcode.project(pbxprojPath);
            await proj.parseSync();

            // Get the native target
            let nativeTargets = proj.pbxNativeTargetSection();
            let targetUUID = Object.keys(nativeTargets).find((key) => !key.endsWith('_comment'));
            if (!targetUUID) {
                return reject('Could not find main target');
            }

            // Get the project
            let pbxProjectSection = proj.pbxProjectSection();
            let projectUUID = Object.keys(pbxProjectSection).find(
                (key) => !key.endsWith('_comment'),
            );
            if (!projectUUID) {
                return reject('Could not find project');
            }

            let project = pbxProjectSection[projectUUID];
            if (!project.attributes) {
                project.attributes = {};
            }
            if (!project.attributes.TargetAttributes) {
                project.attributes.TargetAttributes = {};
            }
            if (!project.attributes.TargetAttributes[targetUUID]) {
                project.attributes.TargetAttributes[targetUUID] = {};
            }
            if (!project.attributes.TargetAttributes[targetUUID].SystemCapabilities) {
                project.attributes.TargetAttributes[targetUUID].SystemCapabilities = {};
            }

            // Add Push Notifications capability
            project.attributes.TargetAttributes[targetUUID].SystemCapabilities['com.apple.Push'] = {
                enabled: 1,
            };

            // Add Sign In with Apple Compatibility
            project.attributes.TargetAttributes[targetUUID].SystemCapabilities['com.apple.SignInWithApple'] = {
                enabled: 1,
            };

            // Add entitlements file to build settings
            let configurations = proj.pbxXCBuildConfigurationSection();
            let buildConfigs = Object.keys(configurations)
                .filter((key) => !key.endsWith('_comment'))
                .map((key) => configurations[key])
                .filter((config) => config.buildSettings);

            let entitlementsPath = `${appName}/${appName}.entitlements`;
            buildConfigs.forEach((config) => {
                config.buildSettings.CODE_SIGN_ENTITLEMENTS = entitlementsPath;
            });

            // Write changes back to pbxproj
            await writeFile(pbxprojPath, proj.writeSync());

            // Update/create entitlements file
            let entitlementsFullPath = joinPaths(
                CONFIG.ios.dir,
                appName,
                `${appName}.entitlements`,
            );
            let entitlements = {};

            if (await checkPathExists(entitlementsFullPath)) {
                let content = await readFile(entitlementsFullPath);
                try {
                    entitlements = plist.parse(content);
                } catch (error) {
                    console.warn('Failed to parse existing entitlements:', error);
                }
            }

            // Add push notification entitlement
            entitlements[CONFIG.ios.capabilities.push.entitlement] =
                process.env.NODE_ENV === 'production'
                    ? CONFIG.ios.capabilities.push.production
                    : CONFIG.ios.capabilities.push.development;

            // Add time sensitive notification entitlement
            entitlements[CONFIG.ios.capabilities.timeSensitive.entitlement] = true;

            // Add Apple Sign in entitlement
            entitlements[CONFIG.ios.capabilities.appleSignIn.entitlement] = ['Default'];

            await writeFile(entitlementsFullPath, plist.build(entitlements));

            // Update Info.plist
            let infoPlistPath = joinPaths(CONFIG.ios.dir, appName, `${ appName}-Info.plist`);
            let infoPlist = {};

            if (await checkPathExists(infoPlistPath)) {
                let content = await readFile(infoPlistPath);
                try {
                    infoPlist = plist.parse(content);
                } catch (error) {
                    console.warn('Failed to parse Info.plist:', error);
                    infoPlist = {};
                }
            }

            // Add time sensitive notifications support
            infoPlist[CONFIG.ios.capabilities.timeSensitive.infoPlistKey] = true;

            // Add Apple sign in info.plist entry
            infoPlist[CONFIG.ios.capabilities.appleSignIn.infoPlistKey] = true;

            // Add background modes if not present
            if (!infoPlist['UIBackgroundModes']) {
                infoPlist['UIBackgroundModes'] = [];
            }
            if (!infoPlist['UIBackgroundModes'].includes('remote-notification')) {
                infoPlist['UIBackgroundModes'].push('remote-notification');
            }

            await writeFile(infoPlistPath, plist.build(infoPlist));

            resolve();
        } catch (error) {
            console.error('Failed to add iOS capabilities:', error);
            reject(error);
        }
    });
}

function copyIOSAppDelegate() {
    return new Promise(async (resolve, reject) => {
        try {
            let files = ['AppDelegate.h', 'AppDelegate.m'];

            let src_dir = joinPaths(repoRoot(), 'os/src/ios');
            let output_dir = joinPaths(repoRoot(), 'platforms', 'ios');
            let { appName } = await getIOSNamePaths();

            for (let file of files) {
                let input = joinPaths(src_dir, file);
                let output = joinPaths(output_dir, appName, file);

                await copyFile(input, output);
            }

            resolve();
        } catch (e) {
            console.error(e);
            return reject();
        }
    });
}

function addIOSURLScheme() {
    return new Promise(async (resolve, reject) => {
        try {
            //google login on ios requires custom url scheme in info.plist

            // Read bundle ID from config.xml
            let configXmlPath = joinPaths(repoRoot(), 'config.xml');
            let configXmlContent = await readFile(configXmlPath);

            // Extract widget id using regex
            let bundleIdMatch = configXmlContent.match(/widget\s+id="([^"]+)"/);
            if (!bundleIdMatch || !bundleIdMatch[1]) {
                console.warn('Could not find widget id in config.xml');
                return resolve();
            }

            let bundleId = bundleIdMatch[1];

            let { appName } = await getIOSNamePaths();
            let infoPlistPath = joinPaths(CONFIG.ios.dir, appName, `${appName}-Info.plist`);

            // Read current Info.plist
            let infoPlist = {};

            if (await checkPathExists(infoPlistPath)) {
                let content = await readFile(infoPlistPath);
                try {
                    infoPlist = plist.parse(content);
                } catch (error) {
                    console.warn('Failed to parse Info.plist:', error);
                    infoPlist = {};
                }
            }

            // Configure URL scheme
            if (!infoPlist.CFBundleURLTypes) {
                infoPlist.CFBundleURLTypes = [];
            }

            // Check if URL scheme already exists
            let schemes = [bundleId];

            if(process.env.IOS_GOOGLE_URL_SCHEME) {
                schemes.push(process.env.IOS_GOOGLE_URL_SCHEME);
            }

            for(let scheme of schemes) {
                let schemeExists = false;

                for (let urlType of infoPlist.CFBundleURLTypes) {
                    if (urlType.CFBundleURLSchemes &&
                        urlType.CFBundleURLSchemes.includes(scheme)) {
                        schemeExists = true;
                        break;
                    }
                }

                // Add the URL scheme if it doesn't exist
                if (!schemeExists) {
                    infoPlist.CFBundleURLTypes.push({
                        CFBundleURLSchemes: [scheme]
                    });
                }
            }

            // Write updated Info.plist
            await writeFile(infoPlistPath, plist.build(infoPlist));
            resolve();
        } catch (error) {
            console.error('Failed to configure iOS URL scheme:', error);
            reject(error);
        }
    });
}

async function addIOSPhotoCapabilities() {
    console.log('Adding iOS photo capabilities...');

    return new Promise(async (resolve, reject) => {
        try {
            let { appName, pbxprojPath } = await getIOSNamePaths();
            let infoPlistPath = joinPaths(CONFIG.ios.dir, appName, `${ appName}-Info.plist`);

            // Read current Info.plist
            let infoPlist = {};

            if (await checkPathExists(infoPlistPath)) {
                let content = await readFile(infoPlistPath);
                try {
                    infoPlist = plist.parse(content);
                } catch (error) {
                    console.warn('Failed to parse Info.plist:', error);
                    infoPlist = {};
                }
            }

            // Add camera and photo library permissions if not already present
            if (!infoPlist[PHOTO_CONFIG.ios.permissions.camera.key]) {
                infoPlist[PHOTO_CONFIG.ios.permissions.camera.key] =
                    PHOTO_CONFIG.ios.permissions.camera.description;
            }

            if (!infoPlist[PHOTO_CONFIG.ios.permissions.photoLibrary.key]) {
                infoPlist[PHOTO_CONFIG.ios.permissions.photoLibrary.key] =
                    PHOTO_CONFIG.ios.permissions.photoLibrary.description;
            }

            // if (!infoPlist[PHOTO_CONFIG.ios.permissions.photoLibraryAdd.key]) {
            //     infoPlist[PHOTO_CONFIG.ios.permissions.photoLibraryAdd.key] =
            //         PHOTO_CONFIG.ios.permissions.photoLibraryAdd.description;
            // }

            // Write updated Info.plist
            await writeFile(infoPlistPath, plist.build(infoPlist));
            console.log('Successfully added photo permissions to Info.plist');
            resolve();
        } catch (error) {
            console.error('Failed to add iOS photo capabilities:', error);
            reject(error);
        }
    });
}

// Add this function to enable photo capabilities in Android
function addAndroidPhotoCapabilities() {
    console.log('Adding Android photo capabilities...');

    return new Promise(async (resolve, reject) => {
        try {
            let androidManifestPath = joinPaths(
                CONFIG.android.dir,
                'app/src/main/AndroidManifest.xml'
            );

            if (!(await checkPathExists(androidManifestPath))) {
                console.warn('Android manifest not found. Skipping photo capabilities.');
                return resolve();
            }

            let manifestContent = await readFile(androidManifestPath);
            let updated = false;

            // Check if permissions are already added
            for (let permission of PHOTO_CONFIG.android.permissions) {
                if (!manifestContent.includes(`<uses-permission android:name="${permission}"`)) {
                    let permissionLine = `    <uses-permission android:name="${permission}" />`;

                    // Add permission before the closing manifest tag
                    manifestContent = manifestContent.replace(
                        '</manifest>',
                        `${permissionLine}\n</manifest>`
                    );
                    updated = true;
                }
            }

            if (updated) {
                await writeFile(androidManifestPath, manifestContent);
                console.log('Successfully added photo permissions to AndroidManifest.xml');
            } else {
                console.log('Photo permissions already present in AndroidManifest.xml');
            }

            resolve();
        } catch (error) {
            console.error('Failed to add Android photo capabilities:', error);
            reject(error);
        }
    });
}

async function buildIOS(skipIcon) {
    console.log('Building iOS...');

    try {
        await copyIOSAppDelegate();

        await addIOSCapabilities();
        await addIOSPhotoCapabilities();
        await addIOSURLScheme();

        if (!skipIcon) {
            await execCmd(`cordova-icon --icon=${CONFIG.icons.path}`);
            await copyIOSIcons();
        }
        await execCmd('cordova build ios');
    } catch (error) {
        console.error('iOS build failed:', error);
    }
}

async function updateAssetIcons(assets_dir) {
    let input_path = joinPaths(repoRoot(), CONFIG.icons.path);

    let icons_dir = joinPaths(assets_dir, 'AppIcon.appiconset');

    let files_dir = await listFilesDir(icons_dir);

    for (let file of files_dir) {
        if (file.includes('icon-')) {
            let res;

            if (file.includes('@')) {
                let split = file.replace('icon-', '').replace('.png', '').split('@');
                let dim = parseInt(split[0]);
                let x = parseInt(split[1].replace('x', ''));
                res = dim * x;
            } else {
                res = file.replace('icon-', '').replace('.png', '');
                res = parseInt(res);
            }

            let output_path = joinPaths(icons_dir, file);

            try {
                await createIcon(input_path, output_path, res);
            } catch (e) {
                console.error(e);
            }
        }
    }
}

async function copyIOSIcons() {
    if (!(await checkPathExists(CONFIG.ios.dir))) return;

    let { assetDir, imageDir } = await findIOSAssetDirectories(CONFIG.ios.dir);
    if (!assetDir || !imageDir) return;

    await copyIconsBetweenDirectories(imageDir, assetDir);
    await updateAssetIcons(assetDir);
}

async function findIOSAssetDirectories() {
    let assetDir = null;
    let imageDir = null;

    let level1Files = await listFilesDir(CONFIG.ios.dir);

    for (let file of level1Files) {
        let level1Path = joinPaths(CONFIG.ios.dir, file);
        if (!(await isDirF(level1Path))) continue;

        let level2Files = await listFilesDir(level1Path);
        for (let subFile of level2Files) {
            if (subFile.includes('Assets.xcassets')) assetDir = joinPaths(level1Path, subFile);
            if (subFile.includes('Images.xcassets')) imageDir = joinPaths(level1Path, subFile);
            if (assetDir && imageDir) break;
        }
        if (assetDir && imageDir) break;
    }

    return { assetDir, imageDir };
}

async function copyIconsBetweenDirectories(imageDir, assetDir) {
    let imageIconDir = joinPaths(imageDir, 'AppIcon.appiconset');
    let assetIconDir = joinPaths(assetDir, 'AppIcon.appiconset');
    let imageFiles = await listFilesDir(imageIconDir);

    for (let file of imageFiles) {
        try {
            await copyFile(joinPaths(imageIconDir, file), joinPaths(assetIconDir, file));
        } catch (error) {
            console.error(`Failed to copy icon ${file}:`, error);
        }
    }
}

// Android build functions
async function buildAndroid(skipIcon) {
    console.log('Building Android...');

    try {
        await setAndroidUserAgent('OS: Android');
        await addAndroidPhotoCapabilities();
        await execCmd('cordova build android');

        if (!skipIcon) {
            await generateAndroidIcons();
        }
    } catch (error) {
        console.error('Android build failed:', error);
    }
}

async function setAndroidUserAgent(ua) {
    let configPath = joinPaths(repoRoot(), 'platforms/android/app/src/main/res/xml/config.xml');
    let configData = await readFile(configPath);
    let lines = configData.split('\n').filter((l) => !l.includes('OverrideUserAgent'));

    let newConfig = lines
        .join('\n')
        .replace('</widget>', `\t<preference name="OverrideUserAgent" value="${ua}" />\n</widget>`);

    await writeFile(configPath, newConfig);
}

async function generateAndroidIcons() {
    let outputRoot = joinPaths(repoRoot(), 'platforms/android/app/src/main/res');

    // Generate basic icons
    await generateBasicAndroidIcons(outputRoot);

    // Generate foreground/background icons
    await generateLayeredAndroidIcons(outputRoot);

    // Set splash screen
    await setSplashScreen();
}

async function generateBasicAndroidIcons(outputRoot) {
    let sourceFile = joinPaths(repoRoot(), CONFIG.icons.path);

    for (let [density, size] of Object.entries(CONFIG.android.iconSizes)) {
        for (let dir of CONFIG.android.resourceDirs) {
            let outputFolder = joinPaths(outputRoot, `${dir}-${density}`);
            await makeDir(outputFolder).catch(() => {});

            try {
                await createIcon(sourceFile, joinPaths(outputFolder, 'ic_launcher.png'), size);
            } catch (error) {
                console.error(`Failed to generate icon for ${density}:`, error);
            }
        }
    }
}

async function generateLayeredAndroidIcons(outputRoot) {
    let foregroundSource = joinPaths(repoRoot(), CONFIG.icons.foreground);
    let backgroundSource = joinPaths(repoRoot(), CONFIG.icons.background);
    let resDirs = await listFilesDir(outputRoot);

    for (let [size, dim] of Object.entries(CONFIG.android.iconSizes)) {
        for (let folder of resDirs) {
            if (!folder.includes(`-${size}-v`)) continue;

            try {
                await createIcon(
                    foregroundSource,
                    joinPaths(outputRoot, folder, 'ic_launcher_foreground.png'),
                    dim,
                );
                await createIcon(
                    backgroundSource,
                    joinPaths(outputRoot, folder, 'ic_launcher_background.png'),
                    dim,
                );
            } catch (error) {
                console.error(`Failed to generate layered icons for ${size}:`, error);
            }
        }
    }
}

async function createIcon(input, output, dimension) {
    return new Promise((resolve, reject) => {
        gm(input)
            .resize(dimension, dimension)
            .write(output, (err) => (err ? reject(err) : resolve()));
    });
}

async function setSplashScreen() {
    let splashPath = joinPaths(
        repoRoot(),
        'platforms/android/app/src/main/res/drawable/ic_cdv_splashscreen.xml',
    );

    await writeFile(
        splashPath,
        '<vector xmlns:android="http://schemas.android.com/apk/res/android"></vector>',
    ).catch(() => {});
}

// Main build process
async function main() {
    let buildConfig = parseArguments();
    console.log(buildConfig);

    // Include OS/Plugins
    await addUpdatePlugins();

    // Build app assets
    await require('./app').build(null, buildConfig.minify).catch(console.error);

    // Update index.html with configuration
    await updateIndexHtml(buildConfig.urls);

    // Build platforms
    if (buildConfig.platforms.ios) {
        await buildIOS(buildConfig.skipIcon);
    }

    if (buildConfig.platforms.android) {
        await buildAndroid(buildConfig.skipIcon);
    }
}

// Start the build process
main().catch(console.error);
