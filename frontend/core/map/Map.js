import { factory, crs, store } from '..';
import { MAP_CONFIG, setting, onConfigure } from '../../config';

/**
 * Pre-init segment. Map factory arguments.
 * Needs revision and does not belong here. `#revise_me`
 */
const el = document.createElement('div');
el.id = 'map';
el.style.height = '100vh';
/*el.style.border = '4px inset';*/

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
 * What the map is built with.
 *
 * Behaviour from MAP_CONFIG, which is the same in every deployment; everything
 * that differs between two installations from the settings, which is to say
 * from that deployment's system parameters. A `configure()` that arrives after
 * this point still reaches the map — see the bottom of this file.
 */
const opt = {
    ...MAP_CONFIG,
    crs: toCrs(setting('crs')),
    center: setting('center'),
    zoom: setting('zoom'),
    minZoom: setting('minZoom'),
    maxZoom: setting('maxZoom')
};

/**
 * @override segment. Keep this on top of file.
 * Prototype changes are done before we create our Map instance.
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
};



/**
 * The map instance of the application.
 * 
 * @namespace Map
 */
export const Map = factory.map(el, opt);



/**
 * @extends segment. 
 * Extends Map.
 */
Map.render = function render(showHeaderAndFooter) {
    let container = document.getElementById(store.getState().map.id);
    container.appendChild(el);

    /**
     * Hack for lack of coordination between core and this plugin. 
     * Header and footer are forced to always render by core.
     * Hide them each time this plugin is initialized.
     * Show them whenever the plugin is uninitialized.
     * If the showHeaderAndFooter flag is passed, the map render function will not hide the perun-core header and footer.
     * #revise_me
     */
    if (!showHeaderAndFooter) {
        document.getElementById('navbar').style.display = 'none';
        document.getElementById('footer').style.display = 'none';
    }

    return this.invalidateSize();
};
Map.setCursor = function (type) {
    return this.getContainer().style.cursor = type, this;
};
Map.getCRS = function () {
    return this.options.crs;
}
Map.transform = function (latlng, precision) {
    return Map.getCRS().projection.project(
        latlng instanceof factory.LatLng
            ? latlng
            : factory.latLng(latlng),
        precision);
}
Map.untransform = function (point, precision) {
    return Map.getCRS().projection.unproject(
        point instanceof factory.Point
            ? point
            : factory.point(point),
        precision);
}
Map.getBBox = function () {
    const crs = Map.getCRS();
    const bounds = Map.getBounds();

    const psw = crs.projection.project(bounds.getSouthWest())
    const pne = crs.projection.project(bounds.getNorthEast())

    return psw.x + ',' + psw.y + ',' + pne.x + ',' + pne.y;
}

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
Map.setCRS = function (configured) {
    const resolved = toCrs(configured);
    if (!resolved || resolved === this.options.crs) return this;

    /* A layer that read the map's CRS when it was added is holding the old one:
       TileLayer.WMS copies it into `_crs` in onAdd, and sends it as the SRS of
       every GetMap. The grid of a plain tile layer recomputes on viewreset, but
       that copy does not, so say which layers need re-adding rather than let
       them quietly keep projecting the old way. */
    const stale = [];
    this.eachLayer(layer => { if (layer._crs) stale.push(layer); });
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
    const view = this._loaded ? { center: this.getCenter(), zoom: this.getZoom() } : null;

    this.options.crs = resolved;
    if (view) this.setView(view.center, view.zoom, { reset: true });

    return this;
};

/**
 * Settings that describe this map rather than something read later, applied as
 * they change.
 *
 * Guarded on `changed` so that a `configure()` about something else does not
 * move the view: a deployment switching the scale bar to imperial should not
 * find its map recentred.
 */
onConfigure((values, changed) => {
    if (changed.has('crs')) Map.setCRS(values.crs);
    if (changed.has('minZoom')) Map.setMinZoom(values.minZoom);
    if (changed.has('maxZoom')) Map.setMaxZoom(values.maxZoom);
    if (changed.has('center') || changed.has('zoom')) Map.setView(values.center, values.zoom);
});
