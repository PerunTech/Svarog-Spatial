import { factory } from '../../core';

/**
 * @override section 
 * Classes extending `factory.LayerGroup` will inherit the following method overrides:
 */

/**
 * Adds the given layer to the group.
 * 
 * @override
 * @method addLayer(layer: Layer): this
 * 
 * @param {*} layer
 * 
 * @returns LayerGroup;
 */
factory.LayerGroup.prototype.addLayer = function (layer) {
    var id = this.getLayerId(layer);

    this._layers[id] = layer;

    if (this._map) {
        this._map.addLayer(layer);
        this._layers[id].publish();
    }

    return this;
},

/**
 * Removes the given layer from the group.
 * 
 * @override
 * @method removeFrom(layer: Layer): this
 * 
 * @param {*} layer
 * 
 * @returns LayerGroup;
 */
factory.LayerGroup.prototype.removeLayer = function (layer) {
    var id = layer in this._layers ? layer : this.getLayerId(layer);

    if (this._map && this._layers[id]) {
        this._map.removeLayer(this._layers[id]);
        this._layers[id].stash();
    }

    delete this._layers[id];

    return this;
}