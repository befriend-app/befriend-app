// https://github.com/egekhter/life-minute-photos/blob/main/scripts/build_frontend.js

const {
    joinPaths,
    writeFile,
    repoRoot,
    loadScriptEnv,
    readFile,
    isNumeric,
} = require('../helpers');

loadScriptEnv();

const Terser = require('terser');
const csso = require('csso');

const sass = require('sass');

let appPackage = require('../../package.json');

let inputs = {
    js: joinPaths(repoRoot(), `app/js`),
    scss: joinPaths(repoRoot(), `app/scss`, 'styles.scss'),
};

let outputs = {
    js: joinPaths(repoRoot(), 'www/js/app.js'),
    css: joinPaths(repoRoot(), 'www/css/styles.css'),
};

let styles_variables_file_name = `_variables_styles.js`;

let js_files = {
    frontend: [
        'vendor/axios.js',
        'vendor/dayjs.js',
        'vendor/mapbox.js',
        'app.js', //app first
        'device.js',
        'notifications.js',
        'user.js',
        'when.js',
        'friends.js',
        'maps.js',
        'activities.js',
        'modes.js',
        'filters.js',
        'me.js',
        'places.js',
        'location.js',
        'html.js',
        'styles.js',
        'reviews.js',
        'helpers.js',
        'modals.js',
        'events.js',
        'ws.js',
        styles_variables_file_name,
        'init.js', //init last
    ],
};

let build_ip = false;

function addStyleVariables() {
    return new Promise(async (resolve, reject) => {
        let styles_organized = {};

        let variables_str = await readFile(joinPaths(repoRoot(), 'app/scss/_variables.scss'));

        let variables_lines = variables_str.split('\n');

        for (let l of variables_lines) {
            if (l[0] === '$') {
                let l_split = l.split(':');

                if(l_split.length > 2) {
                    let str_arr = [];

                    for(let i = 1; i < l_split.length; i++) {
                        str_arr.push(l_split[i]);
                    }

                    let str = str_arr.join(':');

                    let first_item = l_split[0];

                    l_split = [first_item, str];
                }

                l_split[1] = l_split[1].trimStart();

                styles_organized[l_split[0].replace('$', '')] = l_split[1].replaceAll(';', '').replaceAll(`'`, '');
            }
        }

        for (let k in styles_organized) {
            if (styles_organized[k].includes('px')) {
                styles_organized[k] = parseFloat(styles_organized[k].replace('px', ''));
            } else if (styles_organized[k].endsWith('ms')) {
                styles_organized[k] = parseFloat(styles_organized[k].replace('ms', ''));
            } else if (styles_organized[k].includes('%')) {
                styles_organized[k] = styles_organized[k].replace('%', '');
                styles_organized[k] = styles_organized[k] / 100;
            } else if (isNumeric(styles_organized[k])) {
                styles_organized[k] = parseFloat(styles_organized[k]);
            }
        }

        let file_str = `befriend.variables = ${JSON.stringify(styles_organized)};
        `;

        try {
            await writeFile(joinPaths(inputs.js, styles_variables_file_name), file_str);
        } catch (e) {
            console.error(e);
        }

        resolve();
    });
}

function loadFile(fp) {
    return new Promise(async (resolve, reject) => {
        require('fs').readFile(fp, 'utf8', function (err, data) {
            if (err) {
                return reject(err);
            }

            return resolve(data);
        });
    });
}

function readJS() {
    return new Promise(async (resolve, reject) => {
        const ios = js_files.frontend.map(function (f) {
            let fp = joinPaths(inputs.js, f);
            return loadFile(fp);
        });

        try {
            let data = await Promise.all(ios);

            resolve(data.join('\n\n'));
        } catch (e) {
            console.error(e);
        }
    });
}

function awaitBuild() {
    return new Promise((resolve, reject) => {
        let i = setInterval(function () {
            if (!build_ip) {
                resolve();
                clearInterval(i);
            }
        }, 100);
    });
}

module.exports = {
    build: async function (version, minify) {
        if (!version) {
            version = appPackage.version;
        }

        return new Promise(async (resolve, reject) => {
            console.log('Build frontend: js/css');

            if (build_ip) {
                await awaitBuild();
            }

            build_ip = true;

            //compile scss to css
            try {
                let css_obj = await sass.compile(inputs.scss);

                let css_code = css_obj.css;

                if (minify) {
                    css_code = csso.minify(css_code).css;
                }

                await writeFile(outputs.css, css_code);
            } catch (e) {
                console.error(e);
            }

            //scss variables to js variables
            try {
                await addStyleVariables();
            } catch (e) {
                console.error(e);
            }

            try {
                let js_code = await readJS();

                if (minify) {
                    let _js = await Terser.minify(js_code);
                    js_code = _js.code;
                }

                let current_year = new Date().getFullYear();

                let copy_right = `/* ${appPackage.displayName} v${version}  | © ${current_year} */
`;
                js_code = copy_right + '\n' + js_code;

                await writeFile(outputs.js, js_code);

                console.log('Frontend built');

                build_ip = false;

                resolve();
            } catch (e) {
                build_ip = false;
                console.error(e);
                reject();
            }
        });
    },
};

if (require.main === module) {
    module.exports.build(null, false);
}
