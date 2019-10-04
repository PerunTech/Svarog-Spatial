import L from 'leaflet'

let _map;

export const Map = {
    init (el, opt = {}) {
        _map = L.map(el, opt);
    },

    /**
     * `#revise_me`, account for CRS difference | match between data and map
     */
    getBBox () {
        let psw = this.getBounds().getSouthWest();
        let pne = this.getBounds().getNorthEast();

        return psw.x + ',' + psw.y + ',' + pne.x + ',' + pne.y;
    },

    getBounds () {
        return _map.getBounds(_map);
    },

    getCenter () {
        return _map.getCenter(_map);
    },

    getPane (name) {
        return _map.getPane(_map, name);
    },

    getZoom () {
        return _map.getZoom(_map);
    },

    fitBounds (bounds, opt) {
        return _map.fitBounds(_map, bounds, opt);
    },

    flyTo (cnt, zoom, opt) {
        return _map.flyTo(_map, cnt, zoom, opt);
    },

    setView (cnt, zoom) {
        return _map.setVIew(_map, cnt, zoom);
    }
}