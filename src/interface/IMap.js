
import { Map } from 'leaflet'
import { Interface } from "../core/Interface";

// Has to work with map instance

/**
 * @interface IMap
 */
export const IMap = Interface.define(Map, {
    setView: function () {
        console.log('Imap interface member called.')
    }
})