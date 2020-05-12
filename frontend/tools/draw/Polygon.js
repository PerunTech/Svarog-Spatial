import { factory } from '../../core';
import { line } from './Line';

export const polygon = {
    ...line,
    shape: 'polygon',
    enabled: false,

    _finishShape(e) {
        // if self intersection is not allowed, do not finish the shape!
        if (!this.options.allowSelfIntersection) {
            this._handleSelfIntersection(false);
    
            if (this._doesSelfIntersect) {
                return;
            }
        }
    
        // get coordinates
        const coords = this._layer.getLatLngs();
    
        // only finish the shape if there are 3 or more vertices
        if (coords.length <= 2) {
            return;
        }
    
        // create the leaflet shape and add it to the map
        if (e && e.type === 'dblclick') {
            // Leaflet creates an extra node with double click
            coords.splice(coords.length - 1, 1);
        }
        const polygonLayer = factory.polygon(coords, this.options.pathOptions).addTo(Map);

        // disable drawing
        this.disable();
    
        // fire the pm:create event and pass shape and layer
        this._map.fire('pm:create', {
            shape: this.shape,
            layer: polygonLayer,
        });
    
        // clean up snapping states
        this._cleanupSnapping();
    
        // remove the first vertex from "other snapping layers"
        this._otherSnapLayers.splice(this._tempSnapLayerIndex, 1);
        delete this._tempSnapLayerIndex;
    },
};