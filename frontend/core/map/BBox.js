/**
 * A map's view as a WMS bounding box: "minx,miny,maxx,maxy" in the map's own CRS.
 *
 * A function of the map rather than a method on it, so a layer can ask it of
 * the map it is on: the page's, one from `createMap`, or a plain Leaflet map,
 * which has no `getBBox`. It is a file of its own, importing nothing, because the
 * WMS layer that needs it is loaded while the factory is still being built, and
 * `Create.js` cannot load until the factory exists.
 *
 * @param {Object} map - A Leaflet map.
 * @returns {string}
 */
export const bboxOf = (map) => {
    const crs = map.options.crs;
    const bounds = map.getBounds();

    const psw = crs.projection.project(bounds.getSouthWest())
    const pne = crs.projection.project(bounds.getNorthEast())

    return psw.x + ',' + psw.y + ',' + pne.x + ',' + pne.y;
};
