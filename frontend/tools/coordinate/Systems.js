import { projection } from '../../core';

/**
 * The systems a position can be read in, and the text that stands for it.
 *
 * A map is projected in one coordinate reference system, chosen by the
 * deployment and not by whoever is looking at it. What someone reading the map
 * needs is a different question: the same position quoted in whatever system
 * the thing beside them uses — WGS84 degrees to check a record's own GPS fields,
 * degrees and minutes and seconds to read against a paper form, a national
 * grid's easting and northing to read against a cadastral sheet.
 *
 * Those two questions are independent, and this module exists because only one
 * of them is expensive. Changing the map's system invalidates every tile, resets
 * the view and leaves any WMS layer on it projected the old way. Changing the
 * system a *readout* quotes costs one conversion per pointer move and touches
 * nothing: a Leaflet event carries WGS84 latitude and longitude whatever the map
 * is projected in, so every system here converts from that and the map never
 * hears about it.
 *
 * Nothing in this file knows any geography. The systems a deployment offers are
 * a setting, `coordinateSystems`, and a system that is not WGS84 arrives as a
 * proj4 definition the same way the map's own does.
 */

/** Which pair a format quotes, and therefore what its two boxes are called. */
const AXES = {
    dd: ['latitude', 'longitude'],
    dms: ['latitude', 'longitude'],
    xy: ['abscissa_x', 'ordinate_y']
};

/** A geographic format quotes latitude first; a projected one quotes x first. */
const isGeographic = (format) => format !== 'xy';

const pad = (value, width = 2) => String(value).padStart(width, '0');

/**
 * Degrees, minutes and seconds, written the way the records are.
 *
 * `35° 09' 09'' N` — two apostrophes rather than a double quote, because that is
 * what the value in a record's own GPS field looks like, and the point of
 * offering this format at all is that the two can be compared by eye.
 *
 * The carry is the part worth writing down: rounding 59.6 seconds to a whole
 * number gives 60, and `35° 09' 60''` is not a coordinate. So the rounding
 * happens first and its overflow walks up through minutes into degrees.
 */
export const toDMS = (value, axis = 'latitude', decimals = 0) => {
    if (!Number.isFinite(value)) return '';

    const hemisphere = axis === 'latitude'
        ? (value < 0 ? 'S' : 'N')
        : (value < 0 ? 'W' : 'E');

    const absolute = Math.abs(value);
    let degrees = Math.floor(absolute);
    let minutes = Math.floor((absolute - degrees) * 60);
    let seconds = Number((((absolute - degrees) * 60) - minutes) * 60).toFixed(decimals);

    if (Number(seconds) >= 60) { seconds = Number(seconds) - 60; minutes += 1; }
    if (minutes >= 60) { minutes -= 60; degrees += 1; }

    const width = decimals > 0 ? 3 + decimals : 2;

    return `${degrees}° ${pad(minutes)}' ${pad(Number(seconds).toFixed(decimals), width)}'' ${hemisphere}`;
};

/**
 * Degrees back out of whatever someone typed.
 *
 * Deliberately forgiving, because this is an input box on a map and not a form
 * field: `35 9 9`, `35°9'9''`, `35° 09' 09" S`, `35,1525` and `-35.1525` all
 * mean something and all of them are typed. The rule is that up to three numbers
 * are degrees, minutes and seconds, and a trailing S or W is a sign — as is a
 * minus, so a southern latitude survives either way it is written.
 */
export const fromDMS = (text) => {
    const trimmed = String(text ?? '').trim();
    if (!trimmed) return null;

    const hemisphere = (trimmed.match(/[NSEW]\s*$/i) || [''])[0].trim().toUpperCase();
    const numbers = trimmed
        .replace(/[NSEW]\s*$/i, '')
        .replace(/,/g, '.')
        .match(/-?\d+(?:\.\d+)?/g);

    if (!numbers || numbers.length > 3) return null;

    const [degrees, minutes = '0', seconds = '0'] = numbers;
    if ([minutes, seconds].some(part => Number(part) < 0 || Number(part) >= 60)) return null;

    const magnitude = Math.abs(Number(degrees)) + Number(minutes) / 60 + Number(seconds) / 3600;
    const negative = Number(degrees) < 0 || /^-/.test(degrees) || hemisphere === 'S' || hemisphere === 'W';

    return negative ? -magnitude : magnitude;
};

/** A plain number, tolerating a comma for a decimal point and spaces inside it. */
export const toNumber = (text) => {
    const cleaned = String(text ?? '').trim().replace(/\s+/g, '').replace(',', '.');
    if (!cleaned || !/^-?\d*\.?\d+$/.test(cleaned)) return null;

    const value = Number(cleaned);
    return Number.isFinite(value) ? value : null;
};

/**
 * A projected value, written to a sensible number of places.
 *
 * A system's own `decimals` wins. Without one it is guessed from the magnitude,
 * because the alternative is worse in both directions: three decimal places on a
 * metre grid is noise nobody reads, and none at all on a system quoted in
 * degrees rounds a position to the nearest hundred kilometres.
 */
const projectedText = (value, decimals) =>
    value.toFixed(decimals ?? (Math.abs(value) >= 1000 ? 0 : 3));

const degreesText = (value, decimals) => value.toFixed(decimals ?? 5);

