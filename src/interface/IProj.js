import proj4 from 'proj4';
import { Interface } from '../core/Interface';

/**
 * API for the core projection library.
 * 
 * @interface iProj
 */
export const iProj = Interface.define(proj4, {
    /**
     * Define a projection.
     * 
     * &nbsp;
     * 
     * @function define (code: String, def: String): Projection
     * 
     * @param {String} code - CRS code, as specified by the European Petroleum Survey Group. 
     * @param {String} def  - Proj4 defintion of the projection specified by the code.
     * 
     * @returns Projection;
     */
    define (code, def) {
        if (def) {
            proj4.defs(code, def);
        } else if (proj4.defs[code] === undefined) {
            var urn = code.split(':');
            if (urn.length > 3) {
                code = urn[urn.length - 3] + ':' + urn[urn.length - 1];
            }
            if (proj4.defs[code] === undefined) {
                throw 'No projection definition for code ' + code;
            }
        }

        return proj4(code);
    }
})

