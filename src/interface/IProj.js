import proj4 from 'proj4'

export const IProj = (function () {

    return {
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
    }
})()