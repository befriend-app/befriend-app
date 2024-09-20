befriend.html = {
    appInit: function () {
        return new Promise(async (resolve, reject) => {
            let html = `
            <div id="app">
                <header>
                    <div id="logo">
                        <img src="/img/logo.png">
                    </div>
                </header>
                
                <div id="activities">
                    <h1>Choose Activity</h1>
                    <h3># Persons</h3>
                    <div class="slider">
                        <span>1</span>
                        <input id="range-num-persons" class="range" type="range" value="1" min="1" max="10" step="1">
                    </div>
                    
                    <div id="activity-button">
                        Submit
                    </div>
                </div>
            </div>
        `;

            document.body.insertAdjacentHTML("beforeend", html);

            resolve();
        });
    }
}