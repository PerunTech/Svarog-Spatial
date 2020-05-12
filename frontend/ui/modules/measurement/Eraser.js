import { lengthMeasurements, area } from '../..';

export const eraser = {
    clearLength () { return lengthMeasurements.clearLayers(); },

    clearArea () { return area.measurements.clearLayers(); },

    clearMeasurements () { return this.clearLength(), this.clearArea(); }
};