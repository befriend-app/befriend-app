befriend.html.appInit = function () {
    return new Promise(async (resolve, reject) => {
        let html = `
            <div id="app">
                <div id="logo">
                    <img src="/img/logo.png">
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML("beforeend", html);

        resolve();
    });
}