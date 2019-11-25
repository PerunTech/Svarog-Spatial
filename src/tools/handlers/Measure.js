import { util, factory, Map } from "../../core";
import { drawHandler } from '..';
import { MEASURE_LINE } from '../../Constants';

export const measHandler = {
    length (opt = {}) {
        Map.on('pm:create', _disable);
        return drawHandler.line(util.clone(MEASURE_LINE, opt));
    },

    area (opt) {
        Map.on('pm:create', _disable);
        return drawHandler.polygon(util.clone(MEASURE_LINE, opt));
    },

    angle () { /* this is tricky */ },

    clearMeasurements () { return _measurements.clearLayers(); }
};

const _measurements = factory.layerGroup().addTo(Map);

function _disable ({layer}) {
    _measurements.addLayer(layer);
    Map.fitBounds(layer.getBounds()).off('pm:create', _disable);
}