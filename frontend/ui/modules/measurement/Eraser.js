import { lengthMeasurements, areaMeasurements } from '../..';

export const eraser = {
    clearLength () { return lengthMeasurements.clearLayers(); },

    clearArea () { return areaMeasurements.clearLayers(); },

    clearMeasurements () { return this.clearLength(), this.clearArea(); }
};