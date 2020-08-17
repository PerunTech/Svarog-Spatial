import { util } from '../../../core';
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
    }
}