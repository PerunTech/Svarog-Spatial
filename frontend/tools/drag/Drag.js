import { factory, Map, util } from '../../core';

export const drag = {
    enableLayerDrag() {
        // before enabling layer drag, disable layer editing
        this.disable();
        
        if (this._layer instanceof factory.Marker) {
            this._layer.dragging.enable();
            return;
        }

        // temporary coord variable for delta calculation
        this._tempDragCoord = null;

        // add CSS class
        const el = this._layer._path
            ? this._layer._path
            : this._layer._renderer._container;
        factory.DomUtil.addClass(el, 'leaflet-pm-draggable');

        this._originalMapDragState = Map.dragging._enabled;

        // can we reliably save the map's draggable state?
        // (if the mouse up event happens outside the container, then the map can become undraggable)
        this._safeToCacheDragState = true;

        // add mousedown event to trigger drag
        this._layer.on('mousedown', this._dragMixinOnMouseDown, this);
    },

    disableLayerDrag() {
        if (this._layer instanceof factory.Marker) {
            this._layer.dragging.disable();
            return;
        }

        // remove CSS class
        const el = this._layer._path
            ? this._layer._path
            : this._layer._renderer._container;
        factory.DomUtil.removeClass(el, 'leaflet-pm-draggable');

        // no longer save the drag state
        this._safeToCacheDragState = false;

        // disable mousedown event
        this._layer.off('mousedown', this._dragMixinOnMouseDown, this);
    },

    _dragMixinOnMouseUp() {
        const el = this._layer._path
            ? this._layer._path
            : this._layer._renderer._container;

        // re-enable map drag
        if (this._originalMapDragState) {
            Map.dragging.enable();
        }

      // if mouseup event fired, it's safe to cache the map draggable state on the next mouse down
        this._safeToCacheDragState = true;

        // clear up mousemove event
        Map.off('mousemove', this._dragMixinOnMouseMove, this);

        // clear up mouseup event
        Map.off('mouseup', this._dragMixinOnMouseUp, this);

        // if no drag happened, don't do anything
        if (!this._dragging) {
            return false;
        }

        // timeout to prevent click event after drag :-/
        // TODO: do it better as soon as leaflet has a way to do it better :-)
        window.setTimeout(() => {
          // set state
            this._dragging = false;
            factory.DomUtil.removeClass(el, 'leaflet-pm-dragging');
            
            // fire pm:dragend event
            this._layer.fire('pm:dragend');
            
            // fire edit
            this._fireEdit();
        }, 10);

        return true;
    },

    _dragMixinOnMouseMove(e) {
        const el = this._layer._path
            ? this._layer._path
            : this._layer._renderer._container;

        if (!this._dragging) {
            // set state
            this._dragging = true;
            factory.DomUtil.addClass(el, 'leaflet-pm-dragging');
            
            // bring it to front to prevent drag interception
            this._layer.bringToFront();
            
            // disbale map drag
            if (this._originalMapDragState) {
                Map.dragging.disable();
            }

            // fire pm:dragstart event
            this._layer.fire('pm:dragstart');
        }

        this._onLayerDrag(e);
    },

    _dragMixinOnMouseDown(e) {
        // cancel if mouse button is NOT the left button
        if (e.originalEvent.button > 0) {
            return;
        }
        // save current map dragging state
        if (this._safeToCacheDragState) {
            this._originalMapDragState = Map.dragging._enabled;
            
            // don't cache the state again until another mouse up is registered
            this._safeToCacheDragState = false;
        }

        // save for delta calculation
        this._tempDragCoord = e.latlng;

        Map.on('mouseup', this._dragMixinOnMouseUp, this);

        // listen to mousemove on map (instead of polygon),
        // otherwise fast mouse movements stop the drag
        Map.on('mousemove', this._dragMixinOnMouseMove, this);
    },

    dragging() {
        return this._dragging;
    },

    _onLayerDrag(e) {
        // latLng of mouse event
        const { latlng } = e;
        
        // delta coords (how far was dragged)
        const deltaLatLng = {
            lat: latlng.lat - this._tempDragCoord.lat,
            lng: latlng.lng - this._tempDragCoord.lng,
        };

      // move the coordinates by the delta
        const moveCoords = coords =>
            // alter the coordinates
            coords.map(currentLatLng => {
                if (util.isArray(currentLatLng)) {
                    // do this recursively as coords might be nested
                    return moveCoords(currentLatLng);
                }

                // move the coord and return it
                return {
                    lat: currentLatLng.lat + deltaLatLng.lat,
                    lng: currentLatLng.lng + deltaLatLng.lng,
                };
        });

        if (this._layer instanceof factory.CircleMarker) {
            // set new coordinates and redraw
            this._layer.setLatLng(latlng);
        } else {
            // create the new coordinates array
            const newCoords = moveCoords(this._layer.getLatLngs());
            
            // set new coordinates and redraw
            this._layer.setLatLngs(newCoords);
        }

        // save current latlng for next delta calculation
        this._tempDragCoord = latlng;

        // fire pm:dragstart event
        this._layer.fire('pm:drag', e);
    },
};