/**
 * One configured entry, turned into something the control can use.
 *
 * Returns null for an entry that cannot be built — an unknown code with no
 * definition, a definition proj4 will not take — after saying so. A readout with
 * one system missing is worth having; a map that fails to draw because a
 * parameter has a typo in it is not.
 */
const build = (configured, map, precision) => {
    const format = configured.format ?? (configured.def ? 'xy' : 'dd');
    // A system that says how many places it wants keeps them. The control's
    // `precision` is the default for degrees only: it means nothing to a grid
    // quoted in metres, where a decimal place is a millimetre.
    const decimals = configured.decimals ?? (format === 'dd' ? precision : undefined);
    const axes = AXES[format] ?? AXES.dd;

    if (!AXES[format]) {
        console.warn(`spatial: coordinate system "${configured.code || format}" asks for an unknown format "${format}". Using degrees.`);
    }

    // The map's own system. Its projection is the one already on the map, so
    // this reads through the map rather than building a second definition of
    // something Leaflet has already been handed.
    if (format === 'xy' && !configured.def) {
        if (!map) return null;

        return {
            key: configured.code || map.code,
            label: configured.label || map.label || map.code,
            format,
            axes,
            toText: (latlng) => {
                const point = map.project(latlng);
                return [projectedText(point.x, decimals), projectedText(point.y, decimals)];
            },
            toLatLng: ([x, y]) => {
                const values = [toNumber(x), toNumber(y)];
                return values.some(value => value === null) ? null : map.unproject({ x: values[0], y: values[1] });
            }
        };
    }

    // WGS84, which is what the event already carries -- no projection at all,
    // only a way of writing it down.
    if (!configured.def) {
        return {
            key: `${configured.code || 'WGS84'}:${format}`,
            label: configured.label || (format === 'dms' ? 'WGS84 · DMS' : 'WGS84'),
            format,
            axes,
            toText: (latlng) => (format === 'dms'
                ? [toDMS(latlng.lat, 'latitude', decimals), toDMS(latlng.lng, 'longitude', decimals)]
                : [degreesText(latlng.lat, decimals), degreesText(latlng.lng, decimals)]),
            toLatLng: ([first, second]) => {
                const read = format === 'dms' ? fromDMS : toNumber;
                const lat = read(first);
                const lng = read(second);
                return lat === null || lng === null ? null : { lat, lng };
            }
        };
    }

    let projector;
    try {
        projector = projection(configured.code, configured.def);
    } catch (error) {
        console.warn(`spatial: coordinate system "${configured.code}" could not be built, so it is not offered.`, error);
        return null;
    }

    return {
        key: `${configured.code}:${format}`,
        label: configured.label || configured.code,
        format,
        axes,
        toText: (latlng) => {
            const point = projector.project(latlng, 8);

            // proj4 answers in x, y -- so a definition that is itself geographic
            // answers in longitude, latitude, and the pair has to be turned round
            // before it is written as one.
            if (isGeographic(format)) {
                return format === 'dms'
                    ? [toDMS(point.y, 'latitude', decimals), toDMS(point.x, 'longitude', decimals)]
                    : [degreesText(point.y, decimals), degreesText(point.x, decimals)];
            }

            return [projectedText(point.x, decimals), projectedText(point.y, decimals)];
        },
        toLatLng: ([first, second]) => {
            const read = format === 'dms' ? fromDMS : toNumber;
            const a = read(first);
            const b = read(second);
            if (a === null || b === null) return null;

            const point = isGeographic(format) ? { x: b, y: a } : { x: a, y: b };
            const latlng = projector.unproject(point, 8);

            return { lat: latlng.lat, lng: latlng.lng };
        }
    };
};

/** What a deployment that configures none gets: degrees, DMS, and the map's own. */
const DEFAULTS = [{ format: 'dd' }, { format: 'dms' }];

export const readout = {
    toDMS,
    fromDMS,
    toNumber,

    /**
     * The systems to offer, built and ready to use.
     *
     * A configured list is taken exactly as it stands, so a deployment that says
     * which systems its people use gets those and no surprises. An empty one
     * gets WGS84 in both notations plus the map's own projected units, which is
     * the most useful thing that can be said without knowing where the
     * deployment is.
     *
     * @param {Array}  [configured] - [{ code, def, opt, format, label, decimals }]
     * @param {Object} [map] - The map's own system, as
     *        { code, label, project(latlng) -> {x, y}, unproject({x, y}) -> {lat, lng} }.
     * @param {number} [precision] - Default decimal places for degrees.
     * @returns {Array} Systems, each { key, label, format, axes, toText, toLatLng }.
     */
    resolve: (configured, map, precision) => {
        const entries = configured?.length
            ? configured
            : [...DEFAULTS, ...(map ? [{ format: 'xy' }] : [])];

        return entries.map(entry => build(entry, map, precision)).filter(Boolean);
    },

    /**
     * Whether a position is inside the deployment's limits.
     *
     * Checked on the latitude and longitude rather than on what was typed,
     * because that is the one form every system converts to -- so one rule
     * covers a national grid's easting as well as a typed degree.
     */
    inside: (latlng, bounds) => {
        if (!latlng || !bounds?.length) return false;

        const [southwest, northeast] = bounds;
        const between = (value, min, max) => value >= Math.min(min, max) && value <= Math.max(min, max);

        return between(latlng.lat, southwest.lat, northeast.lat)
            && between(latlng.lng, southwest.lng, northeast.lng);
    }
};
