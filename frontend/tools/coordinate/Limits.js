import { Map } from '../../core';
import { SYS_BOUNDS } from '../../config';
import { coordinate } from '..';

export const limits = (function () {
    const projBounds = [Map.transform(SYS_BOUNDS[0]), Map.transform(SYS_BOUNDS[1])];
        
    const latlngLimits = [
        [SYS_BOUNDS[0].lat, SYS_BOUNDS[1].lat],     // [lat min/max]
        [SYS_BOUNDS[0].lng, SYS_BOUNDS[1].lng]];    // [lng min/max]
        
    const xyLimits = [
        [projBounds[0].x, projBounds[1].x].map(c => c.toFixed(0)),   // [x min/max]
        [projBounds[0].y, projBounds[1].y].map(c => c.toFixed(0))];  // [y min/max]

    const isBetween = (val, min, max) => (val - min) * (val - max) <= 0;

    const checkSpherical = (val, idx) => {
        const range = latlngLimits[idx],
            _val = coordinate.toDD(val);

        return isBetween(_val, range[0], range[1]);
    }

    const checkCartesian = (val, idx) => {
        const range = xyLimits[idx],
            min = Number(range[0]).toFixed(0).substr(0, val.length),
            max = Number(range[1]).toFixed(0).substr(0, val.length);

        return isBetween(val, min, max);
    }

    return {
        getRange: (idx, proj) => proj 
            ? `${xyLimits[idx][0]} - ${xyLimits[idx][1]}` 
            : `${latlngLimits[idx][0]} - ${latlngLimits[idx][1]}`,

        isBounded: (val, idx, proj) => proj ? checkCartesian(val, idx) : checkSpherical(val, idx)
    }
})();