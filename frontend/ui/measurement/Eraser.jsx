import { React } from 'perun-core';
import { PROCESS_ENUM, getProcessTitle } from '../../config';
import { store } from '../../core';
import { Button, Icon, length, area } from '..';

/* The internal id of the process */
const _id = PROCESS_ENUM.erase;

export const eraser = {
    clearLength: () =>
        (length.sum = 0, length.measurements.clearLayers()),

    clearArea: () => 
        (area.sum = 0, area.measurements.clearLayers()),

    clearMeasurements: function () {
        this.clearLength();
        this.clearArea();
        store.dispatch({'Мерења': {}})
    }
};

export const Eraser = (props) =>
    <Button {...props} 
        id={_id} 
        onClick={() => eraser.clearMeasurements()} >
            <Icon name={_id} size='28px' />
            <span style={{display: 'block', marginTop: '5px'}}>{getProcessTitle(_id)}</span>
    </Button>;