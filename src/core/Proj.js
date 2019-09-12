import {Core} from './Core'
import { Util } from 'leaflet'

import {IRender} from '../interface/IRender'
import {IProj} from '../interface/IProj'

export const Proj = (function () {

    /*
    let _setScales = function (opt) {

    }
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

                if (this.options.origin) {
                    this.transformation = IRender.transformation(
                        1, -this.options.origin[0],
                        -1, this.options.origin[1]);
                }

                if (this.options.scales) {
                    this._scales = this.options.scales;
                } else if (this.options.resolutions) {
                    this._scales = [];

                    for (let i = this.options.resolutions.length - 1; i >= 0; i--) {
                        if (this.options.resolutions[i]) {
                            this._scales[i] = 1 / this.options.resolutions[i];
                        }
                    }
                }

                this.infinite = !this.options.bounds;
            },

            scale: function (zoom) {
                let iZoom = Math.floor(zoom),
                    baseScale,
                    nextScale,
                    scaleDiff,
                    zDiff;

                if (zoom === iZoom) {
                    return this._scales[zoom];
                } else {
                    baseScale = this._scales[iZoom];
                    nextScale = this._scales[iZoom + 1];
                    scaleDiff = nextScale - baseScale;
                    zDiff = zoom - iZoom;

                    return baseScale + scaleDiff * zDiff;
                }
            },

            zoom: function (scale) {
                let downScale = this._closestElement(this._scales, scale),
                    downZoom = this._scales.indexOf(downScale),
                    nextScale,
                    nextZoom;

                    // Check if scale is downScale => return array index
                if (scale === downScale) { return downZoom; }
                if (downScale === undefined) { return -Infinity; }

                // Interpolate
                nextZoom = downZoom + 1;
                nextScale = this._scales[nextZoom];
                if (nextScale === undefined) { return Infinity; }

                return (scale - downScale) / (nextScale - downScale) + downZoom;
            },

            _closestElement: function () {}
        })
    }
})()
