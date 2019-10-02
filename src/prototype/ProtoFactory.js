import L from 'leaflet';

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