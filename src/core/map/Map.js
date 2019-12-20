import { factory, util, crs } from '..';
import { MAP_CONTAINER, MAP_CONFIG } from '../../config';

const el = document.createElement('div');
el.id = 'map';
el.style.height = '99vh';
el.style.border = '4px inset';

const crs_mk = crs('EPSG:6316', '+proj=tmerc +lat_0=0 +lon_0=21 +k=0.9999 +x_0=7500000 +y_0=0' +
'+ellps=bessel +towgs84=682,-203,480,0,0,0,0 +units=m +no_defs', {
    distances: [ 5000000, 2500000, 1000000, 750000, 500000,
        250000, 100000, 75000, 50000, 25000, 10000,
        7500, 5000, 2500, 1000, 750, 500, 250, 100 ]
})

/**
 * The map instance of the application.
 * 
 * @namespace Map
 */
export const Map = factory.map(el, util.assign(MAP_CONFIG, {
    center: crs_mk.projection.unproject({x: 7544373.74, y: 4577135.27}),
    crs: crs_mk,
    origin: [7453631.01165012, 4523013.16848829],
}));

Map.render = function render () {
    let container = document.getElementById(MAP_CONTAINER);
    container.appendChild(el);
    
    return this.invalidateSize();
};

Map.setCursor = function (type) {
    this.getContainer().style.cursor = type;
    
    return this;
};