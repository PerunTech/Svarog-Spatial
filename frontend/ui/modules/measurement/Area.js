import { MEASURE_LINE, PROCESS_ENUM } from '../../../config';
import { util, factory, store, Map } from "../../../core";
import { draw } from '../../../tools';

export const area = {
    type: 'Polygon',
    measurements: factory.layerGroup().addTo(Map),

    enable (opt = {}) {
        return this.setActiveProcess(PROCESS_ENUM.area)
            .setAutoDisable()
            .drawPolygon(opt);
    },

    disable (e) {
        return this.finishMeasurement(e)
            .setActiveProcess(''),
            draw.getHandler().disable();
    },

    setActiveProcess (type) {
        return store.dispatch({activeId: type}), this;
    },

    setAutoDisable () {
        return Map.on('pm:create', e => this.disable(e)), this;
    },

    drawPolygon (opt) {
        return draw.polygon(util.obj.assign(MEASURE_LINE, opt)), this;
    },

    finishMeasurement (e) {
        if (e && e.layer) {
            this.measurements.addLayer(e.layer);
            Map.fitBounds(e.layer.getBounds()).off('pm:create', this.disable);
        }

        return this;
    }
}