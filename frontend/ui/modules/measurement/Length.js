import { util, factory, store, Map } from "../../../core";
import { MEASURE_LINE, PROCESS_ENUM } from '../../../config';
import { draw } from '../../../tools';

export const length = {
    type: 'Line',
    measurements: factory.layerGroup().addTo(Map),

    enable (opt = {}) {
        return this.setActiveProcess(PROCESS_ENUM.length)
            .setAutoDisable()
            .drawLine(opt);
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
        return Map.on('pm:create',e => this.disable(e)), this;
    },

    drawLine (opt) {
        return draw.line(util.assign(MEASURE_LINE, opt)), this;
    },

    finishMeasurement (e) {
        if (e && e.layer) {
            this.measurements.addLayer(e.layer);
            Map.fitBounds(e.layer.getBounds()).off('pm:create', this.disable);
        }

        return this;
    }
}