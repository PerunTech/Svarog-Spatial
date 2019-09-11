import {Core} from './Core'
import { Util } from 'leaflet'

import {IRender} from '../interface/IRender'
import {IProj} from '../interface/IProj'

export const Proj = (function () {

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

    let projection = function (code, def, bounds) {
        return new Projection(code, def, bounds);
    }

    return {
        CRS: Core.extend({
            includes: IRender.crs(),
            options: {
                transformation: IRender.transformation(1, 0, -1, 0)
            },

            init: function (code, def, opt = {}) {
                this.projection = projection(code, def, opt.bounds)
                this.code = code;
                this.transformation = this.options.transformation;

                Util.setOptions(this, opt);

                // handle origin, scales, resolutions, infinite flag
            }

            // scale, zoom,
        })


    }
})()
