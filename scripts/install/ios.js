const { execCmd, isMac, isWindows } = require('../helpers');

const fs = require('fs');
const path = require('path');

function getPlatformCmd(cmd) {
    if (isMac) {
        return cmd.mac;
    }

    if (isWindows) {
        return cmd.windows;
    }
}

function iosTargetVersion() {
    // https://github.com/apache/cordova-ios/issues/1379#issuecomment-2052414835

    function findFilePathsByFilename(directory, filename, visitedPaths = new Set()) {
        // Get the absolute path to avoid issues with relative paths
        const absoluteDir = path.resolve(directory);

        // Check if we've already visited this directory (prevents infinite loops)
        if (visitedPaths.has(absoluteDir)) {
            return [];
        }
        visitedPaths.add(absoluteDir);

        let files;
        try {
            files = fs.readdirSync(absoluteDir);
        } catch (err) {
            // Skip directories we can't read (permission issues, etc.)
            console.warn(`Warning: Cannot read directory ${absoluteDir}: ${err.message}`);
            return [];
        }

        const filePaths = [];

        for (const file of files) {
            const filePath = path.join(absoluteDir, file);

            let stats;
            try {
                // Use lstat instead of stat to get info about the link itself, not what it points to
                stats = fs.lstatSync(filePath);
            } catch (err) {
                // Skip files/directories we can't stat
                console.warn(`Warning: Cannot stat ${filePath}: ${err.message}`);
                continue;
            }

            if (stats.isSymbolicLink()) {
                // Skip symbolic links to avoid infinite loops
                continue;
            } else if (stats.isDirectory()) {
                // Recursively search in subdirectories, passing along visitedPaths
                const subdirectoryFilePaths = findFilePathsByFilename(filePath, filename, visitedPaths);
                filePaths.push(...subdirectoryFilePaths);
            } else if (stats.isFile() && file === filename) {
                // If the file matches the filename, add its path to the result
                filePaths.push(filePath);
            }
        }
        return filePaths;
    }

    const paths1 = findFilePathsByFilename('../', 'project.pbxproj');
    const paths2 = findFilePathsByFilename('../', 'Pods.xcodeproj');
    const paths = paths1.concat(paths2);

    for (let filePath of paths) {
        try {
            let content = fs.readFileSync(filePath, { encoding: 'utf-8' });
            content = content.replace(
                /IPHONEOS_DEPLOYMENT_TARGET = [0-9]+.0;/g,
                'IPHONEOS_DEPLOYMENT_TARGET = 12.0;',
            );
            fs.writeFileSync(filePath, content);
            console.log(`Updated IPHONEOS_DEPLOYMENT_TARGET in: ${filePath}`);
        } catch (err) {
            console.error(`Error processing file ${filePath}: ${err.message}`);
        }
    }

    console.log('Done setting IPHONEOS_DEPLOYMENT_TARGET');
}

(async function () {
    //install requirements

    let requirements = {
        'ios-deploy': {
            error_string: 'ios-deploy: not installed',
            install_cmd: {
                mac: ['sudo npm install -g ios-deploy'],
                windows: [],
            },
        },
        cocoapods: {
            error_string: 'CocoaPods: not installed',
            install_cmd: {
                mac: ['sudo gem install cocoapods'],
                windows: [],
            },
        },
    };

    //check cordova requirements
    let cordova_check_cmd = `cordova requirements ios`;

    try {
        let o = await execCmd(cordova_check_cmd);

        console.log(o.stdout);
    } catch (err) {
        console.log(err);

        //ios deploy
        let ios_deploy = requirements['ios-deploy'];

        if (err.stdout && err.stdout.includes(ios_deploy.error_string)) {
            console.log('Installing: ios-deploy');

            try {
                let cmds = getPlatformCmd(ios_deploy.install_cmd);

                for (let cmd of cmds) {
                    await execCmd(cmd);
                }

                console.log('ios-deploy: installed successfully');
            } catch (e) {
                console.error(e);
            }
        }

        //cocoapods
        let cocoapods = requirements['cocoapods'];

        if (err.stdout && err.stdout.includes(cocoapods.error_string)) {
            console.log('Installing: cocoapods');

            try {
                let cmds = getPlatformCmd(cocoapods.install_cmd);

                for (let cmd of cmds) {
                    await execCmd(cmd);
                }

                console.log('cocoapods: installed successfully');
            } catch (e) {
                console.error(e);
            }
        }
    }

    // todo
    // a. check for Xcode installation

    // b. check for iOS platform
    // # Download latest iOS platform
    //  xcodebuild -downloadPlatform iOS
    //
    // or
    // (must be logged in to Apple Developer)
    // download: https://download.developer.apple.com/Developer_Tools/iOS_17.5_Simulator_Runtime/iOS_17.5_Simulator_Runtime.dmg
    //
    // sudo xcode-select -s /Applications/Xcode.app
    // xcodebuild -runFirstLaunch
    // xcrun simctl runtime add "iOS_17.5_Simulator_Runtime.dmg"

    // c. windows install

    //set ios target version to 12.0
    iosTargetVersion();

    process.exit();
})();