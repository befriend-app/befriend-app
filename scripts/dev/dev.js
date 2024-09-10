let {devPort, joinPaths, loadScriptEnv, repoRoot} = require('../helpers');

(async function() {
    loadScriptEnv();

    let express = require('express');
    let app = express();

    app.use(express.static(joinPaths(repoRoot(), 'www')));

    let server = app.listen(devPort());
})();