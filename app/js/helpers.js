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

function colorRgb2Lab (rgb){
    let r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255, x, y, z;
    r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
    x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
    y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
    z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
    x = (x > 0.008856) ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
    y = (y > 0.008856) ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
    z = (z > 0.008856) ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;
    return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)]
}

function colorHexToRgb (hex) {
    var r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);

    return [r, g, b];
}

function presentWhiteFont(color_hex) {
    let colorFromData = colorHexToRgb('#000000');

    let colorToData = colorHexToRgb(color_hex);

    const distance = colorDeltaE(colorFromData, colorToData);

    return distance < 70;
}