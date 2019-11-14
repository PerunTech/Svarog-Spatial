import { Map, factory } from '../../core'

export const raster = function () {
    const testTile = factory.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        { maxZoom: 18 }
    )

    // testTile.addTo(Map);
    factory.control.layers({base: testTile}).addTo(Map);
};