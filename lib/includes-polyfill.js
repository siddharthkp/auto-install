'use strict';

Array.prototype.includes = function includes(searchElement) {
    if (this == null) {
        throw new TypeError('Array.prototype.includes called on null or undefined');
    }

    var O = Object(this);
    var len = parseInt(O.length, 10) || 0;
    if (len === 0) {
        return false;
    }
    var n = parseInt(arguments[1], 10) || 0;
    var k = void 0;
    if (n >= 0) {
        k = n;
    } else {
        k = len + n;
        if (k < 0) {
            k = 0;
        }
    }
    var currentElement = void 0;
    while (k < len) {
        currentElement = O[k];
        if (searchElement === currentElement || searchElement !== searchElement && currentElement !== currentElement) {
            // NaN !== NaN
            return true;
        }
        k++;
    }
    return false;
};