import { Map, factory } from '../../core'
import { layerControl } from '..';

export let layerList = {};

export function raster (base, overlay) {
    layerList = layerControl(base, overlay, {collapsed: false, position: 'right'}).addTo(Map);
}

