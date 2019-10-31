import L from 'leaflet'
import { Map } from '../../core/index'

export const raster = function () {
    const testTile = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        { maxZoom: 18 }
    )

    Map.add(testTile);
};