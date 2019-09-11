import proj4 from 'proj4'
import {Core} from './Core'
import {IRender} from '../interface/IRender'

export const Proj = (function () {

    let _isProj = function (obj) {
        return (typeof obj.inverse !== 'undefined'
            && typeof obj.forward !== 'undefined')
    }

    return {
        Projection: Core.extend({
            // constructor function
            init: function(code, def, bounds) {
                let isProj = _isProj(code)
                this._proj = isProj ? code : this._projFromCodeDef(code, def);
                this.bounds = isProj ? def : bounds;
            },

            project: function (latlng) {
                let p = this._proj.forward([latlng.lng, latlng.lat]);

                return IRender.point(p[0], p[1]);
            },

            unproject: function (p, unbounded) {
                let pi = this._proj.inverse([p.x, p.y]);

                return IRender.latLng(pi[1], pi[0], unbounded);
            },

            _projFromCodeDef: function(code, def) {
                console.log(proj4)
                if (def) {
                    proj4.defs(code, def);
                } else if (proj4.defs[code] === undefined) {
                    var urn = code.split(':');
                    if (urn.length > 3) {
                        code = urn[urn.length - 3] + ':' + urn[urn.length - 1];
                    }
                    if (proj4.defs[code] === undefined) {
                        throw 'No projection definition for code ' + code;
                    }
                }

                return proj4(code);
            }
        }),

        CRS: Core.extend({
        })


    }
})()
