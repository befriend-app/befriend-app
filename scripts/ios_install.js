const {execCmd, isMac, isWindows} = require('./helpers');

(async function() {
    //install requirements

    let requirements = {
        "ios-deploy": {
            error_string: "ios-deploy was not found",
            install_cmd: "sudo npm install -g ios-deploy"
        },
        "cocoapods": {
            error_string: "CocoaPods was not found",
            install_cmd: "sudo gem install cocoapods"
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

        if(err.stderr && err.stderr.includes(ios_deploy.error_string)) {
            console.log("Installing: ios-deploy");

            try {
                 await execCmd(ios_deploy.install_cmd);
                console.log("ios-deploy: installed successfully");
            } catch(e) {
                console.error(e);
            }
        }

        //cocoapods
        let cocoapods = requirements['cocoapods'];

        if(err.stderr && err.stderr.includes(cocoapods.error_string)) {
            console.log("Installing: cocoapods");

            try {
                await execCmd(cocoapods.install_cmd);
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
    require('./ios_target_version');

    process.exit();
})();