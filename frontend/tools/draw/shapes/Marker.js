import { DRAW_CONFIG, getDrawTooltip } from '../../../config';
import { factory } from '../../../core';
import { snap } from '../..';

export const marker = {
    ...snap,
    shape: 'marker',
    options: {},
    enabled: false,

    enable (opt) {
        // change enabled state, assign config.
        this.options = { ...DRAW_CONFIG, ...opt };
        this.enabled = true;
    
        // create a marker on click on the map
        this._map.on('click', this._createMarker, this);
    
        // this is the hintmarker on the mouse cursor
        this._hintMarker = factory.marker([0, 0], this.options.markerStyle);
        this._hintMarker._pmTempLayer = true;
        this._hintMarker.addTo(this._map);
    
        // add tooltip to hintmarker
        this.options.tooltips && this._hintMarker
            .bindTooltip(getDrawTooltip('placeMarker'), {
                permanent: true,
                offset: factory.point(0, 10),
                direction: 'bottom',
                opacity: 0.8,
            }).openTooltip();

        // this is just to keep the snappable mixin happy
        this._layer = this._hintMarker;
    
        // sync hint marker with mouse cursor
        this._map.on('mousemove', this._syncHintMarker, this);
    
        // fire draw_start event
        this._map.fire('draw_start', {
            shape: this.shape,
            workLayer: this._layer,
        });
    },
    
    disable () {
        // cancel, if drawing mode isn't even enabled
        if (!this.enabled) {
            return;
        }
    
        // undbind click event, don't create a marker on click anymore
        this._map.off('click', this._createMarker, this);
    
        // remove hint marker
        this._hintMarker.remove();
    
        // remove event listener to sync hint marker
        this._map.off('mousemove', this._syncHintMarker, this);
    
        // fire draw_end event
        this._map.fire('draw_end', { shape: this.shape });
    
        // cleanup snapping
        this.options.snappable && this._cleanupSnapping();
    
        // change enabled state, disable config.
        this.enabled = false;
        this.options = {}
    },

    isEnabled () { return this.enabled; },

    toggle (options) { this.isEnabled() ? this.disable() : this.enable(options); },

    _createMarker (e) {
        if (!e.latlng) {
            return;
        }
    
        // assign the coordinate of the click to the hintMarker, that's necessary for
        // mobile where the marker can't follow a cursor
        if (!this._hintMarker._snapped) {
            this._hintMarker.setLatLng(e.latlng);
        }
    
        // get coordinate for new vertex by hintMarker (cursor marker)
        const latlng = this._hintMarker.getLatLng();
    
        // create marker
        const marker = new factory.Marker(latlng, this.options.markerStyle);
    
        // add marker to the map
        marker.addTo(this._map);
    
        // fire the new_shape event and pass shape and marker
        this._map.fire('new_shape', {
            shape: this.shape,
            marker, // DEPRECATED
            layer: marker,
        });
    
        this._cleanupSnapping();
    },

    _syncHintMarker (e) {
        // move the cursor marker
        this._hintMarker.setLatLng(e.latlng);
    
        // if snapping is enabled, do it
        if (this.options.snappable) {
            const fakeDragEvent = e;
            fakeDragEvent.target = this._hintMarker;
            this._handleSnapping(fakeDragEvent);
        }
    }
};