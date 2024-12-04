import L from 'leaflet';
import { Map } from '../../core';
import { util } from '../utils/Util';

L.TileLayer.ExtendedWMS = L.TileLayer.WMS.extend({

  onAdd: function (map) {
    // Triggered when the layer is added to a map.
    // Register a click listener, then do all the upstream WMS things
    L.TileLayer.WMS.prototype.onAdd.call(this, map);
    map.on('click', this.getFeatureInfo, this);
  },

  onRemove: function (map) {
    // Triggered when the layer is removed from a map.
    // Unregister a click listener, then do all the upstream WMS things
    L.TileLayer.WMS.prototype.onRemove.call(this, map);
    map.off('click', this.getFeatureInfo, this);
  },

  getTileUrl: function (coords) {
    let switchBboxOrder = false
    if (window.switchBboxOrder) {
      switchBboxOrder = window.switchBboxOrder?.toLowerCase() === 'true' ? true : false
    }
    // Check if the bounding box axis order (orientation) should be reversed
    // We need this because Leaflet also checks whether the 4326 coordinate system is used in order to reverse the order itself
    if (switchBboxOrder) {
      const tileBounds = this._tileCoordsToNwSe(coords)
      const crs = this._crs
      const bounds = L.bounds(crs.project(tileBounds[0]), crs.project(tileBounds[1]))
      const min = bounds.min
      const max = bounds.max
      const url = L.TileLayer.prototype.getTileUrl.call(this, coords);
      const bbox = [min.y, min.x, max.y, max.x].join(',')
      return url + util.getParamString(this.wmsParams, url, this.options.uppercase) + (this.options.uppercase ? '&BBOX=' : '&bbox=') + bbox;
    } else {
      // Call the Leaflet function for getting the tile URL if the order shouldn't be reversed
      return L.TileLayer.WMS.prototype.getTileUrl.call(this, coords)
    }
  },

  getFeatureInfo: function (evt) {
    this.getFeatureInfoParams(evt.latlng, this.options.callback)
  },

  getFeatureInfoParams: function (latlng, callback) {
    const point = this._map.latLngToContainerPoint(latlng, this._map.getZoom())
    const size = this._map.getSize()

    const params = {
      url: this._url,
      request: 'GetFeatureInfo',
      service: 'WMS',
      srs: this._map.options.crs.code,
      styles: this.wmsParams.styles,
      transparent: this.wmsParams.transparent,
      version: this.wmsParams.version,
      format: this.wmsParams.format,
      bbox: Map.getBBox(),
      height: size.y,
      width: size.x,
      layers: this.wmsParams.layers,
      queryLayers: this.wmsParams.layers,
      infoFormat: 'application/json'
    };

    params[params.version === '1.3.0' ? 'i' : 'x'] = point.x;
    params[params.version === '1.3.0' ? 'j' : 'y'] = point.y;

    if (callback && callback instanceof Function) {
      callback(params)
    }
  }
});

L.tileLayer.extendedWMS = function (url, options, callback) {
  return new L.TileLayer.ExtendedWMS(url, options, callback);
};
