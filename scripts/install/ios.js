const {execCmd, isMac, isWindows} = require('../helpers');

const fs = require('fs');
const path = require('path');

function getPlatformCmd(cmd) {
    if(isMac) {
        return cmd.mac;
    }

    if(isWindows) {
        return cmd.windows;
    }
}

function iosTargetVersion() {
    // https://github.com/apache/cordova-ios/issues/1379#issuecomment-2052414835


    function findFilePathsByFilename(directory, filename) {
        const files = fs.readdirSync(directory);
        const filePaths = [];

        for (const file of files) {
            const filePath = path.join(directory, file);
            const stats = fs.statSync(filePath);

            if (stats.isDirectory()) {
                // Recursively search in subdirectories
                const subdirectoryFilePaths = findFilePathsByFilename(filePath, filename);
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
    const paths = paths1.concat(paths2)

    // console.log('Apply patch to', paths);

    for (let path of paths) {
        let content = fs.readFileSync(path, { encoding: 'utf-8' });
        content = content.replace(/IPHONEOS_DEPLOYMENT_TARGET = [0-9]+.0;/g, 'IPHONEOS_DEPLOYMENT_TARGET = 12.0;');
        fs.writeFileSync(path, content);
    }

    console.log('Done setting IPHONEOS_DEPLOYMENT_TARGET');
}

(async function() {
    //install requirements

    let requirements = {
        "ios-deploy": {
            error_string: "ios-deploy: not installed",
            install_cmd: {
                mac: ["sudo npm install -g ios-deploy"],
                windows: []
            }
        },
        "cocoapods": {
            error_string: "CocoaPods: not installed",
            install_cmd: {
                mac: ["sudo gem install cocoapods"],
                windows: []
            }
        },
    };

    //check cordova requirements
    let cordova_check_cmd = `cordova requirements ios`;

    try {
        let o = await execCmd(cordova_check_cmd);

        console.log(o.stdout);
    } catch(err) {
        console.log(err);

        //ios deploy
        let ios_deploy = requirements['ios-deploy'];

        if(err.stdout && err.stdout.includes(ios_deploy.error_string)) {
            console.log("Installing: ios-deploy");

            try {
                let cmds = getPlatformCmd(ios_deploy.install_cmd);

                for(let cmd of cmds) {
                    await execCmd(cmd);
                }

                console.log("ios-deploy: installed successfully");
            } catch(e) {
                console.error(e);
            }
        }

        //cocoapods
        let cocoapods = requirements['cocoapods'];

        if(err.stdout && err.stdout.includes(cocoapods.error_string)) {
            console.log("Installing: cocoapods");

            try {
                let cmds = getPlatformCmd(cocoapods.install_cmd);

                for(let cmd of cmds) {
                    await execCmd(cmd);
                }

                console.log("cocoapods: installed successfully");
            } catch(e) {
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
    iosTargetVersion();;

    process.exit();
})();