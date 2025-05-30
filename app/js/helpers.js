const earth_radius_km = 6371;
const kms_per_mile = 1.60934;
const meters_to_miles = 0.000621371192;

String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

function addClassEl(name, el) {
    if (typeof el !== 'object') {
        el = document.getElementById(el);
    }

    if (!el) {
        return;
    }

    if (!el.classList.contains(name)) {
        el.classList.add(name);
    }
}

async function setElHeightDynamic(el, ret_only) {
    let cs = getComputedStyle(el);

    let paddingX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
    let paddingY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);

    let borderX = parseFloat(cs.borderLeftWidth) + parseFloat(cs.borderRightWidth);

    let width = el.offsetWidth - paddingX - borderX;

    let test_el = el.cloneNode(true);

    test_el.style.transition = 'none';

    await rafAwait();

    test_el.style.visibility = 'hidden';
    test_el.style.position = 'absolute';
    test_el.style.width = `${width}px`;
    test_el.style.removeProperty('height');

    el.parentNode.appendChild(test_el);

    let height = test_el.scrollHeight - paddingY;

    test_el.parentNode.removeChild(test_el);

    if (ret_only) {
        return height;
    }

    el.style.height = `${height}px`;
}

function elHasClass(el, cl) {
    if (!el) {
        return false;
    }

    if (typeof el === 'string') {
        el = document.getElementById(el);
    }

    if (!el) {
        return false;
    }

    return el.classList.contains(cl);
}

function fireClick(node) {
    if (typeof node === 'string') {
        node = document.getElementById(node);
    }

    if (!node) {
        return;
    }

    if (
        node.nodeName.toLowerCase() === 'input' &&
        node.getAttribute('type') === 'checkbox' &&
        (is_ios || is_android)
    ) {
        node.click();
    } else if (document.createEvent) {
        var evt = document.createEvent('MouseEvents');
        evt.initEvent('click', true, false);
        node.dispatchEvent(evt);
    } else if (document.createEventObject) {
        node.fireEvent(`on${'click'}`);
    } else if (typeof node[`on${'click'}`] == 'function') {
        node[`on${'click'}`]();
    }
}

function fireTouch(node) {
    if (typeof node === 'string') {
        node = document.getElementById(node);
    }

    if (!node) {
        return;
    }

    // Handle checkbox special case for iOS/Android
    if (
        node.nodeName.toLowerCase() === 'input' &&
        node.getAttribute('type') === 'checkbox' &&
        (is_ios || is_android)
    ) {
        node.click();
        return;
    }

    // Try to create touch event first
    try {
        const touchEvent = new TouchEvent('touchstart', {
            bubbles: true,
            cancelable: true,
            view: window,
        });
        node.dispatchEvent(touchEvent);
    } catch (e) {
        // Fallback to mouse events if TouchEvent is not supported
        if (document.createEvent) {
            const evt = document.createEvent('MouseEvents');
            evt.initEvent('touchstart', true, false);
            node.dispatchEvent(evt);

            // Also dispatch click for better compatibility
            const clickEvt = document.createEvent('MouseEvents');
            clickEvt.initEvent('click', true, false);
            node.dispatchEvent(clickEvt);
        } else if (document.createEventObject) {
            // For older IE versions
            node.fireEvent('ontouchstart');
            node.fireEvent('onclick');
        } else if (typeof node.ontouchstart === 'function') {
            node.ontouchstart();
            node.onclick?.();
        }
    }
}

function formatRound(number) {
    const numStr = number.toString();

    if (numStr.endsWith('.0')) {
        return Math.floor(number);
    }

    const parts = numStr.split('.');
    if (parts.length === 1 || parts[1].length === 1) {
        return number;
    }

    const firstDecimal = parseInt(parts[1][0]);
    const secondDecimal = parseInt(parts[1][1]);

    if (secondDecimal >= 6) {
        return Math.round((firstDecimal + 1) * 10) / 100 + Math.floor(number);
    } else {
        return firstDecimal / 10 + Math.floor(number);
    }
}

function formattedNumberDisplay(value) {
    if (value >= 1000000) {
        const millions = value / 1000000;
        return (millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1)) + 'm';
    } else if (value >= 10000) {
        const thousands = value / 1000;
        return (thousands % 1 === 0 ? thousands.toFixed(0) : thousands.toFixed(1)) + 'k';
    } else {
        return value.toLocaleString();
    }
}

