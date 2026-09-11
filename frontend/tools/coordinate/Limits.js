import { Map } from '../../core';
import { setting } from '../../config';
import { coordinate } from '..';

/**
 * Coordinate bounds checking, against the deployment's spatial limits.
 *
 * The limits were captured once, as this module evaluated, from the SYS_BOUNDS
 * constant. They are read per call since 4.2.1, so `configure({ bounds })`
 * reaches a session already under way. The cost is a little arithmetic over a
 * two-element array on coordinate entry, not per frame — and it drops a load
 * order coupling too, since `Map.transform` no longer has to be callable at the
 * moment this module is imported.
 */
export const limits = (function () {
    const latlngLimits = () => {
        const bounds = setting('bounds');

        return [
            [bounds[0].lat, bounds[1].lat],     // [lat min/max]
            [bounds[0].lng, bounds[1].lng]];    // [lng min/max]
    };

    const xyLimits = () => {
        const bounds = setting('bounds');
        const projBounds = [Map.transform(bounds[0]), Map.transform(bounds[1])];

        return [
            [projBounds[0].x, projBounds[1].x].map(c => c.toFixed(0)),   // [x min/max]
            [projBounds[0].y, projBounds[1].y].map(c => c.toFixed(0))];  // [y min/max]
    };

    const isBetween = (val, min, max) => (val - min) * (val - max) <= 0;

    const checkSpherical = (val, idx) => {
        const range = latlngLimits()[idx],
            _val = coordinate.toDD(val);

        return isBetween(_val, range[0], range[1]);
    }

    const checkCartesian = (val, idx) => {
        const range = xyLimits()[idx],
            min = Number(range[0]).toFixed(0).substr(0, val.length),
            max = Number(range[1]).toFixed(0).substr(0, val.length);

        return isBetween(val, min, max);
    }

    return {
        getRange: (idx, proj) => proj 
            ? `${xyLimits()[idx][0]} - ${xyLimits()[idx][1]}` 
            : `${latlngLimits()[idx][0]} - ${latlngLimits()[idx][1]}`,

        isBounded: (val, idx, proj) => proj ? checkCartesian(val, idx) : checkSpherical(val, idx)
    }
})();
