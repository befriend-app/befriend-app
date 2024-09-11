const fs = require('fs')

module.exports = {
    isMac: process.platform === 'darwin',
    isWindows: process.platform.startsWith('win'),
    dateTimeStr: function () {
        let date = new Date();

        return date.toISOString().slice(0, 10) + ' ' + date.toISOString().substring(11, 19);
    },
    devPort: function () {
        return parseInt(process.env.DEV_PORT || 3001);
    },
    execCmd: function(cmd) {
        return new Promise(async (resolve, reject) =>  {
            const { exec } = require('child_process');

            exec(cmd, (err, stdout, stderr) => {
                if (err) {
                    reject({
                        error: err,
                        stdout: stdout,
                        stderr: stderr
                    });
                } else {
                    resolve({
                        stdout: stdout
                    });
                }
            });
        });
    },
    joinPaths: function () {
        let args = [];

        for (let i = 0; i < arguments.length; i++) {
            let arg = arguments[i] + '';

            if(!arg) {
                continue;
            }
            args.push(arg);
        }

        let slash = '/';

        if(require('os').platform().startsWith('win')) {
            slash = '\\';
        }

        return args.map((part, i) => {
            let re;

            if (i === 0) {
                re = new RegExp(`[\\${slash}]*$`, 'g');
            } else {
                re = new RegExp(`(^[\\${slash}]*|[\\/]*$)`, 'g');
            }

            return part.trim().replace(re, '');
        }).filter(x=>x.length).join(slash)
    },
    loadScriptEnv: function () {
        let repo_root = module.exports.repoRoot();

        const process = require('process');

        process.chdir(repo_root);

        require('dotenv').config();
    },
    readFile: function(p, json) {
        return new Promise((resolve, reject) => {
            fs.readFile(p, function (err, data) {
                if(err) {
                    return reject(err);
                }

                if(data) {
                    data = data.toString();
                }

                if(json) {
                    try {
                        data = JSON.parse(data);
                    } catch (e) {
                        return reject(e);
                    }
                }

                return resolve(data);
            });
        })
    },
    repoRoot: function () {
        let slash = `/`;

        if(process.platform.startsWith('win')) {
            slash = `\\`;
        }

        let path_split = __dirname.split(slash);

        let path_split_slice = path_split.slice(0, path_split.length - 1);

        return path_split_slice.join(slash);
    },
    writeFile: function (file_path, data) {
        return new Promise(async (resolve, reject) => {
            fs.writeFile(file_path, data, (err) => {
                if (err) {
                    console.error(err);
                    return reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
};