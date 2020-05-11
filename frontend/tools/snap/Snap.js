import { util } from '../../core';

export const snap = {
    _initSnappableMarkers() {
        this.options.snapDistance = this.options.snapDistance || 30;
    
        this._assignEvents(this._markers);
    
        this._layer.off('pm:dragstart', this._unsnap, this);
        this._layer.on('pm:dragstart', this._unsnap, this);
    },

    _disableSnapping() {
        this._layer.off('pm:dragstart', this._unsnap, this);
    },

    _assignEvents(markerArr) {
        // loop through marker array and assign events to the markers
        markerArr.forEach(marker => {
          // if the marker is another array (Multipolygon stuff), recursively do this again
            if (util.isArray(marker)) {
                this._assignEvents(marker);
                return;
            }
    
            // add handleSnapping event on drag
            marker.off('drag', this._handleSnapping, this);
            marker.on('drag', this._handleSnapping, this);
            // cleanup event on dragend
            marker.off('dragend', this._cleanupSnapping, this);
            marker.on('dragend', this._cleanupSnapping, this);
        });
    },

    _unsnap() {
        // delete the last snap
        delete this._snapLatLng;
    },
    
    _cleanupSnapping() {
        // delete it, we need to refresh this with each start of a drag because
        // meanwhile, new layers could've been added to the map
        delete this._snapList;
    
        // remove map event
        this._map.off('pm:remove', this._handleSnapLayerRemoval, this);
    
        if (this.debugIndicatorLines) {
            this.debugIndicatorLines.forEach(line => {
                line.remove();
            });
        }
    },
    
    _handleSnapLayerRemoval({ layer }) {
        // find the layers index in snaplist
        const index = this._snapList.findIndex(
            e => e._leaflet_id === layer._leaflet_id
        );
        // remove it from the snaplist
        this._snapList.splice(index, 1);
    },

}