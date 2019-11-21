import { util, factory as fc } from '../../core';
import * as measUtils from './Util';

export const measureCircle = {
    showMeasurements: function(opt = {}) {
        if (!this._map || this._measurementLayer) return this;

        this._measurementOptions = util.clone({
            showOnHover: false,
            showArea: true,
            lang: {
                totalArea: 'Total area',
            }
        }, opt);

        this._measurementLayer = fc.layerGroup().addTo(this._map);
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
            let area = measUtils.circleArea(this.getRadius());
            
            fc.marker.measurement(latLng, formatter(area), options.lang.totalArea, 0, options)
                .addTo(this._measurementLayer);
        }
    },

    onAdd: measUtils.override(fc.Circle.prototype.onAdd, function(protoVal) {
        let showOnHover = this.options.measurementOptions && this.options.measurementOptions.showOnHover;
        if (this.options.showMeasurements && !showOnHover) {
            this.showMeasurements(this.options.measurementOptions);
        }

        return protoVal;
    }),

    onRemove: measUtils.override(fc.Circle.prototype.onRemove, function(protoVal) {
        this.hideMeasurements();

        return protoVal;
    }, true),

    setLatLng: measUtils.override(fc.Circle.prototype.setLatLng, function(protoVal) {
        this.updateMeasurements();

        return protoVal;
    }),

    setRadius: measUtils.override(fc.Circle.prototype.setRadius, function(protoVal) {
        this.updateMeasurements();

        return protoVal;
    }),

    formatArea: measUtils.formatArea
};

fc.Circle.include(measureCircle);
    
fc.Circle.addInitHook(function() {
    measUtils.initHook.call(this);
});