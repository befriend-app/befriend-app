befriend.events = {
    addEvents: function () {
        return new Promise(async (resolve, reject) => {
            try {
                await befriend.activities.events();
            } catch(e) {
                console.error(e);
            }

            resolve();
        });
    }
}