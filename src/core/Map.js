import { Core } from "./Core";
import { iMap } from "../interface/IMap";

/*
Map.getBounds()

Map.getCenter()

Map.getZoom()

Map.getPane()

Map.setView()

Map.fitBounds()

Map.flyTo()

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

    getBounds () {
        return iMap.getBounds(_map);
    },

    getCenter () {
        return iMap.getCenter(_map);
    },

    getPane () {
        return iMap.getPane(_map);
    },

    getZoom () {
        return iMap.getZoom(_map);
    }
})
