import { factory, store, util } from '../../core';

/**
 * @override section 
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
    this.publish();

    return this;
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
    this.stash();
    
    return this;
}

/**
 * @extends section 
 * Classes extending `factory.Layer` will inherit these additional methods:
 */
factory.Layer.include({
    /**
     * Retrieves the system identifier of the layer.
     * 
     * Attempts to retrieve the GeoJSON feature id in case the data exists in persistent storage
     * and fallbacks to factory.layer._id otherwise, which is the runtime id.
     * 
     * @extends Layer.prototype
     * 
     * returns Number;
     */
    getId: function ()  {
        return this.feature 
            ? this.feature.id
            : factory.Util.stamp(this);
    },

    /**
     * Retrieves the human-readable identifier of the layer.
     * 
     * @extends Layer.prototype
     * 
     * returns String;
     */
    getName: function () {
        return this.getMetadata().namePath
            ? util.access(this, this.getMetadata().namePath)
            // Consider a property that exists on every object instance of type Layer which can serve as fallback.
            : '';
    },

    /**
     * Retrieves a measurement of the current geometry of the layer.
     * 
     * This is the area [m²] for polygons and length [m] for lines.
     * 
     * Will attempt to calculate the measurement based on layer type.
     * If the type is invalid it will try to retrieve the GeoJSON.feature.properties.AREA field
     * and otherwise exit to a generic string template.
     * 
     * @extends Layer.prototype
     * 
     * returns number;
     */
    getMeasurement: function ()  {
        return this instanceof factory.Polygon
            ? this.calculateArea(this.getLatLngs()[0]) // Outer ring is the first element of _latLngs. holes?
            : this instanceof factory.Polyline
                ? this.calculateDistance(this.getLatLngs())
                : this.feature
                    ? Number(this.feature.properties.AREA)
                    : 0;
    },
    
    /**
     * Getter for our configuration namespace in layer.instance.options
     * 
     * @extends Layer.prototype
     * 
     * @returns this.options.metadata;
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
     * Registers layer in app state.
     * 
     * &nbsp;
     * 
     * @extends Layer.prototype
     * 
     * @returns Layer;
     */
    publish: function () {
        const currState = store.getState().data.layers;

        this.hasMetadata()
            && store.dispatch({ layers: { ...currState, [ this.getId() ]: this} });

        return this;
    },

    /**
     * Removes layer from app state.
     * The opposite of `Layer.publish`.
     * 
     * &nbsp;
     * 
     * @extends Layer.prototype
     * 
     * @returns Layer;
     */
    stash: function () {
        // Do not mutate store.state entries, create new object and merge.
        const id = this.getId(),
            currState = { ...store.getState().data.layers }; 

        // remove property and publish current state - minus this
        currState[id] 
            && ( delete currState[id], store.dispatch({ layers: currState }) );

        return this;
    }
});
