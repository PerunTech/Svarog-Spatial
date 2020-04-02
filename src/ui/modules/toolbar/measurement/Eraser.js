import { length, area } from '../..';

export const eraser = {
    clearLength () { return length.measurements.clearLayers(); },

    clearArea () { return area.measurements.clearLayers(); },

    clearMeasurements () { return this.clearLength(), this.clearArea(); }
};