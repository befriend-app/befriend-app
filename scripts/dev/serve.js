let { devPort, joinPaths, loadScriptEnv, repoRoot } = require('../helpers');

(async function () {
    //load env variables
    loadScriptEnv();

    //start server
    let express = require('express');
    let app = express();

    app.use(express.static(joinPaths(repoRoot(), 'www')));

    let server = app.listen(devPort());

    //watch for file changes
    require('../dev/watch');
})();
