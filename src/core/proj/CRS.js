import { factory, projection } from '../index';

/**
 * Coordinate reference system (CRS) factory.
 * 
 * &nbsp;
 * 
 * Arguments `code` and `def` are supplied in pair, the code must match the definition.
 * If omitted, factory will default to Spherical Mercator, EPSG: 3857.
 *
 * Scales, resolutions and distances are different representations of the same thing.
 * Provide only one of these! If multiple of these are provided to factory,
 * scales will override resolutions which in turn override distances. Scales are used internally,
 * the other two are converted.
 * 
 * Distances are calculated based on monitor dpi, thus the final scales output will vary between
 * application instances. Variation in scales will break server-side caching of rasters served via WMS,
 * these require a fixed set of scales values in the grid-set matrix. Avoid distances when caching is required. 
 * 
 * &nbsp;
 * 
 * @factory crs (code: string, def: string, opt?: Object): crs
 * 
 * @param {string} code - Code of the desired projection, as specified by the European Petroleum Survey Group.
 * @param {string} def - Proj4 definition of the desired projection. Must match the supplied code.
 * @param {Object} [opt] - Configuration object.
 * @param {Transformation} [opt.transformation] - Transforms projected coordinates to pixel coordinates.
 * @param {number[]} [opt.origin] - The pixel origin of the map. Represented in projected coordinates.
 * @param {number[]} [opt.bounds] - Rectangular area in pixel coordinates.
 * @param {number[]} [opt.scales] - Array of scales. [pixels / projected coordinates]
 * @param {number[]} [opt.resolutions] - Array of resolutions. [projected coordinates / pixels]
 * @param {number[]} [opt.distances] - Array of available distances. [numbers in meters]
 * 
 * @returns crs;
 * 
 * @example
 *      crs('EPSG: 4326',
 *          '+proj=utm +zone=38 +ellps=WGS84 +datum=WGS84 +units=m +no_defs',
 *          {
 *              origin: [-180.0, 90.0],
 *              distances: [ 5000000, 2500000, 1000000, 750000, 500000,
 *                           250000, 100000, 75000, 50000, 25000, 10000,
 *                           7500, 5000, 2500, 1000, 750, 500, 250, 100 ]
 *          });
 */
export function crs (code, def, opt) {
    const options = {..._opt, ...opt};
    const { CRS } = factory;

    return {
        ...CRS,
        code: code,
        def: def,
        options: options,
        projection: projection(this.code, this.def, options.bounds),
        transformation: _setTransformation(options),
        scales: _setScales(options),
        infinite: !options.bounds,
        ...proto
    };
}

