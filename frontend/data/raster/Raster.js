import { Map, store } from '../../core'
import { layerControl } from '..';

export let layerList = {};

export function raster (base, overlay) {
    layerList = layerControl(base, overlay, store.getState().layerList).addTo(Map);
}

