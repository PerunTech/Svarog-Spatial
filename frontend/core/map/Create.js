import { factory, crs } from '..';
import { MAP_CONFIG, setting } from '../../config';

/**
 * @override segment. Keep this on top of file.
 * Prototype changes are done before any map is created, so every map gets the
 * same corners: the page's, one from `createMap`, and a plain Leaflet map such
 * as a plugin's inset.
 */
factory.Map.prototype._initControlPos = function () {
    this._controlCorners = {};
    this._controlContainer = factory.DomUtil.create('div', 'control-container', this._container);

    const createElement = (container, side) => factory.DomUtil.create('div', 'control-' + side, container);
    const stopEventBubble = (el) => {
        factory.DomEvent
            .disableClickPropagation(el)
            .disableScrollPropagation(el)
            .addListener(el, 'mousemove', factory.DomEvent.stopPropagation);

        return el;
    }

    /* Preserve order of top/center/bottom, layout is vertical (flexbox), elements are blocks. */
    ['top', 'center', 'bottom'].map(side => {
        this._controlCorners[side] = stopEventBubble(createElement(this._controlContainer, side));
    });
    /* Sub-locations of the main (center) screen, inline layout.
    Data and layer panels on the side, earth-view (the Map) in the center. */
    ['left', 'map', 'right'].map(side => {
        this._controlCorners[side] = stopEventBubble(createElement(this._controlCorners.center, side));
    });
    /**
     * Added corner locations embedded in control.map (the main content view), these are the default leaflet locations.
     * Use for helper controls with transparent background. Details in the leaflet documentation.
     */
    ['topleft', 'topright', 'bottomleft', 'bottomright'].map(side => {
        this._controlCorners[side] = stopEventBubble(createElement(this._controlCorners.map, side));
    });
    /**
     * Not one of Leaflet's locations, added because the corners answer only one
     * of the two questions a control can be asking.
     *
     * A button belongs in a corner: it acts on the map, and the corner keeps it
     * out of the way of the map it acts on. A readout describes the map -- where
     * the pointer is, what the scale is -- and reads as a caption beneath it
     * rather than as another button someone might try to press. It also leaves
     * the four corners for the controls that do need them, which on a busy map
     * are already more than four.
     */
    this._controlCorners.bottomcenter = stopEventBubble(
        createElement(this._controlCorners.map, 'bottomcenter')
    );
};

/**
 * The coordinate reference systems the engine can name for itself.
 *
 * These three are the whole of the string form. Anything else is a projection
 * Leaflet does not carry, and needs the { code, def } form so proj4 can build
 * it.
 */
const BUILT_IN = {
    'EPSG:3857': () => factory.CRS.EPSG3857,
    'EPSG:3395': () => factory.CRS.EPSG3395,
    'EPSG:4326': () => factory.CRS.EPSG4326
};

/**
 * A configured CRS, resolved to one the map can use.
 *
 * Returns undefined for anything unrecognised, which leaves the map on whatever
 * it already had rather than on a guess. There is no default here on purpose:
 * `DEFAULTS.crs` in the settings is EPSG:3857, so an unconfigured deployment
 * gets the Web Mercator tile grid — the one its basemaps are published on —
 * rather than a national projection belonging to someone else.
 *
 * @param {string|Object} configured - An EPSG code, or { code, def, opt }.
 */
const toCrs = (configured) => {
    if (!configured) return undefined;

    /* A proj4 definition means a projection Leaflet does not carry, so build it.
       A code on its own -- in either form -- is one of the three it does. */
    if (typeof configured === 'object' && configured.def) {
        return crs(configured.code, configured.def, configured.opt);
    }

    const code = typeof configured === 'string' ? configured : configured.code;
    if (BUILT_IN[code]) return BUILT_IN[code]();

    console.warn(
        `spatial: cannot resolve crs ${JSON.stringify(configured)}. As a string it must be one of ` +
        `${Object.keys(BUILT_IN).join(', ')}; any other projection needs the { code, def } form, ` +
        'where def is a proj4 definition. Leaving the map on the CRS it already has.'
    );
    return undefined;
};

/**
 * What spatial adds to a Leaflet map, attached to one map.
 *
 * Each method is a closure over the map it was attached to rather than a
 * function of `this`. That is how they behaved when the page's map was the only
 * one -- `transform` called `Map.getCRS()` by name -- and it keeps a method
 * working when a caller passes it on unbound, as in `.then(map.getBBox)`.
 *
 * @param {Object} map - A Leaflet map.
 * @returns {Object} The same map.
 */
