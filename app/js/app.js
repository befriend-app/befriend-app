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
                title: 'Coffee',
                text: '10:30 am',
                actions: [
                    { id: 'yes', title: 'Yes' },
                    { id: 'no',  title: 'No' }
                ],
                foreground: true,
                smallIcon: 'res://n_icon.png',
                icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzfXKe6Yfjr6rCtR6cMPJB8CqMAYWECDtDqH-eMnerHHuXv9egrw'
            });

            resolve();
        });
    }
};