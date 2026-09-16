/**
 * Bearings and angles.
 *
 * The engine could already measure a distance and an area, and had no way to
 * measure a direction -- `ui/measurement/Angle.jsx` was a verbatim copy of the
 * radius control that drew a circle, rendered `disabled`, so nothing behind it
 * was ever written. This is the part that was missing.
 *
 * Purely angular, so unlike the distance and area helpers beside it nothing here
 * needs the earth's radius: a bearing is the same number on a sphere of any size.
 */

const rad = (degrees) => degrees * Math.PI / 180;
const deg = (radians) => radians * 180 / Math.PI;

/** Wrapped into [0, 360), which is the range a bearing is quoted in. */
const clockwise = (degrees) => ((degrees % 360) + 360) % 360;

/**
 * The sixteen points, for a bearing that has to be read aloud.
 *
 * A number is what gets written down and a point is what gets said, and a
 * readout that offers both costs one array. Sixteen rather than eight because
 * the step is 22.5 degrees, which is close enough that the nearest point is
 * still a useful description of the number beside it.
 */
const POINTS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
                'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];

/**
 * The forward azimuth from one position to another, in degrees clockwise from north.
 *
 * The great-circle bearing rather than the angle between two points on the
 * screen: the map's projection turns a constant bearing into a curve and a
 * straight screen line into a changing one, so the number a survey sheet or a
 * GPS unit would give is the one computed here, not the one measured with a
 * protractor against the display.
 *
 * Worth knowing that this is the bearing *at the start* of the line. Over a long
 * enough line it is not the bearing at the end, which is the nature of a great
 * circle and not an error.
 *
 * @param {Object} from - { lat, lng }
 * @param {Object} to   - { lat, lng }
 * @returns {number|null} Degrees in [0, 360), or null if either end is missing.
 */
export function bearing (from, to) {
    if (!from || !to) return null;

    const phi1 = rad(from.lat);
    const phi2 = rad(to.lat);
    const deltaLambda = rad(to.lng - from.lng);

    const y = Math.sin(deltaLambda) * Math.cos(phi2);
    const x = Math.cos(phi1) * Math.sin(phi2) -
              Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

    return clockwise(deg(Math.atan2(y, x)));
}

/**
 * The angle at `vertex`, between the directions to `from` and to `to`.
 *
 * Read as the interior angle: the smaller of the two ways round, so it lands in
 * [0, 180]. That is the reading a person taking an angle off a corner expects,
 * and it means the answer does not depend on which arm was drawn first.
 *
 * @returns {number|null} Degrees in [0, 180], or null if any of the three is missing.
 */
export function angleAt (from, vertex, to) {
    const a = bearing(vertex, from);
    const b = bearing(vertex, to);
    if (a === null || b === null) return null;

    const between = clockwise(b - a);
    return between > 180 ? 360 - between : between;
}

/** An angle, to one decimal place. */
export const formatAngle = (degrees) =>
    (Number.isFinite(degrees) ? `${degrees.toFixed(1)}°` : '');

/**
 * A bearing, with the compass point it is nearest.
 *
 * `127.3° SE`. The number is what gets recorded; the point is what makes it
 * checkable at a glance against a map held the right way up.
 */
export const formatBearing = (degrees) => {
    if (!Number.isFinite(degrees)) return '';

    const point = POINTS[Math.round(clockwise(degrees) / 22.5) % 16];
    return `${clockwise(degrees).toFixed(1)}° ${point}`;
};
