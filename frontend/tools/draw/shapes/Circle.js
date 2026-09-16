import { getDrawTooltip } from '../../../config';
import { Map, factory } from '../../../core';
import { snap } from '../..';

export const circle = {
    ...snap,
    shape: 'circle',
    options: {},
    enabled: false,

    enable (opt) {
        this.options = opt;
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
            .bindTooltip(getDrawTooltip('startCircle'), {
                permanent: true,
                offset: factory.point(0, 10),
                direction: 'bottom',
                opacity: 0.8,
            }).openTooltip();
    
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
    
        // fire draw_start event
        Map.fire('draw_start', {
            shape: this.shape,
            workLayer: this._layer,
        });

        // an array used in the snapping mixin.
        this._otherSnapLayers = [];
    },

    disable() {
        // cancel, if drawing mode isn't event enabled
        if (!this.enabled) {
            return;
        }
    
        // reset cursor
        Map._container.style.cursor = '';
    
        // unbind listeners
        Map.off('click', this._finishShape, this);
        Map.off('click', this._placeCenterMarker, this);
        Map.off('mousemove', this._syncHintMarker, this);
    
        // remove helping layers
        Map.removeLayer(this._layerGroup);
    
        // fire draw_end event
        Map.fire('draw_end', { shape: this.shape });
    
        // cleanup snapping
        if (this.options.snappable) {
            this._cleanupSnapping();
        }

        this.options = {};
        this.enabled = false;
    },

    isEnabled () { return this.enabled; },

    toggle (options) { this.isEnabled() ? this.disable() : this.enable(options); },
    
    _syncHintLine() {
        const latlng = this._centerMarker.getLatLng();
    
        // set coords for hintline from marker to last vertex of drawin polyline
        this._hintline.setLatLngs([latlng, this._hintMarker.getLatLng()]);
    },
    
    /**
     * Grow the preview circle to the cursor.
     *
     * Bound in `_placeCircleCenter` since this tool was written, and never
     * defined -- so the handler Leaflet stored was `undefined`, the preview
     * circle stayed at the radius it was constructed with, and the only thing
     * that moved was the hintline from the centre to the cursor. Drawing a
     * circle looked like drawing its radius.
     *
     * It also threw. Leaflet keeps `{fn, ctx}` and calls `listener.fn.call(...)`
     * when the event fires, which on an undefined `fn` is
     * `Cannot read properties of undefined (reading 'call')` -- once per mouse
     * move, from the moment the centre was placed.
     */
    _syncCircleRadius() {
        const center = this._centerMarker.getLatLng();
        const latlng = this._hintMarker.getLatLng();

        this._layer.setRadius(center.distanceTo(latlng));
    },

    _syncHintMarker(e) {
        // move the cursor marker
        this._hintMarker.setLatLng(e.latlng);
    
        // if snapping is enabled, do it
        if (this.options.snappable) {
            const fakeDragEvent = e;
            fakeDragEvent.target = this._hintMarker;
            this._handleSnapping(fakeDragEvent);
        }
    },

    _placeCenterMarker(e) {
        // assign the coordinate of the click to the hintMarker, that's necessary for
        // mobile where the marker can't follow a cursor
        if (!this._hintMarker._snapped) {
            this._hintMarker.setLatLng(e.latlng);
        }
    
        // get coordinate for new vertex by hintMarker (cursor marker)
        const latlng = this._hintMarker.getLatLng();
    
        this._centerMarker.setLatLng(latlng);
    
        Map.off('click', this._placeCenterMarker, this);
        Map.on('click', this._finishShape, this);
    
        this._placeCircleCenter();
    },

    _placeCircleCenter() {
        const latlng = this._centerMarker.getLatLng();
    
        if (latlng) {
            this._layer.setLatLng(latlng);
    
            // sync the hintline with hint marker
            this._hintMarker.on('move', this._syncHintLine, this);
            this._hintMarker.on('move', this._syncCircleRadius, this);
    
            this._hintMarker.setTooltipContent(getDrawTooltip('finishCircle'));
    
            this._layer.fire('new_center', {
                shape: this.shape,
                workLayer: this._layer,
                latlng,
            });
        }
    },

    _finishShape(e) {
        // assign the coordinate of the click to the hintMarker, that's necessary for
        // mobile where the marker can't follow a cursor
        if (!this._hintMarker._snapped) {
            this._hintMarker.setLatLng(e.latlng);
        }
    
        // calc the radius
        const center = this._centerMarker.getLatLng();
        const latlng = this._hintMarker.getLatLng();
        const radius = center.distanceTo(latlng);
        const options = { ...this.options.pathOptions, radius };
    
        // create the final circle layer
        const circleLayer = factory.circle(center, options).addTo(Map);
    
        // disable drawing
        this.disable();
    
        // fire the new_shape event and pass shape and layer
        Map.fire('new_shape', {
            shape: this.shape,
            layer: circleLayer,
        });
    },

    _createMarker(latlng) {
        // create the new marker
        const marker = factory.marker(latlng, {
            draggable: false,
            icon: factory.divIcon({ className: 'marker-icon' }),
        });
        marker._pmTempLayer = true;
    
        // add it to the map
        this._layerGroup.addLayer(marker);
    
        return marker;
    }
};