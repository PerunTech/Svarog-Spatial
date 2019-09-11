import L from 'leaflet'
import {Util} from '../core/Util'

export const IRender = (function (L) {
    return {
        /**
         * @function get
         * (path?: String): Object
         *
         * @param {String} path
         *
         * @returns (render.path || undefined) || render root
         */
        get (path = null) {
            return path ? Util.get(path, L) : L
        },

        /**
         * @function call
         * (path: String, context?: Object, args?: List): Object
         *
         * Execute fn specified by `path` with the provided arguments `args` in the provided `context`.
         *
         * @param {String} path
         * @param {Object} context
         * @param {Array} args
         *
         * @returns fn() || null
         *
         * `#revise_me`
         */
        call (path, context = this, args = []) {
            let fn = this.get(path)

            return typeof fn === 'function'
                ? fn.call(context, args)
                : null;
        },

        /**
         * @function latLng
         *
         * @factory `latLng(latitude: Number, longitude: Number, altitude?: Number): LatLng`
         * Creates an object representing a geographical point
         * with the given latitude `lat` and longitude `lng` (and optionally altitude `alt`).
         *
         * @alternative
         * @factory `latLng(coords: Array): LatLng`
         * Expects an array of the form `[Number, Number]` or `[Number, Number, Number]` instead.
         *
         * @alternative
         * @factory `latLng(coords: Object): LatLng`
         * Expects an plain object of the form `{lat: Number, lng: Number}`
         * or `{lat: Number, lng: Number, alt: Number}` instead.
         *
         * @param {Number} lat
         * @param {Number} lng
         * @param {Number} alt
         *
         * @return LatLng
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
         * @function point
         *
         * @factory `point(x: Number, y: Number, round?: Boolean)`
         * Creates a Point object with the given `x` and `y` coordinates.
         * If optional `round` is set to true, rounds the `x` and `y` values.
         *
         * @alternative
         * @factory `point(coords: Number[])`
         * Expects an array of the form `[x, y]` instead.
         *
         * @alternative
         * @factory `point(coords: Object)`
         * Expects a plain object of the form `{x: Number, y: Number}` instead.
         *
         * @param {Number} x
         * @param {Number} y
         * @param {Boolean} r
         *
         * @returns Point
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

        crs () {
            return L.CRS;
        },

        /**
         * @function transfomation
         *
         * @factory `transformation(a: Number, b: Number, c: Number, d: Number): Transformation`
         * Instantiates a Transformation object with the given coefficients.
         *
         * @alternative
         * @factory `transformation(coefficients: Array): Transformation`
         * Expects an coefficients array of the form
         * `[a: Number, b: Number, c: Number, d: Number]`.
         *
         * @param {Number} a
         * @param {Number} b
         * @param {Number} c
         * @param {Number} d
         *
         * @returns Transformation {}
         */
        transformation (a, b, c, d) {
            // Coef array arg
            if (Util.isArray(a)) { return L.transformation(a[0], a[1], a[2], a[3]); }

            return L.transformation(a, b, c, d);
        }

    }
})(L)