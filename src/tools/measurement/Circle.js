import { util, factory } from '../../core';
import { override, circleArea, addInitHook, formatArea } from './Util';

const { layerGroup, marker, Circle } = factory;

export const measureCircle = {
    showMeasurements: function(options) {
        if (!this._map || this._measurementLayer) return this;

        this._measurementOptions = util.cloneDeep({
            showOnHover: false,
            showArea: true,
            lang: {
                totalArea: 'Total area',
            }
        }, options || {});

        this._measurementLayer = layerGroup().addTo(this._map);
        this.updateMeasurements();

        this._map.on('zoomend', this.updateMeasurements, this);

        return this;
    },

    hideMeasurements: function() {
        if (!this._map) return this;

        this._map.on('zoomend', this.updateMeasurements, this);

        if (!this._measurementLayer) return this;
        this._map.removeLayer(this._measurementLayer);
        this._measurementLayer = null;

        return this;
    },

    updateMeasurements: function() {
        if (!this._measurementLayer) return;

        let latLng = this.getLatLng(),
            options = this._measurementOptions,
            formatter = options.formatArea || util.bind(this.formatArea, this);

        this._measurementLayer.clearLayers();

        if (options.showArea) {
            formatter = options.formatArea || util.bind(this.formatArea, this);
            let area = circleArea(this.getRadius());
            
            marker.measurement(latLng, formatter(area), options.lang.totalArea, 0, options)
                .addTo(this._measurementLayer);
        }
    },

    onAdd: override(Circle.prototype.onAdd, function(protoVal) {
        let showOnHover = this.options.measurementOptions && this.options.measurementOptions.showOnHover;
        if (this.options.showMeasurements && !showOnHover) {
            this.showMeasurements(this.options.measurementOptions);
        }

        return protoVal;
    }),

    onRemove: override(Circle.prototype.onRemove, function(protoVal) {
        this.hideMeasurements();
        return protoVal;
    }, true),

    setLatLng: override(Circle.prototype.setLatLng, function(protoVal) {
        this.updateMeasurements();
        return protoVal;
    }),

    setRadius: override(Circle.prototype.setRadius, function(protoVal) {
        this.updateMeasurements();
        return protoVal;
    }),

    formatArea: formatArea,
};

Circle.include(measureCircle);

Circle.addInitHook(function() {
    addInitHook.call(this);
});