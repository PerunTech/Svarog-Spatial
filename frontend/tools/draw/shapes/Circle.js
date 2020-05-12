import { util, Map, factory } from '../../../core';
import { snap } from '../..';

export const circle = {
    ...snap,
    shape: 'circle',
    options: {},
    enabled: false,

    enable(options) {
        util.assign(this.options, options);
        this.options.radius = 0;
    
        // enable draw mode
        this.enabled = true;
    
        // create a new layergroup
        this._layerGroup = new factory.LayerGroup();
        this._layerGroup._pmTempLayer = true;
        this._layerGroup.addTo(Map);
    
        // this is the circle we want to draw
        this._layer = factory.circle([0, 0], this.options.templineStyle);
        this._layer._pmTempLayer = true;
        this._layerGroup.addLayer(this._layer);
    
        // this is the marker in the center of the circle
        this._centerMarker = factory.marker([0, 0], {
            icon: factory.divIcon({ className: 'marker-icon' }),
            draggable: false,
            zIndexOffset: 100,
        });
        this._centerMarker._pmTempLayer = true;
        this._layerGroup.addLayer(this._centerMarker);
    
        // this is the hintmarker on the mouse cursor
        this._hintMarker = factory.marker([0, 0], {
            icon: factory.divIcon({ className: 'marker-icon cursor-marker' }),
        });
        this._hintMarker._pmTempLayer = true;
        this._layerGroup.addLayer(this._hintMarker);
    
        // show the hintmarker if the option is set
        if (this.options.cursorMarker) {
            factory.DomUtil.addClass(this._hintMarker._icon, 'visible');
        }
    
        // add tooltip to hintmarker
        this.options.tooltips && this._hintMarker
            .bindTooltip(getTranslation('tooltips.startCircle'), {
                permanent: true,
                offset: factory.point(0, 10),
                direction: 'bottom',
                
                opacity: 0.8,
            })
            .openTooltip();
    
        // this is the hintline from the hint marker to the center marker
        this._hintline = factory.polyline([], this.options.hintlineStyle);
        this._hintline._pmTempLayer = true;
        this._layerGroup.addLayer(this._hintline);
    
        // change map cursor
        Map._container.style.cursor = 'crosshair';
    
        // create a polygon-point on click
        Map.on('click', this._placeCenterMarker, this);
    
        // sync hint marker with mouse cursor
        Map.on('mousemove', this._syncHintMarker, this);
    
        // fire drawstart event
        Map.fire('pm:drawstart', {
            shape: this.shape,
            workingLayer: this._layer,
        });

        // an array used in the snapping mixin.
        this._otherSnapLayers = [];
    },
};