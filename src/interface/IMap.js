import { Interface } from "../core/Interface";
import { Map } from 'leaflet'

/**
 * @interface iMap
 */
export const iMap = Interface.define(Map.prototype, {
    /**
     * Implementation object getter. 
     * 
     * Root method of the API. Private scope reference to Map.prototype.
     * Access this in order to shadow / extend / override operations of the prototype.
     * Fetch your implementation and return it in your wrapper function.
     * 
     * `#revise_me` - this may be a bad idea. Exposed proto to outside.
     * 
     * &nbsp;
     * 
     * @function getProto (): Map.prototype
     * 
     * @returns Map.prototype;
     */
    getProto () {
        return Map.prototype;
    },

    /**
     * Map factory.
     * 
     * &nbsp;
     * 
     * @function init (el: string | HTMLElement, opt?: Object): Map
     * 
     * @param {string | HTMLElement} el - ID of a HTML-Element as string or the HTML-ELement itself. 
     * @param {Object} [opt] - Map configuration object.
     * 
     * @returns Map;  
     */
    init (el, opt) {
        let mapConstructor = this.getProto().constructor;

        return new mapConstructor(el, opt);
    },

    // shadow prototype test methods, do our thing and curry-pass to the implementation
    // require the current map instance, a private ref in Map.
    getBounds (map) {
        return this.getProto().getBounds.call(map);
    },

    getCenter (map) {
        return this.getProto().getCenter.call(map);
    },

    getPane (map) {
        return this.proto().getPane.call(map);
    },

    getZoom (map) {
        return this.proto().getZoom.call(map);
    }
})