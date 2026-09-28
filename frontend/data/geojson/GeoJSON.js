import { factory, Map, store } from '../../core';
import { toCrs } from '../../core/map/Create';

/* private refs to source methods, to be overriden below. */
const _initialize = factory.GeoJSON.prototype.initialize,
    _addData = factory.GeoJSON.prototype.addData;

/**
 * How a layer reads its stored coordinates, worked out when data is added to it.
 *
 * Through the layer's own `crs` if it has one, and otherwise through the page's
 * map's CRS as it is at that moment. This used to be the page's map's CRS as it
 * was when this module loaded, and since 5.0 that is always the default,
 * EPSG:3857, because `configure()` can only run after this bundle evaluates. A
 * deployment with its map and its data on a national grid had its stored metres
 * read as Web Mercator, and nothing said so.
 *
 * A layer cannot use the map it is on instead: data is usually added before the
 * layer is on any map. A layer for a map on a CRS of its own says so with `crs`.
 *
 * A CRS the back-end declares for its data (`dbCRSCode` in the store) still wins
 * wherever it differs and is one Leaflet carries, as it always has.
 *
 * @param {string|Object} [option] - The layer's `crs` option: any form
 *     `configure()` takes, or a CRS.
 * @returns {Function} A `coordsToLatLng` for the layer's options.
 */
const coordsToLatLngFor = (option) => {
    const _crs = toCrs(option) || Map.getCRS();
    const dbCRSCode = store.getState()?.dbCRSCode?.dbCRS
    const mapCRSCode = _crs.code?.split(':')[1]

    return function (coords) {
        const point = factory.point(coords[0], coords[1]);
        let unprojectedPoint = _crs.projection.unproject(point)
        // Check if there is a predefined CRS used on the back-end and if it's different than the one the map is using
        if (dbCRSCode && dbCRSCode !== mapCRSCode) {
            // Check if it corresponds with one of the defined coordinate reference systems
            if (dbCRSCode === '3857') {
                unprojectedPoint = factory.CRS.EPSG3857.unproject(point)
            } else if (dbCRSCode === '3395') {
                unprojectedPoint = factory.CRS.EPSG3395.unproject(point)
            } else if (dbCRSCode === '4326') {
                unprojectedPoint = factory.CRS.EPSG4326.unproject(point)
            }
        }
        return unprojectedPoint;
    };
};


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
        /* Worked out on the call from outside only. The calls the base class makes
           back into this one, a feature at a time, are the same data, and would
           otherwise resolve the CRS once per feature. */
        if (geojson && !this._callLevel) {
            this.options.coordsToLatLng = coordsToLatLngFor(this.options.crs);
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
    coords.forEach((arr) => {
        factory.GeoJSON.reprojectLineString(arr, crs);
    });
}

factory.GeoJSON.reprojectMultiPolygon = function (coords, crs) {
    coords.forEach((arr) => {
        factory.GeoJSON.reprojectPolygon(arr, crs);
    });
}
