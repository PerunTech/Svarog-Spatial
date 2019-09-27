import { Util } from '../core/Util';
import { Interface } from '../core/Interface';
import L from 'leaflet';
// import { CRS, latLng, LatLng, point, Point, transformation } from 'leaflet'

/**
 * @interface iFactory
 */
export const iFactory = Interface.define(L, {
    /**
     * Coordinate reference system interface.
     * 
     * Includes:
     *  - latLngToPoint(latlng: LatLngExpression, zoom: number): Point;
     *  - pointToLatLng(point: PointExpression, zoom: number): LatLng;
     *  - project(latlng: LatLng | LatLngLiteral): Point;
     *  - unproject(point: PointExpression): LatLng;
     *  - scale(zoom: number): number;
     *  - zoom(scale: number): number;
     *  - getProjectedBounds(zoom: number): Bounds;
     *  - distance(latlng1: LatLngExpression, latlng2: LatLngExpression): number;
     *  - wrapLatLng(latlng: LatLng | LatLngLiteral): LatLng;
     * 
     *  - code?: string;
     *  - wrapLng?: [number, number];
     *  - wrapLat?: [number, number];
     *  - infinite: boolean;
     * 
     * &nbsp;
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
        if (Util.isArray(a)) { return L.transformation(a[0], a[1], a[2], a[3]); }

        return L.transformation(a, b, c, d);
    }
})