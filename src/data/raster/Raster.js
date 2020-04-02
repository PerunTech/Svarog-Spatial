import { Map, factory } from '../../core'

// self initialize, map is already rendered due to oreder of exports in entry root
export function raster (base, overlay) {
    return factory.control.layers(base, overlay, {collapsed: false, position: 'right'}).addTo(Map);
}
