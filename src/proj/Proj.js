import { Core } from '../core/Core';
import { iFactory } from '../interface/IFactory';
import { iProj } from '../interface/IProj';

/**
 * @private
 * @class Projection
 * @extends {Core}
 */
let Projection = Core.extend({
    /**
     * @constructs Projection
     */
    init: function(code, def, bounds) {
        this._proj = iProj.define(code, def);
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
    project: function (latlng) {
        let pf = this._proj.forward([latlng.lng, latlng.lat]);

        return iFactory.point(pf[0], pf[1]);
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
    unproject: function (p, unbounded) {
        let pi = this._proj.inverse([p.x, p.y]);

        return iFactory.latLng(pi[1], pi[0], unbounded);
    }
})

/**
 * Defines a projection.
 * 
 * &nbsp;
 *
 * @factory projection(code: string, def: string, bounds: Object): Projection  
 *   
 * @param {string} code - CRS code, as specified by the European Petroleum Survey Group. 
 * @param {string} def - Proj4 defintion of the projection specified by the `code`.
 * @param {Object} bounds - Rectangular area in pixel coordinates.
 * 
 * @returns Projection, as defined in proj4 (MetaCRS sub) and extended for our purposes;
 * 
 * @example
 *      projection('EPSG: 4326', '+proj=utm +zone=38 +ellps=WGS84 +datum=WGS84 +units=m +no_defs')
 *
 */
export const projection = function (code, def, bounds) {
    return new Projection(code, def, bounds);
}