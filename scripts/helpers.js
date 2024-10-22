const fs = require('fs');

module.exports = {
    isMac: process.platform === 'darwin',
    isWindows: process.platform.startsWith('win'),
    checkPathExists: function (p) {
        return new Promise((resolve, reject) => {
            fs.exists(p, function (exists) {
                let bool = exists ? true : false;

                return resolve(bool);
            });
        });
    },
    copyFile: function (from, to) {
        return new Promise(async (resolve, reject) => {
            let fs = require('fs');

            fs.copyFile(from, to, function (err) {
                if (err) {
                    return reject();
                }

                resolve();
            });
        });
    },
    createDirectoryIfNotExistsRecursive: function (dirname) {
        return new Promise(async (resolve, reject) => {
            let slash = '/';

            let directories_backwards = [dirname];
            let minimize_dir = dirname;
            let directories_needed = [];
            let directories_forwards = [];

            // backward slashes for windows
            if (module.exports.isWindows) {
                slash = '\\';
            }

            while ((minimize_dir = minimize_dir.substring(0, minimize_dir.lastIndexOf(slash)))) {
                directories_backwards.push(minimize_dir);
            }

            //stop on first directory found
            for (const d in directories_backwards) {
                if (!fs.existsSync(directories_backwards[d])) {
                    directories_needed.push(directories_backwards[d]);
                } else {
                    break;
                }
            }

            //no directories missing
            if (!directories_needed.length) {
                return resolve();
            }

            // make all directories in ascending order
            directories_forwards = directories_needed.reverse();

            for (const d in directories_forwards) {
                try {
                    fs.mkdirSync(directories_forwards[d]);
                } catch (e) {}
            }

            return resolve();
        });
    },
    dateTimeStr: function () {
        let date = new Date();

        return date.toISOString().slice(0, 10) + ' ' + date.toISOString().substring(11, 19);
    },
    devPort: function () {
        return parseInt(process.env.DEV_PORT || 3001);
    },
    execCmd: function (cmd) {
        return new Promise(async (resolve, reject) => {
            const { exec } = require('child_process');

            exec(cmd, (err, stdout, stderr) => {
                if (err) {
                    reject({
                        error: err,
                        stdout: stdout,
                        stderr: stderr,
                    });
                } else {
                    resolve({
                        stdout: stdout,
                    });
                }
            });
        });
    },
    isDirF: function (p) {
        return new Promise((resolve, reject) => {
            fs.lstat(p, (err, stats) => {
                if (err) {
                    return reject(err);
                }

                return resolve(stats.isDirectory());
            });
        });
    },
    isNumeric: function (obj) {
        return !isNaN(parseFloat(obj)) && isFinite(obj);
    },
    joinPaths: function () {
        let args = [];

        for (let i = 0; i < arguments.length; i++) {
            let arg = arguments[i] + '';

            if (!arg) {
                continue;
            }
            args.push(arg);
        }

        let slash = '/';

        if (require('os').platform().startsWith('win')) {
            slash = '\\';
        }

        return args
            .map((part, i) => {
                let re;

                if (i === 0) {
                    re = new RegExp(`[\\${slash}]*$`, 'g');
                } else {
                    re = new RegExp(`(^[\\${slash}]*|[\\/]*$)`, 'g');
                }

                return part.trim().replace(re, '');
            })
            .filter((x) => x.length)
            .join(slash);
    },
    listFilesDir: function (dir) {
        return new Promise(async (resolve, reject) => {
            try {
                let exists = await module.exports.checkPathExists(dir);

                if (!exists) {
                    return resolve([]);
                }
            } catch (e) {
                return reject(e);
            }

            fs.readdir(dir, function (err, filesData) {
                //handling error
                if (err) {
                    return reject(err);
                }

                resolve(filesData);
            });
        });
    },
    loadScriptEnv: function () {
        let repo_root = module.exports.repoRoot();

        const process = require('process');

        process.chdir(repo_root);

        require('dotenv').config();
    },
    makeDir: function (dir) {
        return new Promise(async (resolve, reject) => {
            let exists = await module.exports.checkPathExists(dir);

            if (exists) {
                resolve();
            } else {
                try {
                    fs.mkdir(dir, function (err) {
                        if (err) {
                            return reject();
                        }

                        return resolve();
                    });
                } catch (e) {}
            }
        });
    },
    readFile: function (p, json) {
        return new Promise((resolve, reject) => {
            fs.readFile(p, function (err, data) {
                if (err) {
                    return reject(err);
                }

                if (data) {
                    data = data.toString();
                }

                if (json) {
                    try {
                        data = JSON.parse(data);
                    } catch (e) {
                        return reject(e);
                    }
                }

                return resolve(data);
            });
        });
    },
    repoRoot: function () {
        let slash = `/`;

        if (process.platform.startsWith('win')) {
            slash = `\\`;
        }

        let path_split = __dirname.split(slash);

        let path_split_slice = path_split.slice(0, path_split.length - 1);

        return path_split_slice.join(slash);
    },
    writeFile: function (file_path, data) {
        return new Promise(async (resolve, reject) => {
            let dir_name = require('path').dirname(file_path);

            try {
                if (!(await module.exports.checkPathExists(dir_name))) {
                    await module.exports.createDirectoryIfNotExistsRecursive(dir_name);
                }
            } catch (e) {}

            fs.writeFile(file_path, data, (err) => {
                if (err) {
                    console.error(err);
                    return reject(err);
                } else {
                    resolve();
                }
            });
        });
    },
};
