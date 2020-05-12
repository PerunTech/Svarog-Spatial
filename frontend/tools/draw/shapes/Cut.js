import { Map, factory } from '../../../core';
import { polygon } from './Polygon';

export const cut = {
    ...polygon,
    shape: 'cut',
    
    // #revise_me, dreadful name. cut._cut() is unacceptable.
    _cut(layer) {
        const all = Map._layers;
    
        // find all layers that intersect with `layer`, the just drawn cutting layer, #revise_me
        const layers = Object.keys(all)
            // convert object to array
            .map(l => all[l])
            // only layers handled by handler
            .filter(l => l.pm)
            // only polygons
            .filter(l => l instanceof factory.Polygon)
            // exclude the drawn one
            .filter(l => l !== layer)
            // only layers with intersections
            .filter(l => {
                try {
                    // #revise_me
                    const intersect = () => {console.log('to be implemented')}
                    return !!intersect(layer.toGeoJSON(15), l.toGeoJSON(15));
                } catch (e) {
                    /* eslint-disable-next-line no-console */
                    console.error('You cant cut polygons with self-intersections');
                    return false;
                }
            });
    
        // loop through all layers that intersect with the drawn (cutting) layer
        layers.forEach(l => {
            // #revise_me
            const difference = () => console.log('to be implemented');
            // find layer difference
            const diff = difference(l.toGeoJSON(15), layer.toGeoJSON(15));
    
            // the resulting layer after the cut
            const resultingLayer = factory.geoJSON(diff, l.options).addTo(Map);
    
            // give the new layer the original options
            resultingLayer.pm.enable(this.options);
            resultingLayer.pm.disable();

            // add templayer prop so pm:remove isn't fired
            l._pmTempLayer = true;
            layer._pmTempLayer = true;
    
            // remove old layer and cutting layer
            l.remove();
            layer.remove();
    
            if (resultingLayer.getLayers().length === 0) {
                Map.pm.removeLayer({ target: resultingLayer });
            }
    
            // fire pm:cut on the cutted layer
            l.fire('pm:cut', {
                shape: this.shape,
                layer: resultingLayer,
                originalLayer: l,
            });
    
            // fire pm:cut on the map
            Map.fire('pm:cut', {
                shape: this.shape,
                layer: resultingLayer,
                originalLayer: l,
            });
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
    
        const coords = this._layer.getLatLngs();
        const polygonLayer = factory.polygon(coords, this.options.pathOptions);
        this._cut(polygonLayer);
    
        // disable drawing
        this.disable();
    
        // clean up snapping states
        this._cleanupSnapping();
    
        // remove the first vertex from "other snapping layers"
        this._otherSnapLayers.splice(this._tempSnapLayerIndex, 1);
        delete this._tempSnapLayerIndex;
    },
};