const extend = (map) => {
    map.setCursor = function (type) {
        return map.getContainer().style.cursor = type, map;
    };
    map.getCRS = function () {
        return map.options.crs;
    };
    map.transform = function (latlng, precision) {
        return map.getCRS().projection.project(
            latlng instanceof factory.LatLng
                ? latlng
                : factory.latLng(latlng),
            precision);
    };
    map.untransform = function (point, precision) {
        return map.getCRS().projection.unproject(
            point instanceof factory.Point
                ? point
                : factory.point(point),
            precision);
    };
    map.getBBox = function () {
        const crs = map.getCRS();
        const bounds = map.getBounds();

        const psw = crs.projection.project(bounds.getSouthWest())
        const pne = crs.projection.project(bounds.getNorthEast())

        return psw.x + ',' + psw.y + ',' + pne.x + ',' + pne.y;
    };

    /**
     * Changes the coordinate reference system of a map that already exists.
     *
     * Leaflet is usually described as fixing a map's CRS at construction, and for
     * practical purposes it does: `options.crs` is read on every projection, but
     * everything already derived from the previous one — the pixel origin, each
     * tile layer's grid — is cached. Re-applying the view with `reset` recomputes
     * all of it, which is what makes this safe to call before layers are added.
     *
     * It is what lets `crs` be an ordinary setting rather than a value that has to
     * be on the page before this bundle evaluates. That ordering requirement was
     * the whole of the problem it used to cause: a deployment whose parameters said
     * EPSG:3857 but whose page said nothing got a map on a different grid, and
     * every basemap tile it asked for came back 400.
     *
     * @param {string|Object} configured - An EPSG code, or { code, def, opt }.
     */
    map.setCRS = function (configured) {
        const resolved = toCrs(configured);
        if (!resolved || resolved === map.options.crs) return map;

        /* A layer that read the map's CRS when it was added is holding the old one:
           TileLayer.WMS copies it into `_crs` in onAdd, and sends it as the SRS of
           every GetMap. The grid of a plain tile layer recomputes on viewreset, but
           that copy does not, so say which layers need re-adding rather than let
           them quietly keep projecting the old way. */
        const stale = [];
        map.eachLayer(layer => { if (layer._crs) stale.push(layer); });
        if (stale.length) {
            console.warn(
                `spatial: the CRS changed to ${resolved.code} while ${stale.length} layer(s) were on the map. ` +
                'A WMS layer copies the CRS when it is added, so those will keep requesting the old one — ' +
                'remove and re-add them, or configure the CRS before any layer is added.'
            );
        }

        /* Read the view before the swap. Afterwards getCenter() would unproject the
           cached pixel origin through the new CRS and answer with a point that was
           never where the map was. */
        const view = map._loaded ? { center: map.getCenter(), zoom: map.getZoom() } : null;

        map.options.crs = resolved;
        if (view) map.setView(view.center, view.zoom, { reset: true });

        return map;
    };

    return map;
};

/**
 * Builds a map, with everything spatial adds to one.
 *
 * The page's map is this function's first call (see `Map.js`), so a created map
 * and the page's cannot drift apart. What a created map does not share with the
 * page's is the page: it is built in the element it is given and appended
 * nowhere, and a later `configure()` does not reach it. It takes the settings as
 * they stand when it is built, and from then on its caller owns it, with
 * `setCRS`, `setView` and the zoom limits to change what it shows.
 *
 * @param {HTMLElement|string} element - The element to build the map in, or its
 *     id. The caller owns it and gives it its size.
 * @param {Object} [options] - Leaflet map options, laid over MAP_CONFIG and the
 *     settings. `crs` takes any form `configure()` takes.
 * @returns {Object} A Leaflet map.
 *
 * @example
 *      const map = createMap(container, { center: { lat: 41.99, lng: 21.43 }, zoom: 9 });
 *      // ...
 *      map.remove();
 */
export const createMap = (element, options = {}) => {
    const { crs: requested, ...rest } = options;

    /* The settings' CRS unless the caller names one that resolves. An option set
       to undefined would reach Leaflet as an own property and shadow its default,
       so an unresolved CRS is left out rather than passed. */
    const resolved = toCrs(requested) || toCrs(setting('crs'));

    return extend(factory.map(element, {
        ...MAP_CONFIG,
        ...resolved && { crs: resolved },
        center: setting('center'),
        zoom: setting('zoom'),
        minZoom: setting('minZoom'),
        maxZoom: setting('maxZoom'),
        ...rest
    }));
};
