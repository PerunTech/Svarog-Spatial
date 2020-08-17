
import { util, factory, Map } from '../../../core';
import { drag, snap } from '../..';

export const marker = {
    ...snap,
    ...drag,

    layer: {},
    enabled: false,
    options: {},

    enable (layer, opt = { draggable: true }) {
        // Exit if already enabled.
        if (this.enabled) {
            return;
        }

        // init layer to be edited.
        this.layer = layer
        this.layer.on('dragend', this._onDragEnd, this);

        // merge init edit options.
        util.assign(this.options, opt);

        this.enabled = true;
    
        this.options.snappable 
            ? this._initSnappableMarkers()
            :  this._disableSnapping();

        this.options.draggable && this.layer.dragging.enable();

        // enable removal for the marker
        !this.options.preventMarkerRemoval 
            && this._layer.on('contextmenu', this._removeMarker, this);
    },

    disable() {
        this.enabled = false;
    
        // disable dragging and removal for the marker
        if (this._layer.dragging) {
            this._layer.dragging.disable();
        }
    
        this.layer.off('contextmenu', this._removeMarker, this);
        this.layer.off('dragstart', this._onPinnedMarkerDragStart, this);
        this.layer.fire('pm:disable');
    
        this._layerEdited && this.layer.fire('pm:update', {});
        this._layerEdited = false;

        this.layer = {};
    },

    _removeMarker({ target }) {
        target.remove();
        target.fire('pm:remove');
    },

    _onDragEnd({target}) {
        target.fire('pm:edit');
        this._layerEdited = true;
    },
}