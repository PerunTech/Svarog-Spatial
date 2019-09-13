import {Core} from '../Core'
import {Util} from 'leaflet'
import {Proj} from './Proj'
import {IRender} from '../../interface/IRender'

/**
 * @class CRS
 * @extends Core
 * @implements iCRS
 */
let CRS = Core.extend({
    // merge custom crs implementation,
    // methods required in fundamental map and assets operations
    includes: IRender.crs(),
    //config
    options: {
        transformation: IRender.transformation(1, 0, -1, 0)
    },
    /**
     * Mean Earth Radius = 6371000 m, as recommended for use by
     * the International Union of Geodesy and Geophysics.
     *
     * The Earth radius R vraies from 6356.752 km at the poles to 6378.137 km at the equator.
     * Perhaps this number can be tweaked based on mean latitude of the project country,
     * in order to improve accuracy.
     */
    R: 6371000, // in meters [m]

    // constructor
    init: function (code, def, opt = {}) {
        this.projection = Proj.projection(code, def, opt.bounds)
        this.code = code;

        Util.setOptions(this, opt);

        this.transformation = this._setTransformation(this.options);
        this._scales = this._setScales(this.options);
        this.infinite = !this.options.bounds;
    },

    /**
     * @function scale
     * (zoom: Number): Number
     * @override iCRS.scale
     *
     * Returns the scale used when transforming projected coordinates
     * into pixel coordinates for a particular zoom.
     *
     * The original iCRS implementation uses `256 * 2^zoom` for Mercator-based CRS.
     *
     * @param {Number} zoom
     *
     * @returns Scale number value
     */
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

    /**
     * @function zoom
     * (scale: Number): Number
     * @override iCRS.zoom
     *
     * Inverse of `this.scale`. Calculates the zoom level corresponding to a scale factor of `scale`.
     *
     * The original iCRS implementaion uses `Math.log(scale / 256) / Math.LN2` for calculation.
     *
     * @param {Number} scale
     *
     * @returns Zoom number value
     */
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
     * `#revise_me`
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

    // `#revise_me`, may move to crs instance scope and provide runtime accessor.
    _setTransformation: function (opt) {
        return opt.origin
            ? IRender.transformation(1, -opt.origin[0], -1, opt.origin[1])
            : opt.transformation;
    },

    // `#revise_me`, may move to crs instance scope and provide runtime accessor.
    // access may create more problems than solutions,
    // why change scales definition in middle of operation?
    _setScales: function (opt) {
        let scales = [];
        // exit if config has scales
        if (opt.scales) { return opt.scales; }

        if (opt.resolutions) {
            for (let i = opt.resolutions.length - 1; i >= 0; i--) {
                if (opt.resolutions[i]) {
                    scales[i] = 1 / opt.resolutions[i];
                }
            }
        }

        return scales;
    },

    // Get the closest lowest element in an array.
    // `#revise_me`, may move to private scope in root CRS or Util if use is found.
    _closestElement: function (arr, el) {
        let nLow;
		for (let i = arr.length; i--;) {
			if (arr[i] <= el && (nLow === undefined || nLow < arr[i])) {
				nLow = arr[i];
			}
        }

		return nLow;
    }
})

/**
 * @factory crs
 *
 * @param {String} code
 *        CRS code, as specified by the European Petroleum Survey Group.
 *        (e.g. EPSG: 4326)
 * @param {String} def
 *        Proj4 defintion of the projection.
 *        (e.g. '+proj=utm +zone=38 +ellps=WGS84 +datum=WGS84 +units=m +no_defs')
 * @param {Object} opt
 *        Configuration object
 *
 * @return CRS
 */
export const crs = function (code, def, opt = {}) {
    // implement factory
    // add resolution generation per config, consider monitor dpi
    return new CRS(code, def, opt);
}