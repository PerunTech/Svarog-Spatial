import { util, factory, Map } from '../../core';
import { snap } from '..';
import { markerLimits } from '../edit/util/MarkerLimits'

export const markerPoints = {
  ...snap,
  ...markerLimits,
  _layer: {},
  options: {},

  enable (layer, opt) {
    this._layer = layer;
    this.options = opt;

    // init markers
    this._initMarkers();
  },

  disable () {
    this._markerGroup.clearLayers();

    return true;
  },

  _initMarkers () {
    const coords = this._layer.getLatLngs();

    // cleanup old ones first
    // this._markerGroup && this._markerGroup.clearLayers();

    // add markerGroup to map, markerGroup includes regular and middle markers
    this._markerGroup = new factory.LayerGroup();

    // handle coord-rings (outer, inner, etc)
    // if there is another coords ring, go a level deep and do this again
    const _handleRing = coordsArr => {
      if (util.isArray(coordsArr[0])) {
        return coordsArr.map(_handleRing, this);
      }

      // the marker array, it includes only the markers of vertexes (no middle markers)
      const ringArr = coordsArr.map(this._createMarker, this);

      // create small markers in the middle of the regular markers
      coordsArr.map((v, k) => {
        // find the next index fist
        const nextIndex = this._layer instanceof factory.Polygon
          ? (k + 1) % coordsArr.length
          : k + 1;
        // create the marker
        return this._createMiddleMarker(ringArr[k], ringArr[nextIndex]);
      });

      return ringArr;
    };

    // create markers
    this._markers = _handleRing(coords);

    // handle possible limitation: maximum number of markers
    this.filterMarkerGroup();

    // add markerGroup to map
    Map.addLayer(this._markerGroup);
  },

  // creates initial markers for coordinates
  _createMarker (latlng) {
    const marker = factory.marker(latlng, {
      name: 'marker-point',
      icon: factory.divIcon({ className: 'marker-icon secondary-marker-icon' }),
    });

    this._markerGroup.addLayer(marker);

    return marker;
  },

  // creates the middle markes between coordinates
  _createMiddleMarker (leftM, rightM) {
    // cancel if there are no two markers
    if (!leftM || !rightM) {
      return false;
    }

    const latlng = this._calcMiddleLatLng(
      Map,
      leftM.getLatLng(),
      rightM.getLatLng()
    );

    const middleMarker = this._createMarker(latlng)
      .setIcon(factory.divIcon({ className: 'marker-icon secondary-marker-icon marker-icon-middle' }));

    // save reference to this middle markers on the neighboor regular markers
    leftM._middleMarkerNext = middleMarker;
    rightM._middleMarkerPrev = middleMarker;

    return middleMarker;
  }
}
