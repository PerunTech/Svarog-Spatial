import L from 'leaflet';
import { Util } from '../core/Util';
import { Interface } from '../core/Interface';

/**
 * @interface iFactory
 */
export const iFactory = Interface.define(L, {
    /**
     * Coordinate reference system interface.
     * 
     * @interface iCRS
     */
    iCRS () {
        return L.CRS;
    },

    /**
     * Creates an object representing a geographical point with the given
     * latitude `lat` and longitude `lng` (and optionally altitude `alt`).
     * 
     * &nbsp;
     *
     * @factory latLng(latitude: Number, longitude: Number, altitude?: Number): LatLng
     * 
     * @alternative Expects an array of the form `[Number, Number]` or `[Number, Number, Number]` instead.
     * @factory latLng(coords: Array): LatLng
     * 
     * @alternative Expects an object of the form `{lat: Num, lng: Num}` or `{lat: Num, lng: Num, alt: Num}`.
     * @factory latLng(coords: Object): LatLng
     * 
     * @param {Number} lat - Latitude.
     * @param {Number} lng - Longitutde.
     * @param {Number} [alt] - Altitude.
     * 
     * @return LatLng;
     */
    latLng (lat, lng, alt) {
        // Argument check
        if (lat instanceof L.LatLng || lat === undefined || lat === null ) { return lat; }
        // Object arg
        if (typeof lat === 'object' && 'lat' in lat) {
            return L.latLng(lat.lat, 'lng' in lat ? lat.lng : lat.lon, lat.alt);
        }
        // Coords arg
        if (Util.isArray(lat) && typeof lat[0] !== 'object') {
            if (lat.length === 3) { return L.latLng(lat[0], lat[1], lat[2]); }
            if (lat.length === 2) { return L.latLng(lat[0], lat[1]); }
            return null;
        }

        return L.latLng(lat, lng, alt);
    },

    /**
     * Creates a Point object with the given `x` and `y` coordinates.
     * If optional `r` is set to true, rounds the `x` and `y` values.
     * 
     * &nbsp;
     * 
     * @factory point(x: Number, y: Number, round?: Boolean)
     * 
     * @alternative Expects an array of the form `[x, y]` instead.
     * @factory point(coords: Number[])
     * 
     * @alternative Expects a plain object of the form `{x: Number, y: Number}` instead.
     * @factory point(coords: Object)
     * 
     * @param {Number} x - The x coordinate.
     * @param {Number} y - The y coordinate.
     * @param {Boolean} [r] - Round flag.
     * 
     * @returns Point;
     */
    point (x, y, r) {
        // Argument check
        if (x instanceof L.Point || x === undefined || x === null) { return x; }
        // Object arg
        if (typeof x === 'object' && 'x' in x && 'y' in x) { return L.point(x.x, x.y); }
        // Coords arg
        if (Util.isArray(x)) { return L.point(x[0], x[1]); }

        return L.point(x, y, r);
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
     * @factory transformation(a: Number, b: Number, c: Number, d: Number): Transformation
     * 
     * @alternative Expects an coefficients array of the form `[a: Number, b: Number, c: Number, d: Number]`.
     * @factory transformation(coefficients: Array): Transformation
     * 
     * @param {Number} a - Multiplicator of x.
     * @param {Number} b - Offset of x.
     * @param {Number} c - Multiplicator of y.
     * @param {Number} d - Offset of y.
     * 
     * @returns Transformation {};
     */
    transformation (a, b, c, d) {
        // Coef array arg
        if (Util.isArray(a)) { return L.transformation(a[0], a[1], a[2], a[3]); }

        return L.transformation(a, b, c, d);
    }
})