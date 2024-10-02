function addClassEl(name, el) {
    if(typeof el !== 'object') {
        el = document.getElementById(el);
    }

    if(!el) {
        return;
    }

    if(!el.classList.contains(name)) {
        el.classList.add(name);
    }
}

function getElHeightHidden(el) {
    let cs = getComputedStyle(el);

    let paddingX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);

    let borderX = parseFloat(cs.borderLeftWidth) + parseFloat(cs.borderRightWidth);

    let width = el.offsetWidth - paddingX - borderX;

    let test_el = el.cloneNode(true);

    test_el.style.visibility = 'hidden';
    test_el.style.position = 'absolute';
    test_el.style.width = `${width}px`;
    test_el.style.removeProperty('height');

    el.parentNode.appendChild(test_el);

    let height = test_el.scrollHeight;

    test_el.parentNode.removeChild(test_el);

    return height;
}

function elHasClass(el, cl) {
    if(!el) {
        return false;
    }

    if(typeof el === 'string') {
        el = document.getElementById(el);
    }

    if(!el) {
        return false;
    }

    return el.classList.contains(cl);
}

function hideLevel(level_el) {
    removeClassEl('show', level_el);
    level_el.style.height = '0';
}

function lastArrItem(els) {
    if(!els) {
        return null;
    }

    return els[els.length - 1];
}

function isNumeric(obj) {
    return !isNaN( parseFloat(obj) ) && isFinite( obj );
}

function isZIPFormat(str) {
    if (!str) return false;

    // Convert to string if it's a number
    const input = str.toString();

    // Patterns to match ZIP codes within text
    const zipPatterns = [
        /.*?(\d{5}-\d{4}).*/, // ZIP+4 with hyphen
        /.*?(\d{5})(?:-(?:\d{4})?)?.*/, // Basic 5-digit ZIP, optionally followed by hyphen and 4 digits
        /.*?(\d{9}).*/ // ZIP+4 without hyphen
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
    if(typeof el !== 'object') {
        el = document.getElementById(el);
    }

    if(!el) {
        return;
    }

    if(el.classList.contains(name)) {
        el.classList.remove(name);
    }
}

function removeElsClass(els, cls) {
    if(els && els.length) {
        for(let i = 0; i < els.length; i++) {
            let el = els[i];

            if(el.classList.contains(cls)) {
                el.classList.remove(cls);
            }
        }
    }
}

function toggleElClass(el, css_class) {
    if(!el.classList.contains(css_class)) {
        el.classList.add(css_class);
    } else {
        el.classList.remove(css_class);
    }
}

function queueTimeouts(name, fun, ms) {
    if(!(name in befriend.timeouts)) {
        befriend.timeouts[name] = [];
    }

    for(let t of befriend.timeouts[name]) {
        clearTimeout(t);
    }

    let t = setTimeout(fun, ms);

    befriend.timeouts[name].push(t);
}

function colorDeltaE (rgbA, rgbB) {
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
    let deltaLKlsl = deltaL / (1.0);
    let deltaCkcsc = deltaC / (sc);
    let deltaHkhsh = deltaH / (sh);
    let i = deltaLKlsl * deltaLKlsl + deltaCkcsc * deltaCkcsc + deltaHkhsh * deltaHkhsh;
    return i < 0 ? 0 : Math.sqrt(i);
}

function stringSimilarity(str1, str2, substringLength, caseSensitive) {
    // https://github.com/stephenjjbrown/string-similarity-js

    if (substringLength === void 0) { substringLength = 2; }
    if (caseSensitive === void 0) { caseSensitive = false; }
    if (!caseSensitive) {
        str1 = str1.toLowerCase();
        str2 = str2.toLowerCase();
    }
    if (str1.length < substringLength || str2.length < substringLength)
        return 0;
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
    return (match * 2) / (str1.length + str2.length - ((substringLength - 1) * 2));
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