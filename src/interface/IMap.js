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
        return this.getProto().constructor(el, opt);
    },

    /**
     * Test method.
     * 
     * @function getCenter (): proto.getCenter()
     * 
     * @returns proto.getCenter();
     */
    getCenter () {
        console.log('shadow prototype method, do your thing and curry-pass to the implementation');
        
        return this.getProto().getCenter();
    }
})