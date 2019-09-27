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
     * Access this in order to shadow / extend operations of the prototype.
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
     * Test method.
     * 
     * @function getCenter (): proto.getCenter();
     * 
     * @returns proto.getCenter();
     */
    getCenter () {
        console.log('shadow prototype method, do your thing and curry-pass to the implementation');
        
        return this.getProto().getCenter();
    }
})