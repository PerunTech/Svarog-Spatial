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

export const Map = Core.extend(
    (function () {  // IIFE for private scope
        /**
         * Map instance.
         * 
         * @private
         * @type {Map}
         */
        let _map;

        return {
            /**
             * 
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
        }
    })()
)
