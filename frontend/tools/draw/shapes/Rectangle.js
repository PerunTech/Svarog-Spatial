import { getDrawTooltip } from '../../../config';
import { util, Map, factory } from '../../../core';
import { snap } from '../..';

export const rectangle = {
    ...snap,
    shape: 'rectangle',
    options: {},
    enabled: false,

    enable (options) {
        util.assign(this.options, options);
    
        // enable draw mode
        this.enabled = true;
    
        // create a new layergroup
        this._layerGroup = new factory.LayerGroup();
        this._layerGroup._pmTempLayer = true;
        this._layerGroup.addTo(Map);
    
        // the rectangle we want to draw
        this._layer = factory.rectangle([[0, 0], [0, 0]], this.options.pathOptions);
        this._layer._pmTempLayer = true;
    
        // this is the marker at the origin of the rectangle
        // this needs to be present, for tracking purposes, but we'll make it invisible if a user doesn't want to see it!
        this._startMarker = factory.marker([0, 0], {
            icon: factory.divIcon({ className: 'marker-icon rect-start-marker' }),
            draggable: false,
            zIndexOffset: 100,
            opacity: this.options.cursorMarker ? 1 : 0,
        });
        this._startMarker._pmTempLayer = true;
        this._layerGroup.addLayer(this._startMarker);
    
        // this is the hintmarker on the mouse cursor
        this._hintMarker = factory.marker([0, 0], {
            icon: factory.divIcon({ className: 'marker-icon cursor-marker' }),
        });
        this._hintMarker._pmTempLayer = true;
        this._layerGroup.addLayer(this._hintMarker);
    
        // add tooltip to hintmarker
        this.options.tooltips && this._hintMarker
            .bindTooltip(getDrawTooltip('firstVertex'), {
                permanent: true,
                offset: factory.point(0, 10),
                direction: 'bottom',
                opacity: 0.8,
            }).openTooltip();
    
        // show the hintmarker if the option is set
        if (this.options.cursorMarker) {
            factory.DomUtil.addClass(this._hintMarker._icon, 'visible');
    
          // Add two more matching style markers, if cursor marker is rendered
            this._styleMarkers = [];
            for (let i = 0; i < 2; i += 1) {
                const styleMarker = factory.marker([0, 0], {
                    icon: factory.divIcon({
                        className: 'marker-icon rect-style-marker',
                    }),
                    draggable: false,
                    zIndexOffset: 100,
                });
                styleMarker._pmTempLayer = true;
                this._layerGroup.addLayer(styleMarker);

                this._styleMarkers.push(styleMarker);
            }
        }
    
        // change map cursor
        Map._container.style.cursor = 'crosshair';
    
        // create a polygon-point on click
        Map.on('click', this._placeStartingMarkers, this);
    
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

    disable () {
        // cancel, if drawing mode isn't event enabled
        if (!this.enabled) {
            return;
        }
    
        this.enabled = false;
    
        // reset cursor
        Map._container.style.cursor = '';
    
        // unbind listeners
        Map.off('click', this._finishShape, this);
        Map.off('click', this._placeStartingMarkers, this);
        Map.off('mousemove', this._syncHintMarker, this);
    
        // remove helping layers
        Map.removeLayer(this._layerGroup);
    
        // fire drawend event
        Map.fire('pm:drawend', { shape: this.shape });

        // cleanup snapping
        if (this.options.snappable) {
            this._cleanupSnapping();
        }
    },

    isEnabled () { return this.enabled; },

    toggle (options) { this.isEnabled() ? this.disable() : this.enable(options); },

    _placeStartingMarkers (e) {
        // assign the coordinate of the click to the hintMarker, that's necessary for
        // mobile where the marker can't follow a cursor
        if (!this._hintMarker._snapped) {
            this._hintMarker.setLatLng(e.latlng);
        }
    
        // get coordinate for new vertex by hintMarker (cursor marker)
        const latlng = this._hintMarker.getLatLng();
    
        // show and place start marker
        factory.DomUtil.addClass(this._startMarker._icon, 'visible');
        this._startMarker.setLatLng(latlng);
    
        // if we have the other two visibilty markers, show and place them now
        if (this.options.cursorMarker && this._styleMarkers) {
            this._styleMarkers.forEach(styleMarker => {
                factory.DomUtil.addClass(styleMarker._icon, 'visible');
                styleMarker.setLatLng(latlng);
            });
        }
    
        Map.off('click', this._placeStartingMarkers, this);
        Map.on('click', this._finishShape, this);
    
        // change tooltip text
        this._hintMarker.setTooltipContent(getDrawTooltip('finishRect'));
    
        this._setRectangleOrigin();
    },

    _setRectangleOrigin () {
        const latlng = this._startMarker.getLatLng();
    
        if (latlng) {
          // show it first
            this._layerGroup.addLayer(this._layer);
            this._layer.setLatLngs([latlng, latlng]);
            this._hintMarker.on('move', this._syncRectangleSize, this);
        }
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
    },

    _syncRectangleSize() {
        // Create a box using corners A & B (A = Starting Position, B = Current Mouse Position)
        const A = this._startMarker.getLatLng();
        const B = this._hintMarker.getLatLng();
    
        this._layer.setBounds([A, B]);
    
        // Add matching style markers, if cursor marker is shown
        if (this.options.cursorMarker && this._styleMarkers) {
            const corners = this._findCorners();
            const unmarkedCorners = [];
            
            // Find two corners not currently occupied by starting marker and hint marker
            corners.forEach(corner => {
                if (
                    !corner.equals(this._startMarker.getLatLng()) &&
                    !corner.equals(this._hintMarker.getLatLng())
                ) {
                    unmarkedCorners.push(corner);
                }
            });
    
          // Reposition style markers
            unmarkedCorners.forEach((unmarkedCorner, index) => {
                this._styleMarkers[index].setLatLng(unmarkedCorner);
            });
        }
    },

    _finishShape(e) {
        // assign the coordinate of the click to the hintMarker, that's necessary for
        // mobile where the marker can't follow a cursor
        if (!this._hintMarker._snapped) {
            this._hintMarker.setLatLng(e.latlng);
        }
    
        // get coordinate for new vertex by hintMarker (cursor marker)
        const B = this._hintMarker.getLatLng();
    
        // get already placed corner from the startmarker
        const A = this._startMarker.getLatLng();
    
        // create the final rectangle layer, based on opposite corners A & B
        const rectangleLayer = factory.rectangle([A, B], this.options.pathOptions).addTo(Map)
    
        // disable drawing
        this.disable();
    
        // fire the pm:create event and pass shape and layer
        Map.fire('pm:create', {
            shape: this.shape,
            layer: rectangleLayer,
        });
    },

    _findCorners() {
        const corners = this._layer.getBounds();
    
        const northwest = corners.getNorthWest();
        const northeast = corners.getNorthEast();
        const southeast = corners.getSouthEast();
        const southwest = corners.getSouthWest();
    
        return [northwest, northeast, southeast, southwest];
    },
};