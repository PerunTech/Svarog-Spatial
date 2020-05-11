import { util, factory } from '../../core';

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

    _handleSnapping(e) {
        function throttledList() {
            return util.throttle(this._createSnapList, 100, this);
        }
    
        // if snapping is disabled via holding ALT during drag, stop right here
        if (e.originalEvent.altKey) {
            return false;
        }
    
        // create a list of layers that the marker could snap to
        // this isn't inside a movestart/dragstart callback because middlemarkers are initialized
        // after dragstart/movestart so it wouldn't fire for them
        if (this._snapList === undefined) {
            this._createSnapList();
    
            // re-create the snaplist again when a layer is added during draw
            this._map.off('layeradd', throttledList, this);
            this._map.on('layeradd', throttledList, this);
        }
    
        // if there are no layers to snap to, stop here
        if (this._snapList.length <= 0) {
            return false;
        }
    
        const marker = e.target;
    
        // get the closest layer, it's closest latlng, segment and the distance
        const closestLayer = this._calcClosestLayer(
            marker.getLatLng(),
            this._snapList
        );
    
        const isMarker =
            closestLayer.layer instanceof factory.Marker ||
            closestLayer.layer instanceof factory.CircleMarker;
    
        // find the final latlng that we want to snap to
        let snapLatLng = !isMarker
            ? this._checkPrioritiySnapping(closestLayer)
            : closestLayer.latlng;
    
        // minimal distance before marker snaps (in pixels)
        const minDistance = this.options.snapDistance;
    
        // event info for pm:snap and pm:unsnap
        const eventInfo = {
            marker,
            snapLatLng,
            segment: closestLayer.segment,
            layer: this._layer,
            layerInteractedWith: closestLayer.layer, // for lack of a better property name
            distance: closestLayer.distance,
        };
    
        eventInfo.marker.fire('pm:snapdrag', eventInfo);
        this._layer.fire('pm:snapdrag', eventInfo);
    
        if (closestLayer.distance < minDistance) {
            // snap the marker
            marker.setLatLng(snapLatLng);
    
            marker._snapped = true;
    
            const triggerSnap = () => {
                this._snapLatLng = snapLatLng;
                marker.fire('pm:snap', eventInfo);
                this._layer.fire('pm:snap', eventInfo);
            };
    
            // check if the snapping position differs from the last snap
            const a = this._snapLatLng || {};
            const b = snapLatLng || {};
    
            if (a.lat !== b.lat || a.lng !== b.lng) {
                triggerSnap();
            }
        } else if (this._snapLatLng) {
          // no more snapping
    
            // if it was previously snapped...
            // ...unsnap
            this._unsnap(eventInfo);
    
            marker._snapped = false;
    
            // and fire unsnap event
            eventInfo.marker.fire('pm:unsnap', eventInfo);
            this._layer.fire('pm:unsnap', eventInfo);
        }

        return true;
    },

}