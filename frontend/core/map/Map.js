import { factory, crs, store } from '..';
import { MAP_CONFIG, COORDINATE_REFERENCE_SYSTEM } from '../../config';

/**
 * Pre-init segment. Map factory arguments.
 * Needs revision and does not belong here. `#revise_me`
 */
const el = document.createElement('div');
el.id = 'map';
el.style.height = '100vh';
/*el.style.border = '4px inset';*/

let coordinateReferenceSystem
// Check if the CRS is defined as a window variable
if (window.sysCrs) {
    // Check if it is an object and contains the `code` property
    if (typeof window.sysCrs === 'object' && window.sysCrs.code) {
        coordinateReferenceSystem = crs(...Object.values(window.sysCrs))
    } else if (typeof window.sysCrs === 'string') {
        // If it is a string, check if corresponds with one of the defined coordinate reference systems
        if (window.sysCrs === 'EPSG:3857') {
            coordinateReferenceSystem = factory.CRS.EPSG3857
        } else if (window.sysCrs === 'EPSG:3395') {
            coordinateReferenceSystem = factory.CRS.EPSG3395
        } else if (window.sysCrs === 'EPSG:4326') {
            coordinateReferenceSystem = factory.CRS.EPSG4326
        }
    }
} else {
    // Fallback, just in case the coordinate reference system is not defined
    coordinateReferenceSystem = crs(...Object.values(COORDINATE_REFERENCE_SYSTEM))
}

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
Map.render = function render() {
    let container = document.getElementById(store.getState().map.id);
    container.appendChild(el);

    /**
     * Hack for lack of coordination between core and this plugin. 
     * Header and footer are forced to always render by core.
     * Hide them each time this plugin is initialized.
     * Show them whenever the plugin is uninitialized.
     * #revise_me
     */
    document.getElementById('navbar').style.display = 'none';
    document.getElementById('footer').style.display = 'none';

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