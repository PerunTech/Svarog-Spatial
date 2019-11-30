import { util, factory, Map } from "../../core";
import { drawHandler } from '..';
import { MEASURE_LINE } from '../../config';

export const measHandler = {
    length (opt = {}) {
        return Map.once('pm:create', _disable),
            drawHandler.line(util.clone(MEASURE_LINE, opt));
    },

    area (opt) {
        return Map.on('pm:create', _disable), 
            drawHandler.polygon(util.clone(MEASURE_LINE, opt));
    },

    angle () { /* this is tricky */ },

    clearMeasurements () { return _measurements.clearLayers(); }
};

const _measurements = factory.layerGroup().addTo(Map);

function _disable ({layer}) {
    return _measurements.addLayer(layer), 
        Map.fitBounds(layer.getBounds()).off('pm:create', _disable);
}