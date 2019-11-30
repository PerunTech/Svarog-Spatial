import { R } from '../../config';

/**
 * Handles the init hook for polylines and circles.
 * Implements the showOnHover functionality if called for.
 */
export function addInitHook () {
    let showOnHover = this.options.measurementOptions && this.options.measurementOptions.showOnHover;

    if (this.options.showMeasurements && !showOnHover) {
        this.showMeasurements();
    }
    if (this.options.showMeasurements && showOnHover) {
        this.on('mouseover', function() {
            this.showMeasurements();
        });
        this.on('mouseout', function() {
            this.hideMeasurements();
        });
    }
}

/**
 * `#revise_me`, may move to /core/util if deemed useful elsewhere.
 * 
 * @param {Function} method 
 * @param {Function} fn 
 * @param {boolean} hookAfter
 */
export function override (method, fn, hookAfter) {
    if (!hookAfter) {
        return function() {
            let protoVal = method.apply(this, arguments);
            let args = Array.prototype.slice.call(arguments)
            args.push(protoVal);
            return fn.apply(this, args);
        }
    } else {
        return function() {
            fn.apply(this, arguments);
            return method.apply(this, arguments);
        }
    }
}

export function formatDistance (d) {
    let unit, feet;

    if (this._measurementOptions.imperial) {
        feet = d / 0.3048;
        if (feet > 3000) {
            d = d / 1609.344;
            unit = 'mi';
        } else {
            d = feet;
            unit = 'ft';
        }
    } else {
        if (d > 1000) {
            d = d / 1000;
            unit = 'km';
        } else {
            unit = 'm';
        }
    }

    return d < 100
        ? d.toFixed(1) + ' ' + unit
        : Math.round(d) + ' ' + unit;
}

export function formatArea (a) {
    let unit;

    if (this._measurementOptions.imperial) {
        if (a > 404.685642) {
            a = a / 4046.85642;
            unit = 'ac';
        } else {
            a = a / 0.09290304;
            unit = 'ft²';
        }
    } else {
        if (a > 1000000) {
            a = a / 1000000;
            unit = 'km²';
        } else {
            unit = 'm²';
        }
    }

    return a < 100
        ? a.toFixed(1) + ' ' + unit
        : Math.round(a) + ' ' + unit;
}

export function ringArea (coords) {
    let p1, p2, p3, lowerIndex, middleIndex, upperIndex, 
        area = 0,
        coordsLength = coords.length,
        rad = (deg) => deg * Math.PI / 180;

    if (coordsLength > 2) {
        for (let i = 0; i < coordsLength; i++) {
            if (i === coordsLength - 2) {// i = N-2
                lowerIndex = coordsLength - 2;
                middleIndex = coordsLength -1;
                upperIndex = 0;
            } else if (i === coordsLength - 1) {// i = N-1
                lowerIndex = coordsLength - 1;
                middleIndex = 0;
                upperIndex = 1;
            } else { // i = 0 to N-3
                lowerIndex = i;
                middleIndex = i+1;
                upperIndex = i+2;
            }
            p1 = coords[lowerIndex];
            p2 = coords[middleIndex];
            p3 = coords[upperIndex];
            area += ( rad(p3.lng) - rad(p1.lng) ) * Math.sin( rad(p2.lat));
        }

        area = area * R * R / 2;
    }

    return Math.abs(area);
}

export function circleArea (d) {
    return 2 * Math.PI * R * R * (1 - Math.cos(d / R));
}

