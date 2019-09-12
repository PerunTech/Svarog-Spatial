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
            /**
             * Mean Earth Radius = 6371000, as recommended for use by
             * the International Union of Geodesy and Geophysics.
             *
             * The Earth radius R vraies from 6356.752 km at the poles to 6378.137 km at the equator.
             * Perhaps this number can be tweaked based on mean latitude of the project country,
             * in order to improve accuracy.
             */
            R: 6371000,

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

            /**
             * @function distance
             * (latlng1: LatLng, latlng2: LatLng): distance [m] {Number}
             *
             * Uses `Haversine` formula to calculate the distance between two geographical points.
             * Calculates great circle distance on an assumed sphere, which the Earth is not.
             *
             * Mean error appromixation is 0.5% and the calculation is best on small distances, less than 5km,
             * which is what we need.
             * It is far better than the spherical law of cosine approximation, due to use of sine,
             * while the latter uses cosine which approaches 0.9999~ on very small distances and may result in
             * large errors due to rounding. (JS engine does 15 digits though, currently)
             *
             * Its use is mostly visual rather than technical, still if the accuracy is insufficient
             * we should consider Vincenty' formula (accurate to 0.1mm)
             * (this is a very fine site in general)
             * https://www.movable-type.co.uk/scripts/latlong-vincenty.html
             *
             * @param {LatLng} latlng1
             * @param {LatLng} latlng2
             *
             * @return distance in meters
             */
            distance: function (latlng1, latlng2) {
                let rad = Math.PI / 180;
                // convert latitude degrees to radians for easier trigonometry
                let phi1 = latlng1.lat * rad,
                    phi2 = latlng2.lat * rad;

                // sine of latitude difference, in radians
                let delta_phi = Math.sin((latlng2.lat - latlng1.lat) * rad / 2);
                //sine of longitutde difference, in radiance
                let delta_lambda = Math.sin((latlng2.lng - latlng1.lng) * rad / 2);

                // square of half the chord length between pA and pB
                let a = delta_phi * delta_phi + Math.cos(phi1) * Math.cos(phi2) * delta_lambda * delta_lambda;
                // andgular distance, in radiance
                let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt( 1- a));

                return this.R * c;  // distance in meters
            },

            _closestElement: function () {}
        })
    }
})()
