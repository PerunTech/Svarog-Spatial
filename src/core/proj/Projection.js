import proj4 from 'proj4';
import { Class, factory } from '../index';

/**
 * Define a projection.
 * 
 * &nbsp;
 * 
 * @private
 * @function define (code: string, def: string): Projection
 * 
 * @param {string} code - CRS code, as specified by the European Petroleum Survey Group. 
 * @param {string} def  - Proj4 defintion of the projection specified by the code.
 * 
 * @returns Projection;
 */
function _defineProj (code, def) {
    if (def) {
        proj4.defs(code, def);
    } else if (proj4.defs[code] === undefined) {
        let urn = code.split(':');
        if (urn.length > 3) {
            code = urn[urn.length - 3] + ':' + urn[urn.length - 1];
        }
        if (proj4.defs[code] === undefined) {
            throw 'No projection definition for code ' + code;
        }
    }

    return proj4(code);
}

/**
 * @public
 * @class Projection
 * @extends {Class}
 */
export const Projection = Class.extend({
    /**
     * @constructs Projection
     */
    init (code, def, bounds) {
        this._proj = _defineProj(code, def);
        this.bounds = bounds;
    },
    
    /**
     * Converts a latitude / longitude pair to a (x,y) point,
     * given the instance projection.
     * 
     * &nbsp;
     * 
     * @function project (latlng: LatLng): Point
     * 
     * @param {LatLng} latlng - A latitude / longitude pair.
     * 
     * @returns Point; 
     */
    project (latlng) {
        let pf = this._proj.forward([latlng.lng, latlng.lat]);

        return factory.point(pf[0], pf[1]);
    },

    /**
     * Converts a (x,y) point to a latitude / longitude pair,
     * given the instance projection.
     * 
     * &nbsp;
     * 
     * @function unproject (p: Point): LatLng
     * 
     * @param {Point} p - A point[x, y].
     * 
     * @returns LatLng; 
     */
    unproject (p, unbounded) {
        let pi = this._proj.inverse([p.x, p.y]);

        return factory.latLng(pi[1], pi[0], unbounded);
    }
})