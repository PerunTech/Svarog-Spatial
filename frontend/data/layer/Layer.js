import { factory } from '../../core';

/**
 * @section overrides
 * Classes extending `factory.Layer` will inherit the following method overrides:
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
    obj && obj.removeLayer(this);

    return this;
}

/**
 * @section extends
 * Classes extending `factory.Layer` will inherit these additional methods:
 */
factory.Layer.include({
    /**
     * getter for our configuration namespace in layer.instance.options
     * 
     * @returns this.options.metadata || {};
     */
    getMetadata: function () {
        return this.options.metadata || {};
    },


    /**
     * Check if our layer is configured with metadata.
     * 
     * @returns boolean;
     */
    hasMetadata: function () {
        return Object.keys(this.getMetadata()).length > 0;
    }
});
