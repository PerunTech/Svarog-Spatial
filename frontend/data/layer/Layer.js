import { factory, store } from '../../core';

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
    return this.publishMetadata();
}

/**
 * Removes the layer from the given map.
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
    return this.stashMetadata();
}

/**
 * @section extends
 * Classes extending `factory.Layer` will inherit these additional methods:
 */
factory.Layer.include({
    /**
     * Get Layer ID.
     * 
     * @extends Layer.prototype
     * 
     * returns Layer.ID;
     */
    getId: function ()  {
        return factory.Util.stamp(this);
    },
    
    /**
     * Getter for our configuration namespace in layer.instance.options
     * 
     * @extends Layer.prototype
     * 
     * @returns this.options.metadata || {};
     */
    getMetadata: function () {
        return this.options.metadata || {};
    },

    /**
     * Check if our layer is configured with metadata.
     * 
     * @extends Layer.prototype
     * 
     * @returns boolean;
     */
    hasMetadata: function () {
        return Object.keys(this.getMetadata()).length > 0;
    },

    /**
     * Registers data in app state.
     * 
     * &nbsp;
     * 
     * @extends Layer.prototype
     * 
     * @returns Layer;
     */
    publishMetadata: function () {
        this.hasMetadata()
            && store.dispatch({ ...store.getState().data, [ this.getId() ]: this });

        return this;
    },

    /**
     * Removes data published in app state.
     * The opposite of `publishMetadata`.
     * 
     * &nbsp;
     * 
     * @extends Layer.prototype
     * 
     * @returns Layer;
     */
    stashMetadata: function () {
        // Do not mutate store.state.data, create new object and merge.
        const id = this.getId(),
            data = { ...store.getState().data }; 

        // remove property and publish current state - minus this
        data[id] && ( delete data[id], store.dispatch({ ...data })); 

        return this;
    }
});
