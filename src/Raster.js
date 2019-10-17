import L from 'leaflet'
import { Map } from './core/map/Map'

export const raster = function () {
    L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        { maxZoom: 18 }
    ).addTo(Map.getInstance())
}