function getFriendlyDateFromString(date_str) {
    let date = date_str.substring(0, 10);
    let split = date.split('-');

    let year = split[0].substring(2);
    let month = split[1];
    let day = split[2];

    month = month.replace(/^0+/, ''); // '1'
    day = day.replace(/^0+/, ''); // '12'

    return `${month}/${day}/${year}`;
}

function isToday(timestamp) {
    // Create Date objects for the timestamp and now
    const timestampDate = new Date(timestamp * 1000);
    const today = new Date();

    // Compare year, month, and day
    return (
        timestampDate.getFullYear() === today.getFullYear() &&
        timestampDate.getMonth() === today.getMonth() &&
        timestampDate.getDate() === today.getDate()
    );
}

function isTomorrow(timestamp) {
    const timestampDate = new Date(timestamp * 1000);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    return (
        timestampDate.getFullYear() === tomorrow.getFullYear() &&
        timestampDate.getMonth() === tomorrow.getMonth() &&
        timestampDate.getDate() === tomorrow.getDate()
    );
}

function generateToken(length) {
    if (!length) {
        length = 32;
    }

    //edit the token allowed characters
    let a = 'abcdefghijklmnopqrstuvwxyz1234567890'.split('');
    let b = [];

    for (let i = 0; i < length; i++) {
        let j = (Math.random() * (a.length - 1)).toFixed(0);
        b[i] = a[j];
    }

    return b.join('');
}

function deg2rad(deg) {
    return (deg * Math.PI) / 180;
}

function calculateDistance(loc_1, loc_2, in_km) {
    const dLat = deg2rad(loc_2.lat - loc_1.lat);
    const dLon = deg2rad(loc_2.lon - loc_1.lon);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((loc_1.lat * Math.PI) / 180) *
            Math.cos((loc_1.lat * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    if (in_km) {
        return earth_radius_km * c;
    }

    return earth_radius_km * c * 1000;
}

function useKM() {
    //todo update dynamically
    let value = false;

    return value;
}

function hideLevel(level_el) {
    removeClassEl('show', level_el);
    level_el.style.height = '0';
}

function lastArrItem(els) {
    if (!els) {
        return null;
    }

    return els[els.length - 1];
}

function isNumeric(val) {
    return !isNaN(parseFloat(val)) && isFinite(val);
}

function isZIPFormat(str) {
    if (!str) return false;

    // Convert to string if it's a number
    const input = str.toString();

    // Patterns to match ZIP codes within text
    const zipPatterns = [
        /.*?(\d{5}-\d{4}).*/, // ZIP+4 with hyphen
        /.*?(\d{5})(?:-(?:\d{4})?)?.*/, // Basic 5-digit ZIP, optionally followed by hyphen and 4 digits
        /.*?(\d{9}).*/, // ZIP+4 without hyphen
    ];

    // Try to find a ZIP code in the string
    for (const pattern of zipPatterns) {
        const match = input.match(pattern);

        if (match) {
            return true;
        }
    }

    return false;
}

function metersToFeet(meters, decimals = 0) {
    return Number((meters * 3.28084).toFixed(decimals));
}

function removeClassEl(name, el) {
    if (typeof el !== 'object') {
        el = document.getElementById(el);
    }

    if (!el) {
        return;
    }

    if (el.classList.contains(name)) {
        el.classList.remove(name);
    }
}

function addElsClass(els, cls) {
    if (els && els.length) {
        for (let i = 0; i < els.length; i++) {
            let el = els[i];

            if (!el.classList.contains(cls)) {
                el.classList.add(cls);
            }
        }
    }
}

function removeElsClass(els, cls) {
    if (els && els.length) {
        for (let i = 0; i < els.length; i++) {
            let el = els[i];

            if (el.classList.contains(cls)) {
                el.classList.remove(cls);
            }
        }
    }
}

function getEventCoords(e) {
    if (e.touches) {
        return {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY,
        };
    }
    return {
        x: e.clientX,
        y: e.clientY,
    };
}

function isTouchDevice() {
    let prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');
    let mq = function (query) {
        return window.matchMedia(query).matches;
    };

    if ('ontouchstart' in window || (window.DocumentTouch && document instanceof DocumentTouch)) {
        return true;
    }

    let query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('');
    return mq(query);
}

function roundTimeMinutes(time, minutes) {
    let timeToReturn = new Date(time);

    timeToReturn.setMilliseconds(Math.round(timeToReturn.getMilliseconds() / 1000) * 1000);
    timeToReturn.setSeconds(Math.round(timeToReturn.getSeconds() / 60) * 60);
    timeToReturn.setMinutes(Math.round(timeToReturn.getMinutes() / minutes) * minutes);

    return timeToReturn;
}

function toggleElClass(el, css_class) {
    if (!el.classList.contains(css_class)) {
        el.classList.add(css_class);
    } else {
        el.classList.remove(css_class);
    }
}

function queueTimeouts(name, fun, ms) {
    if (!(name in befriend.timeouts)) {
        befriend.timeouts[name] = [];
    }

    for (let t of befriend.timeouts[name]) {
        clearTimeout(t);
    }

    let t = setTimeout(fun, ms);

    befriend.timeouts[name].push(t);
}

function setNestedValue(obj, path, value) {
    const keys = path.split('.');

    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];

        if (!(key in current)) {
            current[key] = {};
        }

        current = current[key];
    }

    current[keys[keys.length - 1]] = value;

    return obj;
}

