import { factory, crs } from '..';
import { MAP_CONFIG, setting } from '../../config';
import { bboxOf } from './BBox';

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
 * A configured CRS, resolved to one a map or a layer can use.
 *
 * Returns undefined for anything unrecognised, which leaves the caller on what
 * it would have had without it rather than on a guess. There is no default here
 * on purpose: `DEFAULTS.crs` in the settings is EPSG:3857, so an unconfigured
 * deployment gets the Web Mercator tile grid — the one its basemaps are
 * published on — rather than a national projection belonging to someone else.
 *
 * A CRS that is already built, such as another map's `getCRS()`, is taken as it
 * is. One from `crs()` carries its `code` and `def`, so without this it would be
 * built again from those two, and lose the origin and scales it was built with,
 * which it keeps as `options` rather than `opt`.
 *
 * @param {string|Object} configured - An EPSG code, { code, def, opt }, or a CRS.
 */
export const toCrs = (configured) => {
    if (!configured) return undefined;
    if (configured.projection) return configured;

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
        'where def is a proj4 definition. Ignoring it: the map or layer it was given for keeps ' +
        'the CRS it would otherwise have.'
    );
    return undefined;
};

/**
 * How to build each set of tools a map carries, by the name it is read as.
 *
 * `tools` fills this in when it loads: `draw` and `edit`. core cannot import
 * the tools itself. Every tool imports core, and this file runs while core is
 * still loading, so they would be evaluated against a core that has no map
 * yet. A getter reads this on first use, which is always after `tools` has
 * loaded.
 */
const toolsets = {};

/**
 * Registers how to build one set of tools for a map. Called by `tools`, and
 * not exported from core.
 *
 * @param {string} name - `draw` or `edit`: what the set is read as on a map.
 * @param {Function} build - Given a map, returns a new set of tools for it.
 */
export const provideToolset = (name, build) => {
    toolsets[name] = build;
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
        return bboxOf(map);
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

    /* `map.draw` and `map.edit`: this map's own tools, built the first time
       each is read and the same set on every read after. A map whose tools
       are never read never builds them. The page's map is first read by `tools`
       itself, which exports that set as the module-level `draw` and `edit`.
       The sets built so far are kept here, so `remove` can reach them without
       reading the getters, which would build them. */
    const built = {};
    ['draw', 'edit'].forEach(name => {
        Object.defineProperty(map, name, {
            get: () => built[name] || (built[name] = toolsets[name] && toolsets[name](map)),
            enumerable: true,
            configurable: true
        });
    });

    /**
     * Destroys the map, and turns its tools off first.
     *
     * Leaflet's `remove` takes the map's layers and handlers with it, and, once
     * the map has had a view, fires `unload`, which takes every control off.
     * What it cannot reach is a tool that is still on. An editing tool listens
     * on the layer it edits, which is the caller's and can outlive the map, and
     * through that listener the tool, and the map it keeps, would stay alive
     * as long as the layer does. A drawing tool told `repeatable` would also
     * turn itself back on when it was turned off, so it is told not to.
     *
     * Whatever the caller put on something outside the map -- a listener on a
     * layer it keeps, on `document`, on another map -- is still the caller's
     * to take off.
     */
    const remove = map.remove;
    map.remove = function () {
        Object.values(built).forEach(set => set && Object.values(set).forEach(tool => {
            tool.enabled && tool.disable(true);
        }));
        return remove.call(map);
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
 *     settings. `crs` takes any form `configure()` takes, or a CRS.
 * @returns {Object} A Leaflet map, with its own drawing and editing tools as
 *     `map.draw` and `map.edit`.
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

    /* The same for the caller's other options: one given as undefined leaves the
       setting under it in place. A `center` or `zoom` of undefined would
       otherwise build a map with no view, and Leaflet fires `unload` only on a
       map that has had one, so its `remove` would leave every control on. */
    const given = Object.fromEntries(Object.entries(rest).filter(([, value]) => value !== undefined));

    return extend(factory.map(element, {
        ...MAP_CONFIG,
        ...resolved && { crs: resolved },
        center: setting('center'),
        zoom: setting('zoom'),
        minZoom: setting('minZoom'),
        maxZoom: setting('maxZoom'),
        ...given
    }));
};
