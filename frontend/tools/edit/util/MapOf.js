/**
 * The map an editing tool works on: the one the layer it is given is on.
 *
 * That is upstream's rule, and it is the one that holds with more than one map.
 * Vertex markers, the snapping list and the drag listeners belong beside the
 * layer being edited, whichever map's tools were asked to edit it. A layer that
 * is on no map yet gets the fallback, which for the page's tools is the page's
 * map, where they have always put their markers.
 *
 * @param {Object} layer - The layer a tool is being enabled on.
 * @param {Object} fallback - The map the tool belongs to.
 * @returns {Object} A Leaflet map.
 */
export const mapOf = (layer, fallback) => layer._map || fallback;