function colorDeltaE(rgbA, rgbB) {
    let labA = colorRgb2Lab(rgbA);
    let labB = colorRgb2Lab(rgbB);
    let deltaL = labA[0] - labB[0];
    let deltaA = labA[1] - labB[1];
    let deltaB = labA[2] - labB[2];
    let c1 = Math.sqrt(labA[1] * labA[1] + labA[2] * labA[2]);
    let c2 = Math.sqrt(labB[1] * labB[1] + labB[2] * labB[2]);
    let deltaC = c1 - c2;
    let deltaH = deltaA * deltaA + deltaB * deltaB - deltaC * deltaC;
    deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH);
    let sc = 1.0 + 0.045 * c1;
    let sh = 1.0 + 0.015 * c1;
    let deltaLKlsl = deltaL / 1.0;
    let deltaCkcsc = deltaC / sc;
    let deltaHkhsh = deltaH / sh;
    let i = deltaLKlsl * deltaLKlsl + deltaCkcsc * deltaCkcsc + deltaHkhsh * deltaHkhsh;
    return i < 0 ? 0 : Math.sqrt(i);
}

function stringSimilarity(str1, str2, substringLength, caseSensitive) {
    // https://github.com/stephenjjbrown/string-similarity-js

    if (substringLength === void 0) {
        substringLength = 2;
    }
    if (caseSensitive === void 0) {
        caseSensitive = false;
    }
    if (!caseSensitive) {
        str1 = str1.toLowerCase();
        str2 = str2.toLowerCase();
    }
    if (str1.length < substringLength || str2.length < substringLength) return 0;
    let map = new Map();
    for (let i = 0; i < str1.length - (substringLength - 1); i++) {
        let substr1 = str1.substr(i, substringLength);
        map.set(substr1, map.has(substr1) ? map.get(substr1) + 1 : 1);
    }
    let match = 0;
    for (let j = 0; j < str2.length - (substringLength - 1); j++) {
        let substr2 = str2.substr(j, substringLength);
        let count = map.has(substr2) ? map.get(substr2) : 0;
        if (count > 0) {
            map.set(substr2, count - 1);
            match++;
        }
    }
    return (match * 2) / (str1.length + str2.length - (substringLength - 1) * 2);
}

function useWhiteOnBackground(hexColor) {
    // Remove the # if it's there
    hexColor = hexColor.replace('#', '');

    // Convert hex to RGB
    const r = parseInt(hexColor.substr(0, 2), 16);
    const g = parseInt(hexColor.substr(2, 2), 16);
    const b = parseInt(hexColor.substr(4, 2), 16);

    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // console.log({
    //     hexColor,
    //     luminance
    // })

    return luminance < 0.6 ? true : false;
}

function timeoutAwait(t) {
    return new Promise(async (resolve, reject) => {
        setTimeout(function () {
            resolve();
        }, t);
    });
}

