import { util, factory } from '../../core';
import { addInitHook, formatArea, formatDistance, ringArea } from './Util';

const { marker, layerGroup, Polyline, Polygon } = factory;

export const measureLine = {
    showMeasurements: function (options) {
        if (!this._map || this._measurementLayer) return this;

        this._measurementOptions = util.assignDeep({
            showOnHover: (options && options.showOnHover) || false,
            minPixelDistance: 30,
            showDistances: true,
            showArea: true,
            lang: {
                totalLength: 'Total length',
                totalArea: 'Total area',
                segmentLength: 'Segment length'
            }
        }, options || {});

        this._measurementLayer = layerGroup().addTo(this._map);
        this.updateMeasurements();

        this._map.on('zoomend', this.updateMeasurements, this);

        return this;
    },

    hideMeasurements: function () {
        if (!this._map) return this;

        this._map.off('zoomend', this.updateMeasurements, this);

        if (!this._measurementLayer) return this;
        this._map.removeLayer(this._measurementLayer);
        this._measurementLayer = null;

        return this;
    },

    updateMeasurements: function () {
        if (!this._measurementLayer) return this;

        let formatter, ll1, ll2, p1, p2, pixelDist, dist,
            latLngs = this.getLatLngs(),
            isPolygon = this instanceof Polygon,
            options = this._measurementOptions,
            totalDist = 0;

        // Outer ring is stored as an array in the first element, use that instead.
        if (latLngs && latLngs.length && util.isArray(latLngs[0])) {
            latLngs = latLngs[0];
        }

        this._measurementLayer.clearLayers();

        if (this._measurementOptions.showDistances && latLngs.length > 1) {
            formatter = this._measurementOptions.formatDistance || util.bind(this.formatDistance, this);

            for (let i = 1, len = latLngs.length; (isPolygon && i <= len) || i < len; i++) {
                ll1 = latLngs[i - 1];
                ll2 = latLngs[i % len];
                dist = ll1.distanceTo(ll2);
                totalDist += dist;

                p1 = this._map.latLngToLayerPoint(ll1);
                p2 = this._map.latLngToLayerPoint(ll2);

                pixelDist = p1.distanceTo(p2);

                if (pixelDist >= options.minPixelDistance) {
                    marker.measurement(
                        this._map.layerPointToLatLng([(p1.x + p2.x) / 2, (p1.y + p2.y) / 2]),
                        formatter(dist),
                        options.lang.segmentLength,
                        this._getRotation(ll1, ll2),
                        options)
                            .addTo(this._measurementLayer);
                }
            }

            // Show total length for polylines
            if (!isPolygon) {
                marker.measurement(ll2, formatter(totalDist), options.lang.totalLength, 0, options)
                    .addTo(this._measurementLayer);
            }
        }

        if (isPolygon && options.showArea && latLngs.length > 2) {
            formatter = options.formatArea || util.bind(this.formatArea, this);
            let area = ringArea(latLngs);
            
            marker.measurement(this.getBounds().getCenter(), formatter(area), options.lang.totalArea, 0, options)
                .addTo(this._measurementLayer);
        }

        return this;
    },

    onAdd: util.override(Polyline.prototype.onAdd, function (protoVal) {
        let showOnHover = this.options.measurementOptions && this.options.measurementOptions.showOnHover;
        if (this.options.showMeasurements && !showOnHover) {
            this.showMeasurements(this.options.measurementOptions);
        }

        return protoVal;
    }),

    onRemove: util.override(Polyline.prototype.onRemove, function (protoVal) {
        this.hideMeasurements();
        return protoVal;
    }, true),

    setLatLngs: util.override(Polyline.prototype.setLatLngs, function (protoVal) {
        this.updateMeasurements();
        return protoVal;
    }),

    spliceLatLngs: util.override(Polyline.prototype.spliceLatLngs, function (protoVal) {
        this.updateMeasurements();
        return protoVal;
    }),

    formatDistance: formatDistance,
    formatArea: formatArea,

    _getRotation: function (ll1, ll2) {
        let p1 = this._map.project(ll1),
            p2 = this._map.project(ll2);

        return Math.atan((p2.y - p1.y) / (p2.x - p1.x));
    }
};

Polyline.include(measureLine);

Polyline.addInitHook(function () {
    addInitHook.call(this);
});