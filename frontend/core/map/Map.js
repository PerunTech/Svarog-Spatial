import { factory, util, crs } from '..';
import { MAP_CONTAINER, MAP_CONFIG } from '../../config';

/**
 * Pre-init segment. Needs revision and does not belong here. `#revise_me`
 */
const el = document.createElement('div');
el.id = 'map';
el.style.height = '100vh';
el.style.border = '4px inset';

const crs_mk = crs('EPSG:6316', '+proj=tmerc +lat_0=0 +lon_0=21 +k=0.9999 +x_0=7500000 +y_0=0' +
'+ellps=bessel +towgs84=682,-203,480,0,0,0,0 +units=m +no_defs', {
    distances: [ 5000000, 2500000, 1000000, 750000, 500000,
        250000, 100000, 75000, 50000, 25000, 10000,
        7500, 5000, 2500, 1000, 750, 500, 250, 100 ],
    description: 'MGI 1901 / Balkans zone 7'
})

/**
 * Overrides segment. Keep this on top of file.
 * Prototype changes are done before we create our Map instance.
 */
factory.Map.prototype._initControlPos = function () {
    this._controlCorners = {};
    this._controlContainer = factory.DomUtil.create('div', 'control-container', this._container);

    const setLocation = (container, side) => factory.DomUtil.create('div', 'control-' + side, container);
    
    /* Preserve order of top/center/bottom, layout is vertical (flexbox), elements are blocks. */
    ['top', 'center', 'bottom'].map(side => {
        this._controlCorners[side] = setLocation(this._controlContainer, side); });
    /* Sub-locations of the main (center) screen, inline layout.
    Data and layer panels on the side, earth-view (the Map) in the center. */ 
    ['left', 'map', 'right'].map(side => {
        this._controlCorners[side] = setLocation(this._controlCorners.center, side); });
    /**
     * Added corner locations embedded in control.map (the main content view), these are the default leaflet locations.
     * Use for helper controls with transparent background. Details in the leaflet documentation.
     */
    ['topleft', 'topright', 'bottomleft', 'bottomright'].map(side => {
        this._controlCorners[side] = setLocation(this._controlCorners.map, side); });
};

/**
 * The map instance of the application.
 * 
 * @namespace Map
 */
export const Map = factory.map(el, util.obj.assign(MAP_CONFIG, {
    crs: crs_mk,
    origin: [7453631.01165012, 4523013.16848829],
}));

/**
 * Augmentation segment. Extends Map.
 */
Map.render = function render () {
    let container = document.getElementById(MAP_CONTAINER);
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
    return '';
}