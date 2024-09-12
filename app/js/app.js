window['befriend'] = {
    init: function () {
        console.log("Befriend: [init]");

        return new Promise(async (resolve, reject) => {
            cordova.plugins.notification.local.addActions('activity-request', [
                { id: 'yes', title: 'Accept' },
                { id: 'no', title: 'Decline' },
                { id: 'view', title: 'View' },
            ]);

            cordova.plugins.notification.local.schedule({
                title: 'Invite: Coffee with Eugene',
                text: '10:30 am at Dolores Park',
                actions: [
                    { id: 'yes', title: 'Yes' },
                    { id: 'no',  title: 'No' }
                ],
                foreground: true,
                smallIcon: 'res://n_icon.png',
                // icon: ''
            });

            resolve();
        });
    }
};