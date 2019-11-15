import { store, Map, factory } from '../core';

export const navTools = {
    origin () {
        return Map.fitBounds(
            factory.boundingBox(
                store.getState().map.origin)
        );
    },

    location () {
        console.log('go to location')
    },

    view () {
        console.log('go to view');
    }
}

