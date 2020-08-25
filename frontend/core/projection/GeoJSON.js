import { factory, Map } from '..';

const { GeoJSON } = factory;
//#revise_me, this does not belong here, is should be an argument to GeoJson constructor.
const crs = Map.getCRS();

GeoJSON.fromLayer = (layer, crs) => {
    const geojson = layer.toGeoJSON();
    const coords = geojson.geometry.coordinates[0];

    coords.forEach((val, i, self) => {
        let ll = factory.latLng(val[1], val[0]);
        let p = crs.projection.project(ll);
        
        self[i] = [ p.x, p.y ];
    });

    return geojson;
}


export const GeoJson = factory.GeoJSON.extend({
    initialize: function(geojson, options) {
        this._callLevel = 0;
        GeoJSON.prototype.initialize.call(this, geojson, options);
    },

    addData: function(geojson) {
        if (geojson) {
            if (crs !== undefined) {
                this.options.coordsToLatLng = function(coords) {
                    var point = factory.point(coords[0], coords[1]);
                    return crs.projection.unproject(point);
                };
            }
        }

        // Base class' addData might call us recursively, but
        // CRS shouldn't be cleared in that case, since CRS applies
        // to the whole GeoJSON, inluding sub-features.
        this._callLevel++;
        try {
            GeoJSON.prototype.addData.call(this, geojson);
        } finally {
            this._callLevel--;
            if (this._callLevel === 0) {
                delete this.options.coordsToLatLng;
            }
        }
    }
});

/**
 * GeoJSON factory.
 * 
 * Supports any valid coordinate reference system, spherical or cartesian.
 * Automatically reprojects data.
 * 
 * &nbsp;
 * 
 * @extends {factory.GeoJSON}
 * @factory geoJson (geojson: any, opt: Object): GeoJson
 * 
 * @param {*} geojson - The geojson object.
 * @param {*} opt - Configuration object.
 * 
 * @returns GeoJSON;
 */
export const geoJson = function(geojson, opt) {
    return new GeoJson(geojson, opt);
};