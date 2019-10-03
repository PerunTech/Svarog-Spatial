import L from 'leaflet';

/**
 * Defers factory calls to Leaflet implementations.
 * 
 * @module protoFactory
 */
export const protoFactory = {

    latLng (lat, lng, alt) {
        return L.latLng(lat, lng, alt);
    },

    point (x, y, r) {
        return L.point(x, y, r);
    },

    transformation (a, b, c, d) {
        return L.transformation(a, b, c, d);
    }
}