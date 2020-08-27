import { factory } from '../../core';

/**
 * @section
 * Classes extending `factory.Layer` will inherit the following methods:
 */

/**
 * Adds the layer to the given map or layer group.
 * 
 * @override
 * @method addTo(map: Map|LayerGroup): this
 * 
 * @param {*} map
 * 
 * @returns layer;
 */
factory.Layer.prototype.addTo = function (map) {
    console.log(this.options)
    map.addLayer(this);
    return this;
}

/**
 * Removes the layer from the map it is currently active on.
 * 
 * @override
 * @method remove: this
 * 
 * @returns layer;
 */
factory.Layer.prototype.remove = function () {
    return this.removeFrom(this._map || this._mapToAdd);
}

/**
 * Removes the layer from the given map
 * 
 * @override
 * @method removeFrom(map: Map): this
 * 
 * @param {*} obj
 * 
 * @returns layer;
 */
factory.Layer.prototype.removeFrom = function (obj) {
    console.log(this.options)
    obj && obj.removeLayer(this);

    return this;
}