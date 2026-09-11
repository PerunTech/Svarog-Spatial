import { factory, crs, store } from '..';
import { MAP_CONFIG, COORDINATE_REFERENCE_SYSTEM, setting } from '../../config';

/**
 * Pre-init segment. Map factory arguments.
 * Needs revision and does not belong here. `#revise_me`
 */
const el = document.createElement('div');
el.id = 'map';
el.style.height = '100vh';
/*el.style.border = '4px inset';*/

/**
 * The coordinate reference system this map is built with.
 *
 * Read from settings rather than from a window global since 4.2.1, though it is
 * still the one setting `configure()` cannot reach: Leaflet fixes a map's CRS at
 * construction and this module constructs the map as it evaluates, so the value
 * has to be in place before the bundle runs. `createMap()` is what lifts that.
 *
 * Note the three codes below are the whole of the string form. Anything else is
 * a value spatial cannot resolve, and leaving the CRS unset — which hands the
 * map to Leaflet's own EPSG3857 — is what it has always done. That is easy to
 * mistake for working, so say so.
 */
const BUILT_IN = {
    'EPSG:3857': () => factory.CRS.EPSG3857,
    'EPSG:3395': () => factory.CRS.EPSG3395,
    'EPSG:4326': () => factory.CRS.EPSG4326
};

const resolveCrs = () => {
    const configured = setting('crs');

    if (!configured) return crs(...Object.values(COORDINATE_REFERENCE_SYSTEM));

    if (typeof configured === 'object' && configured.code) {
        return crs(...Object.values(configured));
    }

    if (typeof configured === 'string' && BUILT_IN[configured]) {
        return BUILT_IN[configured]();
    }

    console.warn(
        `spatial: cannot resolve crs ${JSON.stringify(configured)}. As a string it must be one of ` +
        `${Object.keys(BUILT_IN).join(', ')}; any other projection needs the { code, def } form. ` +
        'Falling back to Leaflet\'s own EPSG:3857, which is almost certainly not what this deployment wants.'
    );
    return undefined;
};

const coordinateReferenceSystem = resolveCrs();

const opt = {
    ...MAP_CONFIG,
    crs: coordinateReferenceSystem,
    origin: [45.44, 26.63]
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