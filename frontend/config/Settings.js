/**
 * Runtime settings for the engine.
 *
 * Every value a deployment configures lives here, and everything in spatial that
 * needs one reads it through `setting()`. Until 4.2.1 each was a separate
 * `window` global read at the point of use, which meant the only way to
 * configure spatial was to hardcode values into the page that loads it — in the
 * right order, once per deployment and once per consuming project, with nothing
 * to validate them against and no way to see what had been applied.
 *
 * Those globals are still read, once, to seed these values, so nothing breaks by
 * upgrading. They are deprecated and will be removed in 5.0.
 *
 * @example
 *      import { configure } from 'spatial/config';
 *
 *      configure({
 *          center: { lat: 41.99, lng: 21.43 },
 *          bounds: [{ lat: 40.85, lng: 20.45 }, { lat: 42.37, lng: 23.03 }],
 *          measurementSystem: 'metric'
 *      });
 *
 * On timing. `configure()` reaches every setting that is read on demand, which
 * is all of them except `crs`: the map instance is constructed while this bundle
 * evaluates, and Leaflet fixes a map's CRS at construction, so `crs` can only
 * come from the seed. That is the constraint `createMap()` lifts — when it
 * lands, `crs` becomes an ordinary setting and nothing in this file changes.
 */

/**
 * The values a deployment that configures nothing gets.
 *
 * The centre and bounds are Moldova's, which is where this engine started; they
 * are not a sensible default for anywhere else, and a deployment is expected to
 * replace them. `crs: null` selects COORDINATE_REFERENCE_SYSTEM, and
 * `measurementSystem: null` renders no scale bar, both matching the behaviour
 * before this module existed.
 */
const DEFAULTS = {
    /**
     * 'EPSG:3857', 'EPSG:3395' or 'EPSG:4326', which the engine resolves itself,
     * or { code, def, opt } carrying a proj4 definition for a national grid.
     */
    crs: null,
    /** Initial map centre, { lat, lng }. */
    center: { lat: 47.184434, lng: 28.489772 },
    /** Spatial limits, [{ lat, lng } southwest, { lat, lng } northeast]. */
    bounds: [{ lat: 45.44, lng: 26.63 }, { lat: 48.47, lng: 30.13 }],
    /** 'metric', 'imperial', or null for no scale bar. */
    measurementSystem: null,
    /** Reverse WMS bounding box axis order. */
    switchBboxOrder: false
};

/**
 * The globals each setting used to be read from, and still is seeded by.
 * @deprecated since 4.2.1
 */
const LEGACY_GLOBALS = {
    crs: 'sysCrs',
    center: 'sysCenter',
    bounds: 'sysBounds',
    measurementSystem: 'measurementSystem',
    switchBboxOrder: 'switchBboxOrder'
};

/**
 * `switchBboxOrder` arrived as the string 'true' when it came from a page, which
 * is why every read site used to compare strings — and why passing the boolean
 * it looks like threw. Normalising on the way in means both forms work and no
 * reader has to care.
 */
const toBoolean = (value) =>
    typeof value === 'boolean' ? value : String(value).trim().toLowerCase() === 'true';

const NORMALISE = { switchBboxOrder: toBoolean };

const normalise = (key, value) => (NORMALISE[key] ? NORMALISE[key](value) : value);

let values = { ...DEFAULTS };

/**
 * Applies configuration. Merges into what is already set, so partial updates are
 * fine and the order of calls does not matter.
 *
 * @param {Object} next - Any subset of the known settings.
 * @returns {Object} The settings as they now stand.
 */
export const configure = (next = {}) => {
    Object.entries(next).forEach(([key, value]) => {
        if (!(key in DEFAULTS)) {
            console.warn(
                `spatial: ignoring unknown setting "${key}". Known settings: ${Object.keys(DEFAULTS).join(', ')}.`
            );
            return;
        }
        if (value === undefined || value === null || value === '') return;
        values[key] = normalise(key, value);
    });

    return settings();
};

/** Reads one setting. */
export const setting = (key) => values[key];

/** Everything, as a copy — for a console when a deployment is behaving oddly. */
export const settings = () => ({ ...values });

/**
 * Seeds from the deprecated globals, once, as this module evaluates.
 *
 * Announcing it is the point: every hit is a deployment still configured by
 * hand-edited script tags, and the warning names exactly which ones so that
 * migrating is a matter of reading it rather than searching for it.
 */
const seedFromGlobals = () => {
    if (typeof window === 'undefined') return;

    const used = [];

    Object.entries(LEGACY_GLOBALS).forEach(([key, global]) => {
        const value = window[global];
        if (value === undefined || value === null || value === '') return;
        values[key] = normalise(key, value);
        used.push(`window.${global}`);
    });

    if (used.length) {
        console.warn(
            `spatial: configured from ${used.join(', ')}. These globals are deprecated since 4.2.1 — ` +
            'call config.configure({ ... }) instead. They are still honoured, and go away in 5.0.'
        );
    }
};

seedFromGlobals();
