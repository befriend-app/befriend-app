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


    // for(let cl of textarea_el.classList) {
    //     addClassEl(cl, test_el);
    // }

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