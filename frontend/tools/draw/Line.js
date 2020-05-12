import { util, Map, factory } from '../../core';
import { snap } from '..';

export const line = {
    ...snap,
    shape: 'line',
    options: {},
    enabled: false,
    _doesSelfIntersect: false,

    enable(options) {
        util.assign(this.options, options);
    
        /* #revise_me, rubbish logic */
        if (this.options.finishOnDoubleClick && !this.options.finishOn) {
            this.options.finishOn = 'dblclick';
        }
    
        // enable draw mode
        this.enabled = true;
    
        // create a new layergroup
        this._layerGroup = new factory.LayerGroup();
        this._layerGroup._pmTempLayer = true;
        this._layerGroup.addTo(Map);
    
        // this is the polyLine that'll make up the polygon
        this._layer = factory.polyline([], this.options.templineStyle);
        this._layer._pmTempLayer = true;
        this._layerGroup.addLayer(this._layer);
    
        // this is the hintline from the mouse cursor to the last marker
        this._hintline = factory.polyline([], this.options.hintlineStyle);
        this._hintline._pmTempLayer = true;
        this._layerGroup.addLayer(this._hintline);
    
        // this is the hintmarker on the mouse cursor
        this._hintMarker = factory.marker(Map.getCenter(), {
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
            .bindTooltip(getTranslation('tooltips.firstVertex'), {
                permanent: true,
                offset: factory.point(0, 10),
                direction: 'bottom',
                
                opacity: 0.8,
            })
            .openTooltip();
    
        // change map cursor
        Map._container.style.cursor = 'crosshair';
    
        // create a polygon-point on click
        Map.on('click', this._createVertex, this);
    
        // finish on layer event
        // #http://leafletjs.com/reference-1.2.0.html#interactive-layer-click
        if (this.options.finishOn) {
            Map.on(this.options.finishOn, this._finishShape, this);
        }
    
        // prevent zoom on double click if finishOn is === dblclick
        if (this.options.finishOn === 'dblclick') {
            this.tempMapDoubleClickZoomState = Map.doubleClickZoom._enabled;
    
            if (this.tempMapDoubleClickZoomState) {
                Map.doubleClickZoom.disable();
            }
        }
    
        // sync hint marker with mouse cursor
        Map.on('mousemove', this._syncHintMarker, this);
    
        // sync the hintline with hint marker
        this._hintMarker.on('move', this._syncHintLine, this);
    
        // fire drawstart event
        Map.fire('pm:drawstart', {
            shape: this.shape,
            workingLayer: this._layer,
        });
    
        // an array used in the snapping mixin.
        // TODO: think about moving this somewhere else?
        this._otherSnapLayers = [];
    },

    disable() {
        // cancel, if drawing mode isn't even enabled
        if (!this._enabled) {
            return;
        }
    
        this.enabled = false;
    
        // reset cursor
        Map._container.style.cursor = '';
    
        // unbind listeners
        Map.off('click', this._createVertex, this).off('mousemove', this._syncHintMarker, this);
        if (this.options.finishOn) {
            Map.off(this.options.finishOn, this._finishShape, this);
        }
    
        if (this.tempMapDoubleClickZoomState) {
            Map.doubleClickZoom.enable();
        }
    
        // remove layer
        Map.removeLayer(this._layerGroup);
    
        // fire drawend event
        Map.fire('pm:drawend', { shape: this.shape });
    
        // cleanup snapping
        if (this.options.snappable) {
            this._cleanupSnapping();
        }
    },
};