import { Class } from '../core/Class';
import { Factory } from '../class/Factory';
import { iProj } from '../interface/IProj';
import { protoProj } from '../prototype/ProtoProj'

/**
 * @private
 * @class Projection
 * @extends {Class}
 */
export const Projection = Class.extend({

    implements: iProj,

    /**
     * @constructs Projection
     */
    init (proto = protoProj, code, def, bounds) {
        this._proj = proto.define(code, def);
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

        return Factory.point(pf[0], pf[1]);
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

        return Factory.latLng(pi[1], pi[0], unbounded);
    }
})