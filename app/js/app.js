window["befriend"] = {
    classes: {
        placesShown: "display-places",
    },
    activities: null,
    places: null,
    events: null,
    html: null,
    styles: null,
    timeouts: {},
    location: null,
    els: {},
    init: function () {
        console.log("Befriend: [init]");

        return new Promise(async (resolve, reject) => {
            //html
            try {
                await befriend.html.appInit();
            } catch (e) {
                console.error(e);
            }

            //activities
            try {
                await befriend.activities.setWhen();
                await befriend.activities.setActivityTypes();
            } catch (e) {
                console.error(e);
            }

            //events
            try {
                await befriend.events.addEvents();
            } catch (e) {
                console.error(e);
            }

            try {
                await befriend.location.init();
            } catch (e) {
                console.error(e);
            }

            // cordova.plugins.notification.local.addActions('activity-request', [
            //     { id: 'yes', title: 'Accept' },
            //     { id: 'no', title: 'Decline' },
            //     { id: 'view', title: 'View' },
            // ]);
            //
            // cordova.plugins.notification.local.schedule({
            //     title: 'Invite: Coffee with Eugene',
            //     text: '10:30 am at Dolores Park',
            //     actions: [
            //         { id: 'yes', title: 'Yes' },
            //         { id: 'no',  title: 'No' }
            //     ],
            //     foreground: true,
            //     smallIcon: 'res://n_icon.png',
            //     // icon: ''
            // });

            resolve();
        });
    },
};
