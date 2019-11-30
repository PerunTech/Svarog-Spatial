import { store, Map, factory } from '../../core';
import { drawHandler } from '..';
import { NAVIGATE_VIEW } from '../../Constants';

export const navHandler = {
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

        return drawHandler.rectangle(NAVIGATE_VIEW);
    }
}

