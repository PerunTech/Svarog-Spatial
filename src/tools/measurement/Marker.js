import { factory } from '../../core';

const { Marker, marker, Layer, DomUtil } = factory;

export const measureMarker = {
    options: {
        pane: 'markerPane'
    },

    initialize: function (latlng, measurement, title, rotation, options) {
        factory.setOptions(this, options);

        this._latlng = latlng;
        this._measurement = measurement;
        this._title = title;
        this._rotation = rotation;
    },

    addTo: function (map) {
        map.addLayer(this);
        return this;
    },

    onAdd: function (map) {
        this._map = map;
        let pane = this.getPane ? this.getPane() : map.getPanes().markerPane;
        let className = 'leaflet-measure-path-measurement';
        let el = this._element = DomUtil.create('div', 'leaflet-zoom-animated ' + className, pane);
        let inner = DomUtil.create('div', '', el);
        inner.title = this._title;
        inner.innerHTML = this._measurement;

        map.on('zoomanim', this._animateZoom, this);

        this._setPosition();
    },

    onRemove: function (map) {
        map.off('zoomanim', this._animateZoom, this);
        let pane = this.getPane ? this.getPane() : map.getPanes().markerPane;
        pane.removeChild(this._element);
        this._map = null;
    },

    _setPosition: function () {
        DomUtil.setPosition(this._element, this._map.latLngToLayerPoint(this._latlng));
        this._element.style.transform += ' rotate(' + this._rotation + 'rad)';
    },

    _animateZoom: function (opt) {
        let pos = this._map._latLngToNewLayerPoint(this._latlng, opt.zoom, opt.center).round();
        DomUtil.setPosition(this._element, pos);
        this._element.style.transform += ' rotate(' + this._rotation + 'rad)';
    }
};

Marker.Measurement = factory[Layer ? 'Layer' : 'Class'].extend(measureMarker);

marker.measurement = function (latLng, measurement, title, rotation, options) {
    return new Marker.Measurement(latLng, measurement, title, rotation, options);
};