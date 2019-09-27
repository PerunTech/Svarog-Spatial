import { Interface } from "../core/Interface";
import { Util } from '../core/Util';
import { Map } from 'leaflet'


/**
 * @interface iMap
 */
export const iMap = Interface.define(Map.prototype, Util.create(Map.prototype))


/*
getCenter() {
    console.log('shadowed implementation prototype, do curry-pass next');
    return _mapProto.getCenter();
}
*/