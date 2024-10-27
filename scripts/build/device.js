const {
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
const yargs = require('yargs');
const gm = require('gm').subClass({ imageMagick: '7+' });
const os = require('os');
const plist = require('plist');
const xcode = require('xcode');

//load env variables
loadScriptEnv();

// Configuration
const CONFIG = {
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
        apiDomain: 'let api_domain =',
        wsDomain: 'let ws_domain =',
        devHost: 'let dev_host =',
    },
    ios: {
        capabilities: {
            push: {
                entitlement: 'aps-environment',
                development: 'development',
                production: 'production'
            },
            timeSensitive: {
                entitlement: 'com.apple.developer.usernotifications.time-sensitive',
                infoPlistKey: 'UNUserNotificationCenterSupportsTimeSensitiveNotifications'
            }
        }
    },
    android: {
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

// Parse command line arguments
function parseArguments() {
    const args = yargs.argv;
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
    const interfaces = os.networkInterfaces();

    for (const devName in interfaces) {
        const iface = interfaces[devName];

        for (const alias of iface) {
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }

    return '0.0.0.0';
}

// Document manipulation
async function updateIndexHtml(urls) {
    const indexPath = joinPaths(repoRoot(), 'www', 'index.html');
    const content = await readFile(indexPath);
    const lines = content.split('\n');

    const updatedLines = lines.map((line) => {
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
        console.log("Plugins: add/update");

        let plugin_path = joinPaths(repoRoot(), 'os');

        try {
            let plugins_list = await execCmd(`cordova plugins ls`);

            if(plugins_list && plugins_list.stdout && plugins_list.stdout.includes(CONFIG.plugin_name)) {
                //remove
                try {
                    await execCmd(`cordova plugins rm ${CONFIG.plugin_name}`);
                } catch(e) {
                    console.error(e);
                }
            }
        } catch(e) {
            console.error(e);
        }

        //add
        try {
            await execCmd(`cordova plugins add ${plugin_path}`);
        } catch(e) {
            console.error(e);
        }

        resolve();
    });
}

// iOS build functions
async function addIOSCapabilities(iosDir) {
    // console.log('Adding iOS capabilities...');

    return new Promise(async (resolve, reject) => {
        try {
            // Find the .xcodeproj file
            // Find the .xcodeproj file
            const projectName = (await listFilesDir(iosDir)).find(name => name.endsWith('.xcodeproj'));
            if (!projectName) {
                console.error('Could not find Xcode project');
                return reject();
            }

            const projectPath = joinPaths(iosDir, projectName);
            const pbxprojPath = joinPaths(projectPath, 'project.pbxproj');
            const appName = projectName.replace('.xcodeproj', '');

            // Parse the .xcodeproj file
            const proj = xcode.project(pbxprojPath);
            await proj.parseSync();

            // Get the native target
            const nativeTargets = proj.pbxNativeTargetSection();
            const targetUUID = Object.keys(nativeTargets).find(key => !key.endsWith('_comment'));
            if (!targetUUID) {
                return reject('Could not find main target');
            }

            // Get the project
            const pbxProjectSection = proj.pbxProjectSection();
            const projectUUID = Object.keys(pbxProjectSection).find(key => !key.endsWith('_comment'));
            if (!projectUUID) {
                return reject('Could not find project');
            }

            const project = pbxProjectSection[projectUUID];
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
                enabled: 1
            };

            // Add entitlements file to build settings
            const configurations = proj.pbxXCBuildConfigurationSection();
            const buildConfigs = Object.keys(configurations)
                .filter(key => !key.endsWith('_comment'))
                .map(key => configurations[key])
                .filter(config => config.buildSettings);

            const entitlementsPath = `${appName}/${appName}.entitlements`;
            buildConfigs.forEach(config => {
                config.buildSettings.CODE_SIGN_ENTITLEMENTS = entitlementsPath;
            });

            // Write changes back to pbxproj
            await writeFile(pbxprojPath, proj.writeSync());

            // Update/create entitlements file
            const entitlementsFullPath = joinPaths(iosDir, appName, `${appName}.entitlements`);
            let entitlements = {};

            if (await checkPathExists(entitlementsFullPath)) {
                const content = await readFile(entitlementsFullPath);
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

            await writeFile(entitlementsFullPath, plist.build(entitlements));

            // Update Info.plist
            const infoPlistPath = joinPaths(iosDir, appName, appName, 'Info.plist');
            let infoPlist = {};

            if (await checkPathExists(infoPlistPath)) {
                const content = await readFile(infoPlistPath);
                try {
                    infoPlist = plist.parse(content);
                } catch (error) {
                    console.warn('Failed to parse Info.plist:', error);
                    infoPlist = {};
                }
            }

            // Add time sensitive notifications support
            infoPlist[CONFIG.ios.capabilities.timeSensitive.infoPlistKey] = true;

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

async function buildIOS(skipIcon) {
    console.log('Building iOS...');

    try {
        const iosDir = joinPaths(repoRoot(), 'platforms', 'ios');

        await addIOSCapabilities(iosDir);

        if (!skipIcon) {
            await execCmd(`cordova-icon --icon=${CONFIG.icons.path}`);
            await copyIOSIcons();
        }
        await execCmd('cordova build ios');
    } catch (error) {
        console.error('iOS build failed:', error);
    }
}

async function copyIOSIcons() {
    const iosDir = joinPaths(repoRoot(), 'platforms', 'ios');
    if (!(await checkPathExists(iosDir))) return;

    const { assetDir, imageDir } = await findIOSAssetDirectories(iosDir);
    if (!assetDir || !imageDir) return;

    await copyIconsBetweenDirectories(imageDir, assetDir);
}

async function findIOSAssetDirectories(iosDir) {
    let assetDir = null;
    let imageDir = null;

    const level1Files = await listFilesDir(iosDir);

    for (const file of level1Files) {
        const level1Path = joinPaths(iosDir, file);
        if (!(await isDirF(level1Path))) continue;

        const level2Files = await listFilesDir(level1Path);
        for (const subFile of level2Files) {
            if (subFile.includes('Assets.xcassets')) assetDir = joinPaths(level1Path, subFile);
            if (subFile.includes('Images.xcassets')) imageDir = joinPaths(level1Path, subFile);
            if (assetDir && imageDir) break;
        }
        if (assetDir && imageDir) break;
    }

    return { assetDir, imageDir };
}

async function copyIconsBetweenDirectories(imageDir, assetDir) {
    const imageIconDir = joinPaths(imageDir, 'AppIcon.appiconset');
    const assetIconDir = joinPaths(assetDir, 'AppIcon.appiconset');
    const imageFiles = await listFilesDir(imageIconDir);

    for (const file of imageFiles) {
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
        await execCmd('cordova build android');

        if (!skipIcon) {
            await generateAndroidIcons();
        }
    } catch (error) {
        console.error('Android build failed:', error);
    }
}

async function setAndroidUserAgent(ua) {
    const configPath = joinPaths(repoRoot(), 'platforms/android/app/src/main/res/xml/config.xml');
    const configData = await readFile(configPath);
    const lines = configData.split('\n').filter((l) => !l.includes('OverrideUserAgent'));

    const newConfig = lines
        .join('\n')
        .replace('</widget>', `\t<preference name="OverrideUserAgent" value="${ua}" />\n</widget>`);

    await writeFile(configPath, newConfig);
}

async function generateAndroidIcons() {
    const outputRoot = joinPaths(repoRoot(), 'platforms/android/app/src/main/res');

    // Generate basic icons
    await generateBasicAndroidIcons(outputRoot);

    // Generate foreground/background icons
    await generateLayeredAndroidIcons(outputRoot);

    // Set splash screen
    await setSplashScreen();
}

async function generateBasicAndroidIcons(outputRoot) {
    const sourceFile = joinPaths(repoRoot(), CONFIG.icons.path);

    for (const [density, size] of Object.entries(CONFIG.android.iconSizes)) {
        for (const dir of CONFIG.android.resourceDirs) {
            const outputFolder = joinPaths(outputRoot, `${dir}-${density}`);
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
    const foregroundSource = joinPaths(repoRoot(), CONFIG.icons.foreground);
    const backgroundSource = joinPaths(repoRoot(), CONFIG.icons.background);
    const resDirs = await listFilesDir(outputRoot);

    for (const [size, dim] of Object.entries(CONFIG.android.iconSizes)) {
        for (const folder of resDirs) {
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
    const splashPath = joinPaths(
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
    const buildConfig = parseArguments();
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
