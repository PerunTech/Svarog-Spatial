import { factory } from '..';
const { point, GeoJSON } = factory;

/**
 * GeoJSON factory.
 * 
 * Supports any valid coordinate reference system, spherical or cartesian.
 * Automatically reprojects data.
 * 
 * &nbsp;
 * 
 * @extends {factory.GeoJSON}
 * @factory geoJson (geometry: any, opt: Object): GeoJSON
 * 
 * @param {*} geometry - The geometry data.
 * @param {*} opt - Configuration object.
 * 
 * @returns GeoJSON;
 */
export function geoJson (geometry, opt) {
    let _callLevel = 0,
        impl = GeoJSON.prototype.initialize.call(this, geometry, opt);

    return {
        ...impl,

        /**
         * @override GeoJSON.prototype.addData
         * @param {any} geometry 
         */
        addData: function (geometry) {
            const { crs } = geometry;

            // Do not instantiate new crs on add data calls!
            // Defer responsibility to caller. 
            // maybe extend factory arguments to allow to pass crs, rather than append on data
            // or simply pass convert function in opt { reproject: fn }
            if (crs && crs.projection) {
                this.options.coordsToLatLng = function(coords) {
                    return crs.projection.unproject(point(coords[0], coords[1]));
                };
            }
            // Base class' addData might call us recursively, but crs shouldn't be cleared in that case,
            // since crs applies to the whole GeoJSON, inluding sub-features.
            _callLevel++;

            try {
                GeoJSON.prototype.addData.call(this, geometry);
            } finally {
                _callLevel--;
                _callLevel === 0 && delete this.options.coordsToLatLng;
            }

            return this;
        }
    };
}