import { util, Map, factory } from '../../core';
import { snap } from '..';

export const marker = {
    ...snap,
    shape: 'marker',
    options: {},
    enabled: false,

    enable (options) {
        util.assign(this.options, options);

        // change enabled state
        this.enabled = true;
    
        // create a marker on click on the map
        Map.on('click', this._createMarker, this);
    
        // this is the hintmarker on the mouse cursor
        this._hintMarker = factory.marker([0, 0], this.options.markerStyle);
        this._hintMarker._pmTempLayer = true;
        this._hintMarker.addTo(Map);
    
        // add tooltip to hintmarker
        this.options.tooltips && this._hintMarker
            .bindTooltip(getTranslation('tooltips.placeMarker'), {
                permanent: true,
                offset: factory.point(0, 10),
                direction: 'bottom',
                
                opacity: 0.8,
            })
            .openTooltip();

        // this is just to keep the snappable mixin happy
        this._layer = this._hintMarker;
    
        // sync hint marker with mouse cursor
        Map.on('mousemove', this._syncHintMarker, this);
    
        // fire drawstart event
        Map.fire('pm:drawstart', {
            shape: this.shape,
            workingLayer: this._layer,
        });
    
        // enable edit mode for existing markers
        // This iteration is unacceptable, `#revise_me`
        Map.eachLayer(layer => 
            this.isRelevantMarker(layer) && layer.pm.enable());
    },
    
    disable () {
        // cancel, if drawing mode isn't even enabled
        if (!this.enabled) {
            return;
        }
    
        // undbind click event, don't create a marker on click anymore
        Map.off('click', this._createMarker, this);
    
        // remove hint marker
        this._hintMarker.remove();
    
        // remove event listener to sync hint marker
        Map.off('mousemove', this._syncHintMarker, this);
    
        // disable dragging and removing for all markers
        // This iteration is unacceptable, `#revise_me`
        Map.eachLayer(layer => 
            this.isRelevantMarker(layer) && layer.pm.disable());
    
        // fire drawend event
        Map.fire('pm:drawend', { shape: this.shape });
    
        // cleanup snapping
        this.options.snappable && this._cleanupSnapping();
    
        // change enabled state
        this.enabled = false;
    },

    isRelevantMarker: layer => layer instanceof factory.Marker && layer.pm && !layer._pmTempLayer,

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
        marker.addTo(Map);
    
        // enable editing for the marker
        marker.pm.enable();
    
        // fire the pm:create event and pass shape and marker
        Map.fire('pm:create', {
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