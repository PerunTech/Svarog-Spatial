import L from 'leaflet'
import {Util} from '../core/Util'

export const IRender = (function (L) {
    return {
        /**
         * @function get
         * (path?: String): Object
         *
         * @param {String} path
         *
         * @returns (render.path || undefined) || render root
         */
        get (path = null) {
            return path ? Util.get(path, L) : L
        },

        /**
         * @function call
         * @returns Fn.call(this, args)
         */
        call () {
        }
    }
})(L)