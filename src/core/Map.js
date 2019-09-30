import { Core } from "./Core";
import { iMap } from "../interface/IMap";

/*
Map.setOrigin()

Map.hasLayer()

<<<< Map.pm >>>>

Map.pm.disableDraw

Map.pm.enableDraw
*/

/**
 * The actual map instance.
 * 
 * @private
 * @type {Map}
 */
let _map;

export const Map = Core.extend({
    /**
     * @constructs Map
     */
    init: function (el, opt) {
        // init internal map
        _map = iMap.init(el, opt);
    },

    // Map state getters

    getBBox () {
        let psw = this.getBounds().getSouthWest();
        let pne = this.getBounds().getNorthEast();

        return psw.x + ',' + psw.y + ',' + pne.x + ',' + pne.y;
    },

    getBounds () {
        return iMap.getBounds(_map);
    },

    getCenter () {
        return iMap.getCenter(_map);
    },

    getPane (name) {
        return iMap.getPane(_map, name);
    },

    getZoom () {
        return iMap.getZoom(_map);
    },

    // Map state setters

    fitBounds (bounds, opt) {
        return iMap.fitBounds(_map, bounds, opt);
    },

    flyTo (cnt, zoom, opt) {
        return iMap.flyTo(_map, cnt, zoom, opt);
    },

    setView (cnt, zoom) {
        return iMap.setVIew(_map, cnt, zoom);
    }

})
