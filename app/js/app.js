window['befriend'] = {
    init: function () {
        console.log("Befriend: [init]");

        return new Promise(async (resolve, reject) => {
            cordova.plugins.notification.local.addActionGroup('activity-request', [
                { id: 'yes', title: 'Confirm' },
                { id: 'no', title: 'Decline' },
                // { id: 'view', title: 'View' },
            ]);

            cordova.plugins.notification.local.schedule({
                title: 'Coffee',
                text: '10:30 am',
                actions: [
                    { id: 'yes', title: 'Yes' },
                    { id: 'no',  title: 'No' }
                ],
                foreground: true
            });

            resolve();
        });
    }
};