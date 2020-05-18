import { getDrawTooltip } from '../../../config';
import { util, Map, factory } from '../../../core';
import { snap } from '../..';

export const line = {
    ...snap,
    shape: 'line',
    options: {},
    enabled: false,
    _doesSelfIntersect: false,

    enable (options) {
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
            .bindTooltip(getDrawTooltip('firstVertex'), {
                permanent: true,
                offset: factory.point(0, 10),
                direction: 'bottom',
                opacity: 0.8,
            }).openTooltip();
    
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
    
        // fire draw_start event
        Map.fire('draw_start', {
            shape: this.shape,
            workLayer: this._layer,
            hintLayer: this._hintline,
        });
    
        // an array used in the snapping mixin.
        // TODO: think about moving this somewhere else?
        this._otherSnapLayers = [];
    },

    disable (force) {
        // cancel, if drawing mode isn't even enabled
        if (!this.enabled) {
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
    
        // fire draw_end event
        Map.fire('draw_end', { shape: this.shape });
    
        // cleanup snapping
        if (this.options.snappable) {
            this._cleanupSnapping();
        }

        (this.options.repeatable && !force) && this.enable(this.options);
    },

    isEnabled () { return this.enabled; },

    toggle (options) { this.isEnabled() ? this.disable() : this.enable(options); },

    /* #revise_me */
    hasSelfIntersection () { (console.log('isSelfIntersecting to be implemented.'), {features: []}) },

    _syncHintLine() {
        const polyPoints = this._layer.getLatLngs();
    
        if (polyPoints.length > 0) {
            const lastPolygonPoint = polyPoints[polyPoints.length - 1];
            // set coords for hintline from marker to last vertex of drawin polyline
            this._hintline.setLatLngs([ lastPolygonPoint, this._hintMarker.getLatLng() ]);
        }
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
    
        // if self-intersection is forbidden, handle it
        if (!this.options.allowSelfIntersection) {
            this._handleSelfIntersection(true, e.latlng);
        }
    },

    _handleSelfIntersection(addVertex, latlng) {
        // ok we need to check the self intersection here
        // problem: during draw, the marker on the cursor is not yet part
        // of the layer. So we need to clone the layer, add the
        // potential new vertex (cursor markers latlngs) and check the self
        // intersection on the clone.
    
        // clone layer (polyline is enough, even when it's a polygon)
        const clone = factory.polyline(this._layer.getLatLngs());
    
        if (addVertex) {
          // get vertex from param or from hintmarker
            if (!latlng) {
                latlng = this._hintMarker.getLatLng();
            }
    
            // add the vertex
            clone.addLatLng(latlng);
        }
    
        // check the self intersection
        const selfIntersection = (console.log('isSelfIntersecting to be implemented.'), {features: []});
        this._doesSelfIntersect = selfIntersection.features.length > 0;
    
        // change the style based on self intersection
        if (this._doesSelfIntersect) {
            this._hintline.setStyle({
                color: 'red',
            });
        } else if (!this._hintline.isEmpty()) {
            this._hintline.setStyle(this.options.hintlineStyle);
        }
    },

    _removeLastVertex() {
        // remove last coords
        const coords = this._layer.getLatLngs();
        const removedCoord = coords.pop();
    
        // if all coords are gone, cancel drawing
        if (coords.length < 1) {
            this.disable();
            return;
        }
    
        // find corresponding marker
        const marker = this._layerGroup
            .getLayers()
            .filter(l => l instanceof factory.Marker)
            .filter(l => !factory.DomUtil.hasClass(l._icon, 'cursor-marker'))
            .find(l => l.getLatLng() === removedCoord);
    
        // remove that marker
        this._layerGroup.removeLayer(marker);
    
        // update layer with new coords
        this._layer.setLatLngs(coords);
    
        // sync the hintline again
        this._syncHintLine();
    },

    _createVertex(e) {
        // don't create a vertex if we have a selfIntersection and it is not allowed
        if (!this.options.allowSelfIntersection) {
            this._handleSelfIntersection(true, e.latlng);
    
            if (this._doesSelfIntersect) {
                return;
            }
        }
    
        // assign the coordinate of the click to the hintMarker, that's necessary for
        // mobile where the marker can't follow a cursor
        if (!this._hintMarker._snapped) {
            this._hintMarker.setLatLng(e.latlng);
        }
    
        // get coordinate for new vertex by hintMarker (cursor marker)
        const latlng = this._hintMarker.getLatLng();
    
        // check if the first and this vertex have the same latlng
        if (latlng.equals(this._layer.getLatLngs()[0])) {
            // yes? finish the polygon
            this._finishShape(e);
    
            // "why?", you ask? Because this happens when we snap the last vertex to the first one
            // and then click without hitting the last marker. Click happens on the map
            // in 99% of cases it's because the user wants to finish the polygon. So...
            return;
        }
    
        // is this the first point?
        const first = this._layer.getLatLngs().length === 0;
    
        this._layer.setLatLngs([...this._layer.getLatLngs(), latlng]);
        const newMarker = this._createMarker(latlng, first);
    
        this._hintline.setLatLngs([latlng, latlng]);
    
        this._layer.fire('new_vertex', {
            shape: this.shape,
            workLayer: this._layer,
            hintLayer: this._hintline,
            marker: newMarker,
            latlng,
        });
    },

    _finishShape() {
        // if self intersection is not allowed, do not finish the shape!
        if (!this.options.allowSelfIntersection) {
            this._handleSelfIntersection(false);
    
            if (this._doesSelfIntersect) {
                return;
            }
        }
    
        // get coordinates
        const coords = this._layer.getLatLngs();
    
        // if there is only one coords, don't finish the shape!
        if (coords.length <= 1) {
            return;
        }
    
        // create the leaflet shape and add it to the map
        const polylineLayer = factory.polyline(coords, this.options.pathOptions).addTo(Map);
    
        /* Disable drawing. Keep this line above the 'create' event fire,
        callers that listen to the event may re-enable drawing. */
        this.disable();
    
        // fire the new_shape event and pass shape and layer
        Map.fire('new_shape', {
            shape: this.shape,
            layer: polylineLayer,
        });
    
        if (this.options.snappable) {
            this._cleanupSnapping();
        }
    },

    _createMarker(latlng, first) {
        // create the new marker
        const marker = factory.marker(latlng, {
            draggable: false,
            icon: factory.divIcon({ className: 'marker-icon' }),
        });
        marker._pmTempLayer = true;
    
        // add it to the map
        this._layerGroup.addLayer(marker);
    
        // a click on any marker finishes this shape
        marker.on('click', this._finishShape, this);
    
        // handle tooltip text
        first && this._hintMarker.setTooltipContent(getDrawTooltip('continueLine'));
        
        this._layer.getLatLngs().length === 2 
            && this._hintMarker.setTooltipContent(getDrawTooltip('finishLine'));
    
        return marker;
    },
};