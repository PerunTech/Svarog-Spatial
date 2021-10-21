import { factory, Map, util } from '../../core';

/* private refs to source methods, to be overriden below. */
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
    initialize: function (geojson, options) {
        this._callLevel = 0;
        _initialize.call(this, geojson, options);
    },

    /**
     * @override
     * 
     * @param {*} geojson 
     */
    addData: function (geojson) {
        if (geojson) {
            if (_crs !== undefined) {
                this.options.coordsToLatLng = function (coords) {
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
});

/**
* Creates geojson from vectors.
* 
* Compatible with all factory entities, including multipolygons with holes
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
factory.GeoJSON.fromLayer = function (layer, crs) {
    const geojson = layer.toGeoJSON();
    let lcrs = crs || layer._map.getCRS();
    return factory.GeoJSON.reproject(geojson, lcrs);
}

/**
* Reproject geoJson
* 
* &nbsp;
* 
* @function reproject(layer: Layer, crs?: CRS): GeoJSON
* 
* @param {GeoJSON} geojson - The layer to be serialized.
* @param {CRS} crs - The coordinate reference system for coords transformation.
* 
* @returns GeoJSON;
*/
factory.GeoJSON.reproject = function (geojson, crs) {
    const coords = geojson.geometry.coordinates,
        type = geojson.geometry.type;

    if (type == "MultiPolygon")
        factory.GeoJSON.reprojectMultiPolygon(coords, crs);
    else
        if (type == "Polygon")
            factory.GeoJSON.reprojectPolygon(coords, crs);
        else
            if (type == "LineString")
                factory.GeoJSON.reprojectLineString(coords, crs);
    return geojson;

}


factory.GeoJSON.reprojectPoint = function (coords, crs) {
    let ll = factory.latLng(coords[1], coords[0]);
    let p = crs.projection.project(ll);
    return [p.x, p.y];
}

factory.GeoJSON.reprojectLineString = function (coords, crs) {
    coords.forEach((arr, i, self) => {
        let result = factory.GeoJSON.reprojectPoint(arr, crs);
        self[i] = result;
    });
}

factory.GeoJSON.reprojectPolygon = function (coords, crs) {
    coords.forEach((arr, i, self) => {
        factory.GeoJSON.reprojectLineString(arr, crs);
    });
}
factory.GeoJSON.reprojectMultiPolygon = function (coords, crs) {
    coords.forEach((arr, i, self) => {
        factory.GeoJSON.reprojectPolygon(arr, crs);
    });
}
