import { util, factory } from '../../../core';
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
            this.layer.on(
                'pm:vertexremoved',
                this._handleSelfIntersectionOnVertexRemoval,
                this
            );
        }
    
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
    
        !this.options.allowSelfIntersection
            && this._layer.off('pm:vertexremoved', this._handleSelfIntersectionOnVertexRemoval);
    
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
}