const proto = {
    /**
     * Mean Earth Radius = 6371000 m, as recommended for use by
     * the International Union of Geodesy and Geophysics.
     *
     * The Earth radius R varies from 6356.752 km at the poles to 6378.137 km at the equator.
     * Perhaps this number can be tweaked based on mean latitude of the project country,
     * in order to improve accuracy.
     * 
     * Expressed in meters [m].
     *
     * @private
     * @constant
     * @type {number}
     */
    R: 6371000,

    /**
     * Uses `Haversine` formula to calculate the distance between two geographical points.
     * Calculates great circle distance on an assumed sphere, which the Earth is not.
     *
     * Mean error appromixation is 0.5% and the calculation is best on small distances, less than 5km,
     * which is what we need.
     * It is far better than the spherical law of cosine approximation, due to use of sine,
     * while the latter uses cosine which approaches 0.9999~ on very small distances and may result in
     * large errors due to rounding (JS engine does 15 digits though, currently).
     * Similar case can be made for arctangent in the angular distance caclucation `c` below.
     *
     * Its use is mostly visual rather than technical, still if the accuracy is insufficient
     * we should consider Vincenty' formula (accurate to 0.1mm)
     * (this is a very fine site in general)
     * https://www.movable-type.co.uk/scripts/latlong-vincenty.html
     * 
     * &nbsp;
     *
     * @function distance (latlng1: LatLng, latlng2: LatLng): number <distance in [m]>
     * 
     * @param {LatLng} latlng1 - latitude / longitude pair A.
     * @param {LatLng} latlng2 - latitude / longitude pair B.
     * 
     * @returns {number} distance in meters [A to B];
     */
    distance (latlng1, latlng2) {
        let rad = Math.PI / 180;
        // convert latitude degrees to radians for easier trigonometry
        let phi1 = latlng1.lat * rad,
            phi2 = latlng2.lat * rad;
        // sine of latitude difference, in radians
        let delta_phi = Math.sin((latlng2.lat - latlng1.lat) * rad / 2);
        //sine of longitude difference, in radiance
        let delta_lambda = Math.sin((latlng2.lng - latlng1.lng) * rad / 2);
        // square of half the chord length between pA and pB
        let a = delta_phi * delta_phi + Math.cos(phi1) * Math.cos(phi2) * delta_lambda * delta_lambda;
        // andgular distance, in radiance
        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt( 1- a));

        return this.R * c;  // distance in meters
    },

    /**
     * Calculate the current scale.
     * 
     * Returns the scale used when transforming projected coordinates
     * into pixel coordinates for a particular zoom.
     * The original proto.CRS implementation uses `256 * 2^zoom` for Mercator-based CRS.
     * 
     * &nbsp;
     *
     * @override proto.CRS.scale
     * @function scale (zoom: number): number
     * 
     * @param {number} zoom - The current zoom value.
     * 
     * @returns Scale number value;
     */
    scale (zoom) {
        let iZoom = Math.floor(zoom),
            baseScale,
            nextScale,
            scaleDiff,
            zDiff;

        if (zoom === iZoom) {
            return this.scales[zoom];
        } else {
            baseScale = this.scales[iZoom];
            nextScale = this.scales[iZoom + 1];
            scaleDiff = nextScale - baseScale;
            zDiff = zoom - iZoom;

            return baseScale + scaleDiff * zDiff;
        }
    },

    /**
     * Calculate the current zoom.
     * 
     * Inverse of `this.scale`. Calculates the zoom level corresponding to a scale factor of `scale`.
     * The original iCRS implementaion uses `Math.log(scale / 256) / Math.LN2` for calculation.
     *
     * &nbsp;
     * 
     * @override iCRS.zoom
     * @function zoom (scale: number): number
     * 
     * @param {number} scale - The current scale value.
     * 
     * @returns Zoom number value;
     */
    zoom (scale) {
        let downScale = _closestElement(this.scales, scale),
            downZoom = this.scales.indexOf(downScale),
            nextScale,
            nextZoom;

        // Check if scale is downScale => return array index
        if (scale === downScale) { return downZoom; }
        if (downScale === undefined) { return -Infinity; }
        // Interpolate
        nextZoom = downZoom + 1;
        nextScale = this.scales[nextZoom];
        if (nextScale === undefined) { return Infinity; }

        return (scale - downScale) / (nextScale - downScale) + downZoom;
    },
};

/** Default configuration */
const _opt = {
    /**
     * Transforms projected coordinates to pixel coordinates.
     *
     * Represents an affine transformation: a set of coefficients `a`, `b`, `c`, `d`
     * for transforming a point of a form `(x, y)` into `(a*x + b, c*y + d)` and back.
     *
     * default transformation, default coef = [1, 0, -1, 0].
     */
    transformation: factory.transformation(1, 0, -1, 0),
    /**
     * The pixel origin of the map.
     *
     * Locates the coordinates of the upper left corner of the boundary of the map,
     * represented in the current projection. In other words, locates tile (0,0), the first tile.
     *
     * For default EPSG: 3857 bounds are +/- 20037508.342789244 at the equator R.
     */
    origin: [ 
        +(Math.round(Math.PI * proto.R + ('e+' + 2)) + ('e-' + 2)),
        +(Math.round(Math.PI * proto.R + ('e+' + 2)) + ('e-' + 2))
    ],

    /**
     * Array representation of the map scales as real-world distances in meters.
     * Corresponds to different zoom levels of the map.
     */
    distances: [
        5000000,
        2500000,
        1000000, // 10 km
        750000,
        500000,
        250000,
        100000, // 1000m or 1 km
        75000,
        50000,
        25000,
        10000, // 100m
        7500,
        5000,
        2500,
        1000, // 1000 cm = 10 m
        750,
        500,
        250,
        100 // 1m
    ]
};

