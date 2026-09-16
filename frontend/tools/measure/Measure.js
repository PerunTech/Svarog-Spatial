import { setting } from '../../config';
import { calculateArea, calculateDistance, circleArea, formatArea, formatDistance } from './Util';
import { angleAt, bearing, formatAngle, formatBearing } from './Angle';

/**
 * Measuring, as something that can be called rather than clicked.
 *
 * The maths beside this file has been here for years and has only ever been
 * reachable through a Leaflet layer: `calculateDistance` and `calculateArea` are
 * mixed onto the polyline prototype, and `formatDistance` and `formatArea` read
 * their units off `this._measurementOptions`, which is state a layer carries. So
 * a caller that wanted to measure something without drawing it first -- a
 * control, a test, a screen reporting on a set it already has -- had nowhere to
 * call in.
 *
 * This is that surface. It adds no arithmetic; it gathers what is already here,
 * supplies the one thing the formatters need, and gives it the same shape
 * `readout` has in the coordinate tools next door.
 *
 * Everything is quoted in base units -- metres, square metres, degrees -- and
 * formatted only on the way to a screen. That separation is the point rather
 * than tidiness: the existing measurement controls keep their running total by
 * parsing their own formatted output back into a number, and that parser reads
 * only `m` and `km`. On a deployment configured `imperial` the formatter emits
 * `ft`, `mi`, `ac` and `ft²`, none of which it recognises, so the total is
 * silently wrong -- `1.2 mi` is added as `12`. A sum kept in metres cannot
 * develop that fault.
 */

/**
 * What the formatters expect to be called on.
 *
 * `formatDistance` and `formatArea` are prototype methods: they read
 * `this._measurementOptions.imperial` to choose their units. Rather than
 * duplicate two unit ladders to call them from outside, they are called with the
 * one field they actually read. Re-read per call, because the measurement system
 * is a deployment parameter and an administrator may change it while a map is
 * open.
 */
const asLayer = () => ({
    _measurementOptions: { imperial: setting('measurementSystem') === 'imperial' }
});

export const measure = {
    /* Base units in, base units out. */
    distance: calculateDistance,
    area: calculateArea,
    circleArea,
    bearing,
    angleAt,

    /* Base units in, something to put on screen out. */
    asDistance: (metres) => formatDistance.call(asLayer(), metres),
    asArea: (squareMetres) => formatArea.call(asLayer(), squareMetres),
    asAngle: formatAngle,
    asBearing: formatBearing,

    /**
     * The angle at every interior vertex of a path.
     *
     * A two-point path has no interior vertex and so no angle -- what it has is a
     * bearing, which is the caller's to ask for. Returned as an array so a path
     * drawn with four points answers about all of its corners rather than only
     * the first.
     */
    anglesAlong: (points = []) =>
        points.slice(1, -1).map((vertex, index) => angleAt(points[index], vertex, points[index + 2]))
};
