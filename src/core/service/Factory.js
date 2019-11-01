import { util, iSpatial, CRS, Projection } from '../index';

/**
 * Class factory.
 * 
 * Mixes local classes with plugin implementations. Hides the lovely word `new`.
 * Provides variations in the instantiation approach. Provides a healthy separation
 * between a caller and a constructor.
 * 
 * &nbsp;
 * 
 * @public
 * @namespace factory
 */
export const factory = {
    /**
     * Bounding box factory.
     * 
     * Arguments should be two pairs ([x1, y1], [x2, y2]) of geographically correct values. These two points
     * should stand diagonally opposite of each other as corners of a rectangle. Think south-west point and
     * north-east point, i.e bottom left and top right.
     * 
     * Any combination of Array|string|number is supported for the arguments, i.e ('x1,y1,x2,y2)
     * or ([[x1],[y1],[x2],[y2]) etc. Objects are not supported, transformation to Array is deferred to the caller.
     * 
     * `#revise_me`, Consider different CRS between data and map, some inputs are cartesian while other are lat/long.
     * If coordinates need to be reprojected, transformation should occur in the middle of the pipe, 
     * after normalizing and before assembly. At that point, data looks [number, number, ...number],
     * so a simple map functor will do. 
     * 
     * &nbsp;
     * 
     * @factory boundingBox (coords: ...Array | string | number): BBox
     * 
     * @param {...Array | string | number} coords - Two meaningful pairs of diagonally opposite coordinates.
     *                                     Expressable in any combination of arrays / strings / numbers. 
     * @returns BBox; 
     */
    boundingBox () {
        return iSpatial.latLngBounds(function assemble (arr) {
                return [[arr[0], arr[1]], [arr[2], arr[3]]];
            }(util.normalize([...arguments], Number)));
    },

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
     * @factory crs (code: string, def: string, opt?: Object): CRS
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
     * @returns CRS;
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
    crs (code, def, opt = {}) {
        return new CRS(code, def, opt);
    },

    /**
     * Creates an object representing a geographical point with the given
     * latitude `lat` and longitude `lng` (and optionally altitude `alt`).
     * 
     * &nbsp;
     *
     * @factory latLng(latitude: number, longitude: number, altitude?: number): LatLng
     * 
     * @alternative Expects an array of the form `[Number, Number]` or `[Number, Number, Number]` instead.
     * @factory latLng(coords: Array): LatLng
     * 
     * @alternative Expects an object of the form `{lat: Num, lng: Num}` or `{lat: Num, lng: Num, alt: Num}`.
     * @factory latLng(coords: Object): LatLng
     * 
     * @param {number} lat - Latitude.
     * @param {number} lng - Longitutde.
     * @param {number} [alt] - Altitude.
     * 
     * @return LatLng;
     */
    latLng (lat, lng, alt) {
        // Argument check
        if (lat instanceof iSpatial.LatLng || lat === undefined || lat === null ) { return lat; }
        // Object arg
        if (typeof lat === 'object' && 'lat' in lat) {
            return iSpatial.latLng(lat.lat, 'lng' in lat ? lat.lng : lat.lon, lat.alt);
        }
        // Coords arg
        if (util.isArray(lat) && typeof lat[0] !== 'object') {
            if (lat.length === 3) { return iSpatial.latLng(lat[0], lat[1], lat[2]); }
            if (lat.length === 2) { return iSpatial.latLng(lat[0], lat[1]); }
            return null;
        }

        return iSpatial.latLng(lat, lng, alt);
    },

    
    /**
     * Creates a Point object with the given `x` and `y` coordinates.
     * If optional `r` is set to true, rounds the `x` and `y` values.
     * 
     * &nbsp;
     * 
     * @factory point(x: number, y: number, round?: boolean): Point
     * 
     * @alternative Expects an array of the form `[x, y]` instead.
     * @factory point(coords: Number[]): Point
     * 
     * @alternative Expects a plain object of the form `{x: number, y: number}` instead.
     * @factory point(coords: Object): Point
     * 
     * @param {number} x - The x coordinate.
     * @param {number} y - The y coordinate.
     * @param {boolean} [r] - Round flag.
     * 
     * @returns Point;
     */
    point (x, y, r) {
        // Argument check
        if (x instanceof iSpatial.Point || x === undefined || x === null) { return x; }
        // Object arg
        if (typeof x === 'object' && 'x' in x && 'y' in x) { return iSpatial.point(x.x, x.y); }
        // Coords arg
        if (util.isArray(x)) { return iSpatial.point(x[0], x[1]); }

        return iSpatial.point(x, y, r);
    },

    /**
     * Defines a projection.
     * 
     * &nbsp;
     *
     * @factory projection(proto: Object, code: string, def: string, bounds: Object): Projection  
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
    projection (code, def, bounds) {
        return new Projection(code, def, bounds);
    },

    /**
     * Instantiates a Transformation object with the given coefficients.
     *
     * Transforms projected coordinates to pixel coordinates. Represents an affine transformation,
     * a set of coefficients `a`, `b`, `c`, `d` for transforming a point of a form `(x, y)`
     * into `(a*x + b, c*y + d)` and back.
     * 
     * &nbsp;
     *
     * @factory transformation(a: number, b: number, c: number, d: number): Transformation
     * 
     * @alternative Expects an coefficients array of the form `[a: number, b: number, c: number, d: number]`.
     * @factory transformation(coefficients: Array): Transformation
     * 
     * @param {number} a - Multiplicator of x.
     * @param {number} b - Offset of x.
     * @param {number} c - Multiplicator of y.
     * @param {number} d - Offset of y.
     * 
     * @returns Transformation {};
     */
    transformation (a, b, c, d) {
        // Coef array arg
        if (util.isArray(a)) { return iSpatial.transformation(a[0], a[1], a[2], a[3]); }

        return iSpatial.transformation(a, b, c, d);
    }
};
