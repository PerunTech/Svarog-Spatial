import { Map, factory } from '../../core'
/*
export const raster = function () {
    const testTile = factory.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        { maxZoom: 18, }
    ).addTo(Map);

    // testTile.addTo(Map);
    factory.control.layers({base: testTile}, {}, {collapsed: false}).addTo(Map);
};
*/

export const raster = function () {
    const testTile = factory.tileLayer.wms(
        'http://192.168.9.88:8080/geoserver/mk/wms', { 
            layers: 'Macedonia_30cm',
            format: 'image/png',
            transparent: true,
            // LABEL: 'Ортофотографија, Македонија 2017',
            // TILED: true 
        }
    ).addTo(Map);

    // testTile.addTo(Map);
    factory.control.layers({base: testTile}, {}, {collapsed: false}).addTo(Map);
};