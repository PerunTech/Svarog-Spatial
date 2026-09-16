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
 * Since 5.0 that page is out of it entirely: `configure()` is the only way in,
 * and what it is given comes from the deployment's system parameters. One
 * source, in the database, read at startup.
 *
 * @example
 *      import { configure } from 'spatial/config';
 *
 *      configure({
 *          crs: 'EPSG:3857',
 *          center: { lat: 41.99, lng: 21.43 },
 *          bounds: [{ lat: 40.85, lng: 20.45 }, { lat: 42.37, lng: 23.03 }],
 *          measurementSystem: 'metric'
 *      });
 *
 * On timing. Most settings are read on demand, so a later `configure()` simply
 * reaches their next reader. A few describe something already built — the map's
 * CRS, its view, its zoom limits — and those are applied to it as they change,
 * by the appliers registered through `onConfigure()`. Either way the caller does
 * not have to know which kind it is handing over, and no setting depends on
 * being set before some other module evaluates.
 */

/**
 * The values a deployment that configures nothing gets.
 *
 * All of them describe the whole world on the Web Mercator tile grid, which is
 * the only defensible default: it is the grid every XYZ basemap is published on,
 * and it belongs to no country.
 *
 * Until 5.0 these were Moldova's — the CRS, the centre and the bounds of the
 * deployment this engine was first written for. That made a missing
 * configuration invisible rather than loud: a deployment that configured nothing
 * drew somebody else's country, and one that configured everything but `crs`
 * asked its basemap for tiles a hundred worlds off the grid and got a wall of
 * HTTP 400s with nothing on screen or in the console to name the cause.
 *
 * So there is no geography in this file. A deployment's own is a system
 * parameter and arrives through `configure()`.
 */
const DEFAULTS = {
    /**
     * 'EPSG:3857', 'EPSG:3395' or 'EPSG:4326', which the engine resolves itself,
     * or { code, def, opt } carrying a proj4 definition for a national grid.
     */
    crs: 'EPSG:3857',
    /** Initial map centre, { lat, lng }. Null Island — nowhere in particular. */
    center: { lat: 0, lng: 0 },
    /** Spatial limits, [{ lat, lng } southwest, { lat, lng } northeast]. */
    bounds: [{ lat: -90, lng: -180 }, { lat: 90, lng: 180 }],
    /** Initial zoom. 0 is the whole world in a single tile. */
    zoom: 0,
    /** How far out a map may be zoomed. */
    minZoom: 0,
    /** How far in. 18 is as deep as most basemaps publish. */
    maxZoom: 18,
    /** 'metric', 'imperial', or null for no scale bar. */
    measurementSystem: null,
    /**
     * The systems the coordinate readout offers, as
     * [{ code, def, format, label, decimals }] — `format` being 'dd', 'dms' or
     * 'xy', and `def` a proj4 definition for anything that is not WGS84. Empty
     * offers degrees, degrees-minutes-seconds and the map's own projected units,
     * which is the most that can be offered without knowing where a deployment
     * is. This changes what a position is quoted in and never what the map is
     * drawn in: see `readout.resolve`.
     */
    coordinateSystems: [],
    /** Reverse WMS bounding box axis order. */
    switchBboxOrder: false
};

/**
 * `switchBboxOrder` arrived as the string 'true' when it came from a page, which
 * is why every read site used to compare strings — and why passing the boolean
 * it looks like threw. Normalising on the way in means both forms work and no
 * reader has to care. A system parameter is a string too, so this stays.
 */
const toBoolean = (value) =>
    typeof value === 'boolean' ? value : String(value).trim().toLowerCase() === 'true';

const toInteger = (value) => {
    const number = parseInt(value, 10);
    return Number.isNaN(number) ? undefined : number;
};

const NORMALISE = {
    switchBboxOrder: toBoolean,
    zoom: toInteger,
    minZoom: toInteger,
    maxZoom: toInteger
};

const normalise = (key, value) => (NORMALISE[key] ? NORMALISE[key](value) : value);

let values = { ...DEFAULTS };

/**
 * The functions to run when a setting that describes something already built
 * changes — the map's CRS and its view are the ones that exist today.
 *
 * A list rather than a direct call because the map imports this module and not
 * the other way round; inverting that to apply a setting would be a cycle. So
 * the thing that owns a value registers how to apply it, and this module stays
 * the bottom of the dependency graph, which is what lets everything else read a
 * setting without importing a map.
 */
const appliers = [];

/**
 * Registers an applier.
 *
 * Called with the settings as they now stand and a Set of the keys that just
 * changed, so an applier can ignore a `configure()` that had nothing to do with
 * it — which matters for the view: re-applying a centre nobody asked to change
 * would move a map out from under whoever was reading it.
 *
 * @param {Function} applier - (settings: Object, changed: Set<string>) => void
 */
export const onConfigure = (applier) => {
    if (typeof applier === 'function') appliers.push(applier);
};

/**
 * Applies configuration. Merges into what is already set, so partial updates are
 * fine and the order of calls does not matter.
 *
 * @param {Object} next - Any subset of the known settings.
 * @returns {Object} The settings as they now stand.
 */
export const configure = (next = {}) => {
    const changed = new Set();

    Object.entries(next).forEach(([key, value]) => {
        if (!(key in DEFAULTS)) {
            console.warn(
                `spatial: ignoring unknown setting "${key}". Known settings: ${Object.keys(DEFAULTS).join(', ')}.`
            );
            return;
        }
        if (value === undefined || value === null || value === '') return;

        const normalised = normalise(key, value);
        if (normalised === undefined) {
            console.warn(`spatial: ignoring "${key}", which is not a value this setting can take: ${JSON.stringify(value)}.`);
            return;
        }

        values[key] = normalised;
        changed.add(key);
    });

    if (changed.size) appliers.forEach(applier => applier(settings(), changed));

    return settings();
};

/** Reads one setting. */
export const setting = (key) => values[key];

/** Everything, as a copy — for a console when a deployment is behaving oddly. */
export const settings = () => ({ ...values });
