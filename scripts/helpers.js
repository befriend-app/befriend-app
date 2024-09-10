module.exports = {
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
    isMac: process.platform === 'darwin',
    isWindows: process.platform.startsWith('win')
};