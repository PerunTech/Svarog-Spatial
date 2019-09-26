
import { Map } from 'leaflet'
import { Interface } from "../core/Interface";

/**
 * @interface iMap
 */
export const iMap = Interface.define(Map.prototype, Map.prototype)  
// 2nd <i> argument can be:
//      Object.assign({  /*do our interface implementation and curry-pass to prototype */ }, Map.prototype)
