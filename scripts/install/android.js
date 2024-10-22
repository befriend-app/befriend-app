const {
    execCmd,
    isMac,
    isWindows,
    repoRoot,
    joinPaths,
    readFile,
    writeFile,
    checkPathExists,
    listFilesDir,
    isDirF,
} = require('../helpers');

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

function addAndroidPaths() {
    return new Promise(async (resolve, reject) => {
        if (isMac) {
            let changed = false;

            let user_profile_path = joinPaths(require('os').homedir(), `.zshrc`);
            let android_home_path = joinPaths(require('os').homedir(), `Library/Android/sdk`);

            let profile_exists = await checkPathExists(user_profile_path);

            if (!profile_exists) {
                return reject('Could not find bash profile');
            }

            let version = null;

            let cmdline_dir = joinPaths(android_home_path, 'cmdline-tools');
            let cmdline_files = await listFilesDir(cmdline_dir);

            for (let f of cmdline_files) {
                let test_dir = joinPaths(cmdline_dir, f);

                if (await isDirF(test_dir)) {
                    version = f;
                    break;
                }
            }

            let android_home_variable = `ANDROID_HOME`;

            let add_lines = [
                `export ${android_home_variable}="${android_home_path}"`,
                `export PATH=$PATH:$${android_home_variable}/platform-tools`,
                `export PATH=$PATH:$${android_home_variable}/cmdline-tools/${version}/bin`,
                `export PATH=$PATH:$${android_home_variable}/build-tools`,
                `export PATH=$PATH:$${android_home_variable}/emulator`,
                `export PATH="/opt/homebrew/opt/gradle@7/bin:$PATH"`,
            ];

            let profile_data = await readFile(user_profile_path);

            let lines = profile_data.split('\n');

            for (let add_l of add_lines) {
                let exists = false;

                for (let i = 0; i < lines.length; i++) {
                    let line = lines[i];

                    if (line.startsWith(add_l)) {
                        exists = true;
                    }
                }

                if (!exists) {
                    changed = true;

                    lines.push(add_l);
                }
            }

            if (changed) {
                let new_profile = lines.join('\n');

                await writeFile(user_profile_path, new_profile);
            }
        } else if (isWindows) {
        }

        resolve();
    });
}

(async function () {
    //install requirements

    let requirements = {
        java: {
            error_string: 'Java JDK: not installed',
            install_cmd: {
                mac: [
                    `brew install openjdk@17`,
                    `sudo ln -sfn /opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-17.jdk`,
                ],
                windows: [],
            },
        },
        gradle: {
            error_string: 'Gradle: not installed',
            install_cmd: {
                mac: [`brew install gradle@7`],
                windows: [],
            },
        },
    };

    //check cordova requirements
    let cordova_check_cmd = `cordova requirements android`;

    try {
        let o = await execCmd(cordova_check_cmd);

        console.log(o.stdout);
    } catch (err) {
        console.log(err);

        //android paths
        try {
            await addAndroidPaths();
        } catch (e) {
            console.error(e);
        }

        //java
        let java = requirements.java;

        if (err.stdout && err.stdout.includes(java.error_string)) {
            console.log('Installing: Java JDK');

            try {
                let cmds = getPlatformCmd(java.install_cmd);

                for (let cmd of cmds) {
                    await execCmd(cmd);
                }

                console.log('Java SDK: installed successfully');
            } catch (e) {
                console.error(e);
            }
        }

        //gradle
        let gradle = requirements.gradle;

        if (err.stdout && err.stdout.includes(gradle.error_string)) {
            console.log('Installing: Gradle');

            try {
                let cmds = getPlatformCmd(gradle.install_cmd);

                for (let cmd of cmds) {
                    await execCmd(cmd);
                }

                console.log('Gradle: installed successfully');
            } catch (e) {
                console.error(e);
            }
        }
    }

    process.exit();
})();
