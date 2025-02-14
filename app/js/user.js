befriend.user = {
    local: {
        key: 'user.json',
        data: {},
    },
    device: {
        token: null,
    },
    person: {
        token: null,
    },
    login: {
        token: null,
    },
    init: function () {
        return new Promise(async (resolve, reject) => {
            befriend.user.loadLocal();

            let localData = befriend.user.getLocal();

            if (localData.person && localData.person.token) {
                befriend.user.person.token = localData.person.token;
            }

            if (localData.login && localData.login.token) {
                befriend.user.login.token = localData.login.token;
            }

            if (localData.device && localData.device.token) {
                befriend.user.device.token = localData.device.token;
            }

            if (localData.me) {
                if (localData.me.sections && localData.me.sections.collapsed) {
                    befriend.me.data.sections.collapsed = localData.me.sections.collapsed;
                }
            }

            if(localData?.notifications?.networks) {
                befriend.notifications.data.networks = localData.notifications.networks;
            }

            if(localData?.notifications?.removed) {
                befriend.notifications.data.removed = localData.notifications.removed;
            }

            resolve();
        });
    },
    loadLocal: function () {
        let data = window.localStorage.getItem(befriend.user.local.key);

        if (data) {
            try {
                data = JSON.parse(data);
                befriend.user.local.data = data;
            } catch (e) {
                console.error(e);
            }
        }
    },
    getLocal: function () {
        return befriend.user.local.data;
    },
    setLocal: function (key, value) {
        let data = befriend.user.getLocal();

        setNestedValue(data, key, value);

        befriend.user.saveLocal();
    },
    saveLocal: function () {
        window.localStorage.setItem(
            befriend.user.local.key,
            JSON.stringify(befriend.user.local.data),
        );
    },
    sameDeviceToken: function (token) {
        let data = befriend.user.getLocal();

        if(!data.device || data.device.token !== token) {
            return false;
        }

        return true;
    },
    setDeviceToken: function (token) {
        befriend.user.device.token = token;

        befriend.user.setLocal('device.token', token);
    },
    setPersonToken: function (token) {
        befriend.user.person.token = token;

        befriend.user.setLocal('person.token', token);
    },
    setLoginToken: function (token) {
        befriend.user.login.token = token;

        befriend.user.setLocal('login.token', token);
    },
    getReviewsHtml: function (person, with_count) {
        const reviews = person.reviews;

        if (!reviews) {
            return '';
        }

        const ratings = [
            { name: 'Safety', current_rating: parseFloat(reviews.safety) },
            { name: 'Trust', current_rating: parseFloat(reviews.trust) },
            { name: 'Timeliness', current_rating: parseFloat(reviews.timeliness) },
            { name: 'Friendliness', current_rating: parseFloat(reviews.friendliness) },
            { name: 'Fun', current_rating: parseFloat(reviews.fun) }
        ];

        let reviews_html = '';

        for(let rating of ratings) {
            reviews_html += `
            <div class="review">
                <div class="name">
                    ${rating.name}
                </div>
                
                <div class="rating-display">
                    <div class="value">${rating.current_rating.toFixed(1)}</div>
                </div>
                
                <div class="stars">
                    <div class="stars-container">
                        ${Array(5)
                    .fill()
                    .map((_, i) => {
                        const fillPercentage = Math.max(0, Math.min(100, (rating.current_rating - i) * 100));
                        const fillStyle = fillPercentage === 0 ? 'fill: transparent;' :
                            fillPercentage === 100 ? `fill: ${befriend.variables.brand_color_a};` :
                                `fill: ${befriend.variables.brand_color_a}; clip-path: polygon(0 0, ${fillPercentage}% 0, ${fillPercentage}% 100%, 0 100%);`;
    
                        return `
                                <div class="star-container">
                                    <svg class="outline" viewBox="0 0 24 24">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                    </svg>
                                    <svg class="fill" viewBox="0 0 24 24" style="${fillStyle}">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                    </svg>
                                </div>
                            `}).join('')}
                    </div>
                </div>
            </div>
        `;
        }

        let count_html = '';

        if(with_count) {
            count_html = `<div class="count">${person.reviews.count} review${person.reviews.count !== 1 ? 's' : ''}</div>`;
        }

        return `${count_html}
                <div class="reviews-container">${reviews_html}</div>`
    }
};