function getImgDimensions(url) {
    return new Promise(async (resolve, reject) => {
        const img = new Image();

        img.onload = function () {
            resolve({
                width: img.width,
                height: img.height,
            });
        };

        img.onerror = function () {
            return reject('image not found');
        };
        img.src = url;
    });
}

function rafAwait() {
    return new Promise(async (resolve, reject) => {
        requestAnimationFrame(resolve);
    });
}

function sortObj(obj, key, desc) {
    if (typeof obj !== 'object') {
        return obj;
    }

    let newObj = {};

    let keys = Object.keys(obj);

    keys.sort(function (a, b) {
        if (desc) {
            return obj[b][key] - obj[a][key];
        } else {
            return obj[a][key] - obj[b][key];
        }
    });

    for (let key of keys) {
        newObj[key] = obj[key];
    }

    return newObj;
}

function removeArrItem(arr, item) {
    let index = arr.indexOf(item);

    if (index > -1) {
        arr.splice(index, 1);
    }
}

function numberWithCommas(x, to_integer) {
    if (!x) {
        return x;
    }

    if (to_integer) {
        x = Number.parseInt(x);
    }

    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function getTimezoneAbbreviation() {
    const date = new Date();
    const options = { timeZoneName: 'short' };

    const timeParts = date.toLocaleTimeString('en-US', options).split(' ');

    return timeParts[timeParts.length - 1];
}

function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function getFullDirectory(customDir) {
    return new Promise((resolve, reject) => {
        if (!is_app) {
            return resolve('');
        }

        befriend.plugins.fileSystem.getDataDirectory(
            function (baseDir) {
                let fullPath = customDir ? joinPaths(baseDir, customDir) : baseDir;

                resolve(fullPath);
            },
            function (error) {
                reject(error);
            },
        );
    });
}

function getFileData(filename, customDir) {
    return new Promise(async (resolve, reject) => {
        if (!is_app) {
            return resolve();
        }

        try {
            let directory = await getFullDirectory(customDir);

            let path = joinPaths(directory, filename);

            befriend.plugins.fileSystem.readFile(
                path,
                (data) => resolve(data),
                (error) => reject(error),
            );
        } catch (error) {
            reject(error);
        }
    });
}

function saveFileData(filename, data, customDir) {
    return new Promise(async (resolve, reject) => {
        if (!is_app) {
            return resolve();
        }

        try {
            let directory = await getFullDirectory(customDir);
            let path = joinPaths(directory, filename);

            befriend.plugins.fileSystem.writeFile(
                path,
                data,
                () => resolve(),
                (error) => reject(error),
            );
        } catch (error) {
            reject(error);
        }
    });
}

function getObjectFromDisk(schemaName, customDir) {
    return new Promise(async (resolve, reject) => {
        if (!is_app) {
            return resolve();
        }

        try {
            let filename = `${schemaName}.json`;

            let data = await getFileData(filename, customDir);

            resolve(JSON.parse(data));
        } catch (e) {
            console.error(e);
            reject(e);
        }
    });
}

function saveObjectToDisk(obj, schemaName, customDir) {
    return new Promise(async (resolve, reject) => {
        try {
            let data = JSON.stringify(obj);
            let filename = `${schemaName}.json`;

            await saveFileData(filename, data, customDir);

            resolve();
        } catch (e) {
            console.error(e);
            reject(e);
        }
    });
}

function getDistanceStr(location_1, location_2) {
    let distance_km = calculateDistance(location_1, location_2, true);

    let distance_miles = distance_km * kms_per_mile;

    if (useKM()) {
        return `${formatRound(distance_km)} km`;
    }

    return `${formatRound(distance_miles)} m`;
}

function isValidEmail(email) {
    let re =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function isValidPhone(phoneNumber, countryCode = '+1') {
    if (!phoneNumber) {
        return false;
    }

    // Strip all non-numeric characters
    const stripped = phoneNumber.replace(/\D/g, '');

    switch (countryCode) {
        case '+1':
            // US numbers should be 10 digits (or 11 with leading 1)
            if (stripped.length === 10) {
                return true;
            } else if (stripped.length === 11 && stripped.charAt(0) === '1') {
                return true;
            }
            return false;

        case '+44':
            // UK numbers should be 10 or 11 digits
            return (stripped.length === 10 || stripped.length === 11);

        default:
            // Default: must be at least 8 digits
            return stripped.length >= 8;
    }
}