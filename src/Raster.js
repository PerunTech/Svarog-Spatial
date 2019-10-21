import L from 'leaflet'
import { Map } from './core/map/Map'

export const raster = function () {
    const testTile = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        { maxZoom: 18 }
    )

    Map.add(testTile);
};