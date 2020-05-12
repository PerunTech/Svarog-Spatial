import { getDrawTooltip } from '../../../config';
import { util, factory, Map } from '../../../core';
import { marker } from './Marker';

export const circleMarker = {
    ...marker,
    shape: 'circleMarker',
    options: {},
    enabled: false,

    enable(options) {
        util.assign(this.options, options);
    
        // change enabled state
        this.enabled = true;
    
        // create a marker on click on the map
        Map.on('click', this._createMarker, this);
    
        // this is the hintmarker on the mouse cursor
        this._hintMarker = factory.circleMarker([0, 0], this.options.templineStyle);
        this._hintMarker._pmTempLayer = true;
        this._hintMarker.addTo(Map);
    
        // add tooltip to hintmarker
        this.options.tooltips && this._hintMarker
            .bindTooltip(getDrawTooltip('placeCircleMarker'), {
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

    isRelevantMarker: layer => 
        layer instanceof factory.CircleMarker 
        && !(layer instanceof factory.Circle) 
        && layer.pm 
        && !layer._pmTempLayer,
    
    _createMarker(e) {
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
        const marker = factory.circleMarker(latlng, this.options.pathOptions);
    
        // add marker to the map
        marker.addTo(Map);
    
        // enable editing for the marker
        marker.pm.enable();
    
        // fire the pm:create event and pass shape and marker
        Map.fire('pm:create', {
            shape: this._shape,
            marker, // DEPRECATED
            layer: marker,
        });
    
        this._cleanupSnapping();
    }
};