import { util } from '..';
import L from 'leaflet';
import 'leaflet-polylinedecorator';
import 'leaflet.fullscreen'
/* Clustering, for point sets too large to draw a marker at a time. Reached as
   `factory.markerClusterGroup` through the spread below, like the other plugins.

   Order is load-bearing here, and not in the way an import list usually is: this
   plugin takes no leaflet argument and extends whatever `L` it finds on `window`
   -- which exists because leaflet assigns it even when it is imported rather
   than scripted. Imported before leaflet it would throw on a missing global; the
   line above it is what puts one there. */
import 'leaflet.markercluster'
import * as extendedWms from './WMS'
import * as googleMutant from './google/Leaflet.GoogleMutant'

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
    /** Merge leaflet */
    ...L,
    ...extendedWms,
    ...googleMutant,

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
    boundingBox() {
        return L.latLngBounds(function assemble(arr) {
            return [[arr[0], arr[1]], [arr[2], arr[3]]];
        }(util.normalize([...arguments], Number)));
    },

    /**
     * GeoJSON factory.
     * 
     * Creates a GeoJSON layer. Optionally accepts an object in GeoJSON format to display on the map 
     * (you can alternatively add it later with addData method) and an options object.
     * 
     * Supports any valid coordinate reference system, spherical or cartesian.
     * Automatically reprojects data.
     * 
     * &nbsp;
     * 
     * @extends {factory.GeoJSON}
     * @factory geoJson (geojson: any, opt: Object): GeoJson
     * 
     * @param {*} geojson - Geojson object.
     * @param {*} opt - Configuration object.
     * 
     * @returns GeoJSON;
     */
    geoJSON(geojson, opt) {
        return L.geoJSON(geojson, opt);
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
    latLng(lat, lng, alt) {
        // Argument check
        if (lat instanceof L.LatLng || lat === undefined || lat === null) { return lat; }
        // Object arg
        if (typeof lat === 'object' && 'lat' in lat) {
            return L.latLng(lat.lat, 'lng' in lat ? lat.lng : lat.lon, lat.alt);
        }
        // Coords arg
        if (util.isArray(lat) && typeof lat[0] !== 'object') {
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
    point(x, y, r) {
        // Argument check
        if (x instanceof L.Point || x === undefined || x === null) { return x; }
        // Object arg
        if (typeof x === 'object' && 'x' in x && 'y' in x) { return L.point(x.x, x.y); }
        // Coords arg
        if (util.isArray(x)) { return L.point(x[0], x[1]); }

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
    transformation(a, b, c, d) {
        // Coef array arg
        if (util.isArray(a)) { return L.transformation(a[0], a[1], a[2], a[3]); }

        return L.transformation(a, b, c, d);
    }
};