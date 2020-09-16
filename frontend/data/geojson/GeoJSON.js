import { factory, Map } from '../../core';

const _initialize = factory.GeoJSON.prototype.initialize,
      _addData = factory.GeoJSON.prototype.addData,
      _crs = Map.getCRS();


/** @extends section */
factory.GeoJSON.include({
    /**
     * @override
     * 
     * @param {*} geojson 
     * @param {*} options 
     */
    initialize: function(geojson, options) {
        this._callLevel = 0;
        _initialize.call(this, geojson, options);
    },

    /**
     * @override
     * 
     * @param {*} geojson 
     */
    addData: function(geojson) {
        if (geojson)  {
            if (_crs !== undefined) {
                this.options.coordsToLatLng = function(coords) {
                    var point = factory.point(coords[0], coords[1]);
                    return _crs.projection.unproject(point);
                };
            }
        }

        // Base class' addData might call us recursively, but
        // CRS shouldn't be cleared in that case, since CRS applies
        // to the whole GeoJSON, inluding sub-features.
        this._callLevel++;
        try {
            _addData.call(this, geojson);
        } finally {
            this._callLevel--;
            if (this._callLevel === 0) {
                delete this.options.coordsToLatLng;
            }
        }
    },


    /**
     * Creates geojson from vectors.
     * 
     * Compatible with all factory entities.
     * Re-projects coordinates.
     * 
     * &nbsp;
     * 
     * @function fromLayer(layer: Layer, crs?: CRS): GeoJSON
     * 
     * @param {Layer} layer - The layer to be serialized.
     * @param {CRS} crs - The coordinate reference system for coords transformation.
     * 
     * @returns GeoJSON;
     */
    fromLayer: function (layer, crs) {
        const geojson = layer.toGeoJSON(),
              coords = geojson.geometry.coordinates[0],
              _crs = crs || layer._map.getCRS();
    
        coords.forEach((val, i, self) => {
            let ll = factory.latLng(val[1], val[0]);
            let p = _crs.projection.project(ll);
            
            self[i] = [ p.x, p.y ];
        });
    
        return geojson;
    }
});