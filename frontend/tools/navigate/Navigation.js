import { store, Map, factory } from '../../core';
import { draw } from '..';
import { NAVIGATE_VIEW } from '../../config';

export const navigation = {
    origin () {
        return Map.fitBounds(
            factory.boundingBox(
                store.getState().map.origin)
        );
    },

    point () {
        console.log('go to location')
    },

    boxZoom () {
        Map.on('pm:create', function fn ({layer}) {
            Map.fitBounds(layer.getBounds()).off('pm:create', fn).removeLayer(layer);
        });

        return draw.rectangle.enable(NAVIGATE_VIEW);
    },

    search () {}
}