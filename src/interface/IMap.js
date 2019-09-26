
import { Map } from 'leaflet'
import { Interface } from "../core/Interface";

// Has to work with map instance

/**
 * @interface iMap
 */
export const iMap = Interface.define(Map, {
    setView: function () {
        console.log('imap interface member called.')
    }
})