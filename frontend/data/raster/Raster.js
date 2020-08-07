import { Map, factory } from '../../core'

export const layerControl = factory.control.layers({}, {}, {collapsed: false, position: 'right'});

export function raster (base, overlay) {
    Object.entries(base).forEach(map => layerControl.addBaseLayer(map[1], map[0]));
    Object.entries(overlay).forEach(tileLayer => layerControl.addOverlay(tileLayer[1], tileLayer[0]));

    layerControl.addTo(Map);
}

