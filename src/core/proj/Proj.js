import {Core} from '../Core'
import {IRender} from '../../interface/IRender'
import {IProj} from '../../interface/IProj'

export const Proj = (function () {
    /**
     * @class Projection
     * @extends Core
     */
    let Projection = Core.extend({
        // constructor function
        init: function(code, def, bounds) {
            this._proj = IProj.define(code, def);
            this.bounds = bounds;
        },

        project: function (latlng) {
            let p = this._proj.forward([latlng.lng, latlng.lat]);

            return IRender.point(p[0], p[1]);
        },

        unproject: function (p, unbounded) {
            let pi = this._proj.inverse([p.x, p.y]);

            return IRender.latLng(pi[1], pi[0], unbounded);
        }
    })

    return {
        /**
         * @factory projection
         *
         * Defines a projection.
         *
         * @param {String} code
         *        CRS code, as specified by the European Petroleum Survey Group.
         *        (e.g. EPSG: 4326)
         * @param {String} def
         *        Proj4 defintion of the projection.
         *        (e.g. '+proj=utm +zone=38 +ellps=WGS84 +datum=WGS84 +units=m +no_defs')
         * @param {Object} bounds
         *        rectangular area in pixel coordinates
         *
         * @returns Projection, as defined in proj4 (MetaCRS sub) and extended for our purposes
         */
        projection: function (code, def, bounds) {
            return new Projection(code, def, bounds);
        }
    }
})()
