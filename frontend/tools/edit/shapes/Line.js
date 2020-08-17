import { util, factory, Map } from '../../../core';
import { drag, snap } from '../..';

export const line = {
    ...snap,
    ...drag,

    layer: {},
    enabled: false,
    options: {},

    enable (layer, opt) {
        // if it was already enabled, disable first
        // we don't block enabling again because new options might be passed
        this.enabled && this.disable();

        this.layer = layer;
        this.enabled= true;

        util.assign(this.options, opt);

        // init markers
        this._initMarkers();
    
        // init snap utilities
        this.options.snappable
            ? this._initSnappableMarkers()
            : this._disableSnapping();
    
        // if polygon gets removed from map, disable edit mode
        this.layer.on('remove', this._onLayerRemove, this);
    
    
        if (!this.options.allowSelfIntersection) {
            this.cachedColor = this._layer.options.color;
    
            this.isRed = false;
            this._handleLayerStyle();
        }
    },

    disable() {
        // if it's not enabled, it doesn't need to be disabled.
        if (!this.enabled || this.layer._dragging) {    //this.layer.pm._dragging
            return false;
        }

        this.layer.enabled = false;
        this.layer._markerGroup.clearLayers();
    
        // clean up draggable
        this.layer.off('mousedown');
        this.layer.off('mouseup');
    
        // remove onRemove listener
        this.layer.off('remove', this._onLayerRemove, this);
    
        // remove draggable class
        const el = this.layer._path || this._layer._renderer._container;
        factory.DomUtil.removeClass(el, 'leaflet-pm-draggable');
    
        // remove invalid class if layer has self intersection
        this.hasSelfIntersection() && factory.DomUtil.removeClass(el, 'leaflet-pm-invalid');
    
        this.layer.fire('pm:disable');
    
        this._layerEdited && this.layer.fire('pm:update', {});
        this._layerEdited = false;
    
        return true;
    },

    _initMarkers() {
        const coords = this.layer.getLatLngs();
    
        // cleanup old ones first
        this._markerGroup && this._markerGroup.clearLayers();
    
        // add markerGroup to map, markerGroup includes regular and middle markers
        this._markerGroup = new factory.LayerGroup();
        this._markerGroup._pmTempLayer = true;
    
        // handle coord-rings (outer, inner, etc)
        // if there is another coords ring, go a level deep and do this again
        const _handleRing = coordsArr => {
            util.isArray(coordsArr[0]) && coordsArr.map(_handleRing, this);
    
            // the marker array, it includes only the markers of vertexes (no middle markers)
            const ringArr = coordsArr.map(this._createMarker, this);
    
            // create small markers in the middle of the regular markers
            coordsArr.map((v, k) => {
                // find the next index fist
                const nextIndex = this.layer instanceof factory.Polygon
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
    _createMarker(latlng) {
        const marker = factory.marker(latlng, {
            draggable: true,
            icon: factory.divIcon({ className: 'marker-icon' }),
        });

        marker._pmTempLayer = true;

        marker.on('dragstart', this._onMarkerDragStart, this);
        marker.on('move', this._onMarkerDrag, this);
        marker.on('dragend', this._onMarkerDragEnd, this);

        if (!this.options.preventMarkerRemoval) {
            marker.on('contextmenu', this._removeMarker, this);
        }

        this._markerGroup.addLayer(marker);

        return marker;
    },
}