import { React } from 'perun-core';
import { getProcessTitle } from '../../config';
import { Button, Icon, length, area } from '..';

/* The internal id of the process */
const _id = 'erase';

export const eraser = {
    clearLength: () =>
        (length.sum = 0, length.measurements.clearLayers()),

    clearArea: () => 
        (area.sum = 0, area.measurements.clearLayers()),

    clearMeasurements: function () {
        this.clearLength();
        this.clearArea();
    }
};

export const Eraser = (props) =>
    <Button {...props} 
        id={_id} 
        onClick={() => eraser.clearMeasurements()} >
            <Icon name={_id} size='28px' />
            <span style={{display: 'block', marginTop: '5px'}}>{getProcessTitle(_id)}</span>
    </Button>;