import L from 'leaflet';
import { Map, http } from '../../core';

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

  getFeatureInfo: function (evt) {
    const url = this.getFeatureInfoUrl(evt.latlng)
    http.call('getFeatureInfo', { url, method: 'get' }).then(res => {
      if (res.data) {
        if (this.options.callback && this.options.callback instanceof Function) {
          this.options.callback(res.data)
        }
      }
    }).catch(err => {
      console.error(err)
    })
  },

  getFeatureInfoUrl: function (latlng) {
    // Construct a GetFeatureInfo request URL given a point
    const point = this._map.latLngToContainerPoint(latlng, this._map.getZoom())
    const size = this._map.getSize()

    const params = {
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
      query_layers: this.wmsParams.layers,
      info_format: 'application/json'
    };

    params[params.version === '1.3.0' ? 'i' : 'x'] = point.x;
    params[params.version === '1.3.0' ? 'j' : 'y'] = point.y;

    return this._url + L.Util.getParamString(params, this._url, true);
  }
});

L.tileLayer.betterWms = function (url, options, callback) {
  return new L.TileLayer.ExtendedWMS(url, options, callback);
};