/**
 * crs.scales setter. 
 * 
 * Calculates and converts distances => resolutions => scales. 
 * Consequently data flow is in the opposite direction, scales before resolutions before distances.
 * 
 * &nbsp;
 * 
 * @private
 * @function _setScales (options: Object): Number[]
 * 
 * @param {Object} options - crs configuration object.
 * @param {Number []} [options.scales] - Array of scales. [pixels / projected coordinates]
 * @param {Number []} [options.resolutions] - Array of resolutions. [projected coordinates / pixels]
 * @param {Number []} [options.distances] - Array of available distances. [numbers in meters]
 * 
 * @returns Calculated scales [];
 */
let _setScales = function ({scales : s, resolutions: r, distances: d}) {
    return s ? s
        : r ? _setResolutions(r)
        : d ? _setDistances(d)
        : [];
};

/**
 * Coverts resolutions to scales.
 * 
 * &nbsp;
 * 
 * @private
 * @function _setResolutions (arr: Number[]): Number[]
 * 
 * @param {Number []} arr - Array of resolutions.
 * 
 * @returns Scales [];
 */
let _setResolutions = function (arr) {
    return arr.map((r) => { return 1 / r; });
};

/**
 * Converts distances to scales, via resoltuion calculation.
 * 
 * Considers current monitor dpi in the calculation, thus output may vary.
 * Variable output most ceratinly breaks raster server-side caching.
 * Use with caution, may need to re-test for possible mixups in metrics, such as [m] instead of [cm].
 * 
 * &nbsp;
 * 
 * @private
 * @function _setDistances (arr: Number[]): Number[]
 * 
 * @param {Number []} arr - Array of distances.
 * 
 * @returns Scales[];
 */
let _setDistances = function (arr) {
    /**
     * The current monitor dpi.
     * 
     * @const
     * @type {number}
     */
    const _dpi = (function (b, a, i, c) {
        c = (d, e) => e >= d ? (a = d + (e - d) / 2, b(a) > 0 && (a === d || b(a - 1) <= 0) ? a 
        : b(a) <= 0 ? c(a + 1, e) 
        : c(d, a - 1)) : -1

        for (i = 1; b(i) <= 0;) i *= 2

        return c(i / 2, i) | 0;
    })( x => matchMedia(`(max-resolution: ${x}dpi)`).matches )

    /**
     * Number of pixels in 1cm of screen width. [ppm = pixels per meter]
     * 
     * @constant
     * @type {number}
     */
    const _ppm = (_dpi / 2.54).toFixed(4)

    /**
     * Calculate resolutions from distances via a ref number of pixels.
     * 
     * @constant
     * @type {number}
     */
    const _r = arr.map((d) => { return (d / 100) / _ppm; }) 

    return _setResolutions(_r);
};

/**
 * crs.options.transfomation setter.
 * 
 * Sets transformation based on the options.origin provided.
 * 
 * &nbsp;
 * 
 * @private
 * @function _setTransformation (opt: Object): Transformation
 * 
 * @param {Object} opt - crs configuration object.
 * 
 * @returns Transformation;
 */
let _setTransformation = function (opt) {
    return opt.origin
        ? factory.transformation(1, -opt.origin[0], -1, opt.origin[1])
        : opt.transformation;
};

/**
 * Get the closest lowest element in an array.
 * 
 * &nbsp;
 * 
 * @private
 * @function _closestElement (arr: Number[], el: number): number
 * 
 * @param {Number[]} arr - Array of numbers.
 * @param {number} el - The limit integer against which the term closest is measured.
 * 
 * @returns The closest lowest integer element; 
 */
let _closestElement = function (arr, el) {
    let nLow;

    for (let i = arr.length; i--;) {
        if (arr[i] <= el && (nLow === undefined || nLow < arr[i])) {
            nLow = arr[i];
        }
    }

    return nLow;
};