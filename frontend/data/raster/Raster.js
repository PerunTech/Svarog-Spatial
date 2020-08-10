import { Map, factory } from '../../core'

export let layerControl = {};

export function raster (base, overlay) {
    layerControl = factory.control.layers(base, overlay, {collapsed: false, position: 'right'}).addTo(Map);
}

