// https://github.com/egekhter/life-minute-photos/blob/main/scripts/build_frontend.js

const { joinPaths, writeFile, repoRoot, loadScriptEnv} = require('../helpers');

loadScriptEnv();

const Terser = require("terser");
const csso = require('csso');

const path = require('path');
const sass = require('sass');
const yargs = require('yargs');

const args = yargs.argv;

let appPackage = require('../../package.json');

let inputs = {
    js: joinPaths(repoRoot(), `app/js`),
    scss: joinPaths(repoRoot(), `app/scss`, 'styles.scss')
};

let outputs = {
    js: joinPaths(repoRoot(), 'www/js/app.js'),
    css: joinPaths(repoRoot(), 'www/css/styles.css')
};

let js_files = {
    frontend: [
        'app.js', //app first
        'helpers.js',
        'init.js', //init last
    ]
};

let build_ip = false;


function loadFile(fp) {
    return new Promise(async (resolve, reject) => {
        require('fs').readFile(fp, 'utf8', function (err, data) {
            if(err) {
                return reject(err);
            }

            return resolve(data);
        });
    });
}

function readJS() {
    return new Promise(async(resolve, reject) => {
        const ios = js_files.frontend.map(function (f) {
            let fp = joinPaths(inputs.js, f);
            return loadFile(fp);
        });

        try {
            let data = await Promise.all(ios);

            resolve(data.join('\n\n'));
        } catch(e) {
            console.error(e);
        }
    });
}

function awaitBuild() {
    return new Promise((resolve, reject) => {
        let i = setInterval(function () {
            if(!build_ip) {
                resolve();
                clearInterval(i);
            }
        }, 100);
    });
}

module.exports = {
    build: async function (version, minify) {
        if(!version) {
            version = appPackage.version;
        }

        return new Promise(async (resolve, reject) => {
            console.log("Build app js/css");

            if(build_ip) {
                await awaitBuild();
            }

            build_ip = true;

            //compile scss to css
            try {
                let css_obj = await sass.compile(inputs.scss);

                let css_code = css_obj.css;

                if(minify) {
                    css_code = csso.minify(css_code).css;
                }

                await writeFile(outputs.css, css_code);
            } catch(e) {
                console.error(e);
            }

            try {
                let js_code = await readJS();

                if(minify) {
                    let _js = await Terser.minify(js_code);
                    js_code = _js.code;
                }

                let current_year = new Date().getFullYear();

                let copy_right = `/* ${appPackage.displayName} v${version}  | © ${current_year} */
`;
                js_code = copy_right + '\n' + js_code;

                await writeFile(outputs.js, js_code);

                console.log("Build complete");

                build_ip = false;

                resolve();
            } catch (e) {
                build_ip = false;
                console.error(e);
                reject();
            }
        });
    }
};

if(!module.parent) {
    module.exports.build(null, false);
}